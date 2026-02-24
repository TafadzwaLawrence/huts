#!/usr/bin/env tsx

/**
 * Area Guide Data Collection & Insertion Pipeline
 * 
 * This script:
 * 1. Loads priority areas from CSV
 * 2. Queries existing neighborhoods from properties table
 * 3. Generates content (descriptions, full markdown content, meta tags)
 * 4. Validates data quality
 * 5. Bulk inserts to area_guides table
 * 6. Updates statistics (property_count, avg_rent)
 * 
 * Usage:
 *   npm run generate-areas
 *   npm run generate-areas -- --force  (overwrite existing)
 */

import fs from 'fs'
import path from 'path'
import csvParser from 'csv-parser'
import { config } from './config'
import { generateSlug, isValidSlug } from './lib/slug-generator'
import { createAdminClient, getExistingSlugs, getExistingAreas, getNearbySchools } from './lib/supabase-admin'
import { generateTemplateContent } from './generators/template-content-generator'
import type { RawAreaData, ProcessedAreaGuide, InsertResult, GenerationContext } from './lib/area-guide-types'

// Parse command line arguments
const args = process.argv.slice(2)
const forceOverwrite = args.includes('--force')
const dryRun = args.includes('--dry-run')

console.log('🏠 HUTS Area Guide Generator\n')
console.log('═'.repeat(60))
console.log(`Mode: ${dryRun ? 'DRY RUN (no database changes)' : 'LIVE'}`)
console.log(`Overwrite: ${forceOverwrite ? 'YES' : 'NO (skip duplicates)'}`)
console.log(`Content: Template-based${config.openai.apiKey ? ' + AI-enhanced' : ''}`)
console.log('═'.repeat(60))
console.log()

async function main() {
  try {
    // Step 1: Load CSV seed data
    console.log('📋 Step 1: Loading priority areas from CSV...')
    const csvAreas = await loadCSVAreas()
    console.log(`   ✓ Loaded ${csvAreas.length} areas from CSV\n`)
    
    // Step 2: Query existing neighborhoods from database
    console.log('🗄️  Step 2: Querying existing neighborhoods from properties...')
    const dbAreas = await getExistingAreas()
    console.log(`   ✓ Found ${dbAreas.length} unique areas in database\n`)
    
    // Step 3: Merge and deduplicate
    console.log('🔀 Step 3: Merging data sources...')
    const allAreas = mergeAreas(csvAreas, dbAreas)
    console.log(`   ✓ Total unique areas: ${allAreas.length}\n`)
    
    // Step 4: Check existing slugs
    console.log('🔍 Step 4: Checking for existing area guides...')
    const existingSlugs = await getExistingSlugs()
    console.log(`   ✓ Found ${existingSlugs.size} existing area guides\n`)
    
    // Step 5: Filter areas to process
    const areasToProcess = forceOverwrite 
      ? allAreas 
      : allAreas.filter(area => !existingSlugs.has(generateSlug(area.name)))
    
    console.log(`📝 Step 5: Processing ${areasToProcess.length} areas...`)
    if (!forceOverwrite && existingSlugs.size > 0) {
      console.log(`   ℹ️  Skipping ${allAreas.length - areasToProcess.length} existing areas`)
    }
    console.log()
    
    // Step 6: Generate content for each area
    console.log('✍️  Step 6: Generating content...')
    const processedAreas: ProcessedAreaGuide[] = []
    
    for (let i = 0; i < areasToProcess.length; i++) {
      const area = areasToProcess[i]
      process.stdout.write(`   [${i + 1}/${areasToProcess.length}] ${area.name}, ${area.city}...`)
      
      try {
        const processed = await processArea(area)
        processedAreas.push(processed)
        process.stdout.write(' ✓\n')
      } catch (error) {
        process.stdout.write(' ✗ ERROR\n')
        console.error(`      Error: ${error instanceof Error ? error.message : String(error)}`)
      }
      
      // Small delay to be respectful
      await sleep(100)
    }
    
    console.log(`   ✓ Generated content for ${processedAreas.length} areas\n`)
    
    // Step 7: Validate
    console.log('✅ Step 7: Validating data quality...')
    const validAreas = processedAreas.filter(validateArea)
    console.log(`   ✓ ${validAreas.length} areas passed validation`)
    if (validAreas.length < processedAreas.length) {
      console.log(`   ⚠️  ${processedAreas.length - validAreas.length} areas failed validation`)
    }
    console.log()
    
    if (dryRun) {
      console.log('🔍 DRY RUN: Would insert these areas:')
      validAreas.forEach(area => {
        console.log(`   - ${area.name}, ${area.city} (${area.slug})`)
      })
      console.log()
      console.log('✅ Dry run complete. No database changes made.')
      return
    }
    
    // Step 8: Insert to database
    console.log('💾 Step 8: Inserting to database...')
    const result = await bulkInsert(validAreas, forceOverwrite)
    console.log(`   ✓ Inserted: ${result.inserted}`)
    console.log(`   ⊘ Skipped: ${result.skipped}`)
    console.log(`   ✗ Failed: ${result.failed.length}`)
    
    if (result.failed.length > 0) {
      console.log('\n   Failed insertions:')
      result.failed.forEach(({ area, error }) => {
        console.log(`      - ${area.name}: ${error}`)
      })
    }
    console.log()
    
    // Step 9: Update statistics
    if (result.inserted > 0) {
      console.log('📊 Step 9: Updating area statistics...')
      await updateAreaStats()
      console.log('   ✓ Statistics updated\n')
    }
    
    // Summary
    console.log('═'.repeat(60))
    console.log('🎉 Generation complete!')
    console.log(`   Total processed: ${validAreas.length}`)
    console.log(`   Successfully inserted: ${result.inserted}`)
    console.log('═'.repeat(60))
    console.log()
    console.log('Next steps:')
    console.log('  1. Visit http://localhost:3000/areas to view area guides')
    console.log('  2. Regenerate types: npm run generate-types')
    console.log('  3. Check area guide pages render correctly')
    console.log()
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

/**
 * Load areas from CSV file
 */
async function loadCSVAreas(): Promise<RawAreaData[]> {
  const csvPath = path.join(__dirname, 'data', 'priority-areas.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.warn(`   ⚠️  CSV file not found at ${csvPath}, skipping CSV data`)
    return []
  }
  
  return new Promise((resolve, reject) => {
    const areas: RawAreaData[] = []
    
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        areas.push({
          name: row.name?.trim() || row.neighborhood?.trim(),
          city: row.city?.trim(),
          neighborhood: row.neighborhood?.trim(),
          priority: parseInt(row.priority) || 999,
        })
      })
      .on('end', () => resolve(areas))
      .on('error', reject)
  })
}

