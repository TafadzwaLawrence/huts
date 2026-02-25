/**
 * Generate Healthcare Facilities SQL Seeder
 * Converts CSV to SQL INSERT statements for Supabase
 * 
 * Usage: node scripts/generate-healthcare-seeder.js
 */

import fs from 'fs'
import path from 'path'

const CSV_PATH = path.join(process.cwd(), 'zwe_healthcare_facilities-1758397529.csv')
const OUTPUT_DIR = path.join(process.cwd(), 'supabase', 'migrations')

function parseCSV(content) {
  const lines = content.split('\n')
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

function escapeSQL(value) {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'number') {
    return value
  }
  // Escape single quotes by doubling them
  return `'${String(value).replace(/'/g, "''")}'`
}

function generateSQLInserts(facilities, startIndex, endIndex) {
  const chunk = facilities.slice(startIndex, endIndex)
  const inserts = []

  for (const facility of chunk) {
    // Handle missing facility_type by using 'Unknown'
    const facilityType = facility.facility_type || 'Unknown'
    
    const insert = `INSERT INTO healthcare_facilities (source_id1, source_id, province, district, longitude, latitude, elevation, year_updated, name, ownership_code, year_built, facility_type) VALUES (${escapeSQL(facility.source_id1)}, ${escapeSQL(facility.source_id)}, ${escapeSQL(facility.province)}, ${escapeSQL(facility.district)}, ${escapeSQL(facility.longitude)}, ${escapeSQL(facility.latitude)}, ${escapeSQL(facility.elevation)}, ${escapeSQL(facility.year_updated)}, ${escapeSQL(facility.name)}, ${escapeSQL(facility.ownership_code)}, ${escapeSQL(facility.year_built)}, ${escapeSQL(facilityType)});`
    inserts.push(insert)
  }

  return inserts.join('\n')
}

function generateSeederFiles() {
  console.log('📁 Reading CSV file...')
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  
  console.log('📊 Parsing CSV data...')
  const facilities = parseCSV(csvContent)
  console.log(`✅ Parsed ${facilities.length} healthcare facilities`)

  // Split into 2 parts (roughly 850 per file for better management)
  const CHUNK_SIZE = 850
  const parts = Math.ceil(facilities.length / CHUNK_SIZE)

  console.log(`\n📝 Generating ${parts} SQL seeder files...`)

  for (let i = 0; i < parts; i++) {
    const startIndex = i * CHUNK_SIZE
    const endIndex = Math.min((i + 1) * CHUNK_SIZE, facilities.length)
    const partLabel = String.fromCharCode(97 + i) // 'a', 'b', 'c'...
    
    const header = `-- Healthcare Facilities Data Seeder - Part ${i + 1}/${parts}
-- Records ${startIndex + 1} to ${endIndex} of ${facilities.length}
-- Run AFTER 022_healthcare_facilities.sql
-- Generated: ${new Date().toISOString().split('T')[0]}

-- Disable triggers for faster import
SET session_replication_role = 'replica';

`

    const footer = `
-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify count for this part
DO $$
DECLARE
  facility_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO facility_count FROM healthcare_facilities;
  RAISE NOTICE 'Total healthcare facilities after part ${i + 1}: %', facility_count;
END $$;
`

    const sqlContent = header + generateSQLInserts(facilities, startIndex, endIndex) + footer
    
    const filename = `022_healthcare_data_part_${partLabel}.sql`
    const filepath = path.join(OUTPUT_DIR, filename)
    
    fs.writeFileSync(filepath, sqlContent, 'utf-8')
    console.log(`✅ Generated ${filename} (${endIndex - startIndex} records)`)
  }

  // Generate import order script
  let importScript = `#!/bin/bash
# Quick script to display import order

echo "🏥 HEALTHCARE FACILITIES MIGRATION - IMPORT ORDER"
echo "=================================================="
echo ""
echo "Run these files IN ORDER in Supabase SQL Editor:"
echo ""
echo "1️⃣  022_healthcare_facilities.sql      (FIRST - creates table & functions)"
`

  for (let i = 0; i < parts; i++) {
    const partLabel = String.fromCharCode(97 + i)
    const startIndex = i * CHUNK_SIZE
    const endIndex = Math.min((i + 1) * CHUNK_SIZE, facilities.length)
    const count = endIndex - startIndex
    importScript += `echo "${i + 2}️⃣  022_healthcare_data_part_${partLabel}.sql   (Part ${i + 1}/${parts} - ${count} facilities)"\n`
  }

  importScript += `echo ""
echo "=================================================="
echo "Total: ${facilities.length} healthcare facilities across Zimbabwe"
echo ""
echo "After import, verify with:"
echo "  SELECT COUNT(*) FROM healthcare_facilities;"
echo "  -- Should return: ${facilities.length}"
`

  const scriptPath = path.join(OUTPUT_DIR, 'healthcare_import_order.sh')
  fs.writeFileSync(scriptPath, importScript, 'utf-8')
  fs.chmodSync(scriptPath, '755')
  console.log(`✅ Generated healthcare_import_order.sh`)

  console.log('\n✅ All seeder files generated successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`   Total facilities: ${facilities.length}`)
  console.log(`   SQL files: ${parts}`)
  console.log(`   Location: ${OUTPUT_DIR}`)
  console.log(`\n📝 Next steps:`)
  console.log(`   1. Run ./supabase/migrations/healthcare_import_order.sh to see import order`)
  console.log(`   2. Or check HEALTHCARE_SYSTEM.md for instructions`)
}

// Run generator
try {
  generateSeederFiles()
  console.log('\n✅ Healthcare seeder generation complete!')
} catch (error) {
  console.error('\n❌ Error generating seeders:', error)
  process.exit(1)
}
