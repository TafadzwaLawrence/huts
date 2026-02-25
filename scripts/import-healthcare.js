/**
 * Import Zimbabwe Healthcare Facilities Data
 * Run after migration 022_healthcare_facilities.sql
 * 
 * Usage: node scripts/import-healthcare.js
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idhcvldxyhfjzytswomo.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.error('Get it from: https://supabase.com/dashboard/project/idhcvldxyhfjzytswomo/settings/api')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const CSV_PATH = path.join(process.cwd(), 'zwe_healthcare_facilities-1758397529.csv')

function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',')
  const facilities = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',')
    
    const facility = {
      source_id1: parseInt(values[0]) || null,
      source_id: parseInt(values[1]) || null,
      province: values[2]?.trim() || null,
      district: values[3]?.trim() || null,
      longitude: parseFloat(values[4]) || null,
      latitude: parseFloat(values[5]) || null,
      elevation: parseInt(values[6]) || null,
      year_updated: parseInt(values[7]) || null,
      name: values[8]?.trim() || null,
      ownership_code: parseInt(values[9]) || null,
      year_built: parseInt(values[10]) || null,
      facility_type: values[11]?.trim() || null,
    }

    // Skip if missing critical data
    if (!facility.name || !facility.latitude || !facility.longitude) {
      console.warn(`⚠️  Skipping row ${i}: Missing critical data`)
      continue
    }

    facilities.push(facility)
  }

  return facilities
}

async function importData() {
  console.log('📁 Reading CSV file...')
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  
  console.log('📊 Parsing CSV data...')
  const facilities = parseCSV(csvContent)
  console.log(`✅ Parsed ${facilities.length} healthcare facilities`)

  console.log('\n🗑️  Clearing existing data...')
  const { error: deleteError } = await supabase
    .from('healthcare_facilities')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError && deleteError.code !== 'PGRST116') {
    console.error('❌ Error clearing data:', deleteError)
  }

  console.log('\n📤 Uploading facilities in batches...')
  const BATCH_SIZE = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < facilities.length; i += BATCH_SIZE) {
    const batch = facilities.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabase
      .from('healthcare_facilities')
      .insert(batch)

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`\r✅ Inserted ${inserted} / ${facilities.length} facilities`)
    }
  }

  console.log('\n\n📊 Import Summary:')
  console.log(`   Total in CSV: ${facilities.length}`)
  console.log(`   Successfully inserted: ${inserted}`)
  console.log(`   Errors: ${errors}`)

  if (errors === 0) {
    console.log('\n✅ All healthcare facilities imported successfully!')
  }

  console.log('\n🔍 Verifying import...')
  const { count } = await supabase
    .from('healthcare_facilities')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Total facilities in database: ${count}`)

  // Show sample by province
  console.log('\n📍 Facilities by province:')
  const { data: provinces } = await supabase
    .rpc('get_healthcare_stats_by_province')
    .order('count', { ascending: false })

  if (!provinces) {
    // Manual query if RPC doesn't exist
    const { data: stats } = await supabase
      .from('healthcare_facilities')
      .select('province')

    const provinceCount = {}
    stats?.forEach(row => {
      provinceCount[row.province] = (provinceCount[row.province] || 0) + 1
    })

    Object.entries(provinceCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([province, count]) => {
        console.log(`   ${province}: ${count}`)
      })
  } else {
    provinces.forEach(p => {
      console.log(`   ${p.province}: ${p.count}`)
    })
  }
}

// Run import
importData()
  .then(() => {
    console.log('\n✅ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  })