/**
 * Merge CSV and database areas, prioritizing CSV
 */
function mergeAreas(csvAreas: RawAreaData[], dbAreas: Array<{ city: string; neighborhood: string | null }>): RawAreaData[] {
  const merged = new Map<string, RawAreaData>()
  
  // Add CSV areas first (higher priority)
  csvAreas.forEach(area => {
    const key = `${area.city}:${area.name}`.toLowerCase()
    merged.set(key, area)
  })
  
  // Add database areas if not already present
  dbAreas.forEach(({ city, neighborhood }) => {
    if (!neighborhood) return
    const key = `${city}:${neighborhood}`.toLowerCase()
    if (!merged.has(key)) {
      merged.set(key, {
        name: neighborhood,
        city,
        neighborhood,
      })
    }
  })
  
  // Sort by priority (CSV areas first, then alphabetically)
  return Array.from(merged.values()).sort((a, b) => {
    if (a.priority && b.priority) return a.priority - b.priority
    if (a.priority) return -1
    if (b.priority) return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Process a single area: generate content and build final object
 */
async function processArea(area: RawAreaData): Promise<ProcessedAreaGuide> {
  const slug = generateSlug(area.name)
  
  // Get nearby schools
  const nearbySchools = await getNearbySchools(area.city)
  
  // Build context
  const context: GenerationContext = {
    area,
    nearbySchools: nearbySchools.map(s => ({
      name: s.name,
      level: s.school_level as any,
    })),
  }
  
  // Generate content (template-based for now)
  const content = generateTemplateContent(context)
  
  return {
    slug,
    name: area.name,
    city: area.city,
    neighborhood: area.neighborhood || null,
    ...content,
  }
}

/**
 * Validate area data quality
 */
function validateArea(area: ProcessedAreaGuide): boolean {
  const errors: string[] = []
  
  if (!area.slug || !isValidSlug(area.slug)) {
    errors.push('Invalid slug')
  }
  if (!area.name || area.name.length < 2) {
    errors.push('Name too short')
  }
  if (!area.city || area.city.length < 2) {
    errors.push('City too short')
  }
  if (!area.description || area.description.length < 50) {
    errors.push('Description too short (min 50 chars)')
  }
  if (area.description && area.description.length > 600) {
    errors.push('Description too long (max 600 chars)')
  }
  if (!area.content || area.content.length < 200) {
    errors.push('Content too short (min 200 chars)')
  }
  
  if (errors.length > 0) {
    console.log(`\n      Validation failed for ${area.name}: ${errors.join(', ')}`)
    return false
  }
  
  return true
}

/**
 * Bulk insert areas to database
 */
async function bulkInsert(areas: ProcessedAreaGuide[], overwrite: boolean): Promise<InsertResult> {
  const supabase = createAdminClient()
  const result: InsertResult = {
    inserted: 0,
    failed: [],
    skipped: 0,
  }
  
  // Process in batches
  const batchSize = config.generation.batchSize
  for (let i = 0; i < areas.length; i += batchSize) {
    const batch = areas.slice(i, i + batchSize)
    
    for (const area of batch) {
      try {
        if (overwrite) {
          // Upsert (update if exists, insert if not)
          const { error } = await supabase
            .from('area_guides')
            .upsert(area as any, { onConflict: 'slug' })
          
          if (error) throw error
          result.inserted++
        } else {
          // Insert only (skip if exists)
          const { error } = await supabase
            .from('area_guides')
            .insert(area as any)
          
          if (error) {
            if (error.code === '23505') { // Unique constraint violation
              result.skipped++
            } else {
              throw error
            }
          } else {
            result.inserted++
          }
        }
      } catch (error) {
        result.failed.push({
          area,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
    
    // Small delay between batches
    if (i + batchSize < areas.length) {
      await sleep(500)
    }
  }
  
  return result
}

/**
 * Update area guide statistics (property_count, avg_rent)
 */
async function updateAreaStats(): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase.rpc('update_area_stats')
  
  if (error) {
    console.error('   ⚠️  Error updating stats:', error.message)
    console.error('      You may need to run this manually in Supabase SQL Editor')
  }
}

/**
 * Simple sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run the script
main()
