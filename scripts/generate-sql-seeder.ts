#!/usr/bin/env tsx

/**
 * Generate SQL seeder for area guides
 * 
 * Creates a .sql file with INSERT statements that can be run
 * directly in Supabase SQL Editor
 * 
 * Usage:
 *   npm run generate-sql-seeder
 *   npx tsx scripts/generate-sql-seeder.ts
 */

import fs from 'fs'
import path from 'path'
import csvParser from 'csv-parser'
import { generateSlug } from './lib/slug-generator'
import { getExistingAreas, getNearbySchools } from './lib/supabase-admin'
import { generateTemplateContent } from './generators/template-content-generator'
import type { RawAreaData, ProcessedAreaGuide, GenerationContext } from './lib/area-guide-types'

console.log('🏠 HUTS Area Guide SQL Seeder Generator\n')
console.log('═'.repeat(60))
console.log('Generating SQL INSERT statements...')
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
    
    // Step 4: Generate content for each area
    console.log('✍️  Step 4: Generating content...')
    const processedAreas: ProcessedAreaGuide[] = []
    
    for (let i = 0; i < allAreas.length; i++) {
      const area = allAreas[i]
      process.stdout.write(`   [${i + 1}/${allAreas.length}] ${area.name}, ${area.city}...`)
      
      try {
        const processed = await processArea(area)
        processedAreas.push(processed)
        process.stdout.write(' ✓\n')
      } catch (error) {
        process.stdout.write(' ✗ ERROR\n')
        console.error(`      Error: ${error instanceof Error ? error.message : String(error)}`)
      }
      
      await sleep(100)
    }
    
    console.log(`   ✓ Generated content for ${processedAreas.length} areas\n`)
    
    // Step 5: Generate SQL
    console.log('📝 Step 5: Generating SQL INSERT statements...')
    const sql = generateSQL(processedAreas)
    
    // Step 6: Write to file
    const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '020_area_guides_seeder.sql')
    fs.writeFileSync(outputPath, sql, 'utf8')
    console.log(`   ✓ Wrote ${processedAreas.length} INSERT statements\n`)
    
    // Summary
    console.log('═'.repeat(60))
    console.log('✅ SQL seeder generated successfully!')
    console.log(`   File: ${outputPath}`)
    console.log(`   Areas: ${processedAreas.length}`)
    console.log('═'.repeat(60))
    console.log()
    console.log('Next steps:')
    console.log('  1. Open Supabase SQL Editor')
    console.log('  2. Copy contents of supabase/migrations/020_area_guides_seeder.sql')
    console.log('  3. Paste and run in SQL Editor')
    console.log('  4. Run: SELECT update_area_stats(); to populate statistics')
    console.log('  5. Visit http://localhost:3000/areas to view area guides')
    console.log()
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

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
  
  // Sort by priority
  return Array.from(merged.values()).sort((a, b) => {
    if (a.priority && b.priority) return a.priority - b.priority
    if (a.priority) return -1
    if (b.priority) return 1
    return a.name.localeCompare(b.name)
  })
}

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
  
  // Generate content
  const content = generateTemplateContent(context)
  
  return {
    slug,
    name: area.name,
    city: area.city,
    neighborhood: area.neighborhood || null,
    ...content,
  }
}

function generateSQL(areas: ProcessedAreaGuide[]): string {
  const header = `-- Area Guides Seeder
-- Generated: ${new Date().toISOString()}
-- Total areas: ${areas.length}
--
-- This file contains INSERT statements for area guides.
-- Run this in Supabase SQL Editor to populate the area_guides table.
--
-- After running this, execute:
--   SELECT update_area_stats();
-- to populate property_count and avg_rent statistics.

-- Insert area guides
`

  const inserts = areas.map(area => {
    // Escape single quotes in strings
    const escape = (str: string | null | undefined): string => {
      if (!str) return 'NULL'
      return `'${str.replace(/'/g, "''")}'`
    }
    
    return `INSERT INTO area_guides (
  slug,
  name,
  city,
  neighborhood,
  description,
  content,
  meta_title,
  meta_description
) VALUES (
  ${escape(area.slug)},
  ${escape(area.name)},
  ${escape(area.city)},
  ${area.neighborhood ? escape(area.neighborhood) : 'NULL'},
  ${escape(area.description)},
  ${escape(area.content)},
  ${escape(area.meta_title)},
  ${escape(area.meta_description)}
);`
  }).join('\n\n')

  const footer = `

-- Update statistics (property counts and average rents)
-- This may take a few seconds to run
SELECT update_area_stats();

-- Verify results
SELECT 
  slug,
  name,
  city,
  property_count,
  avg_rent
FROM area_guides
ORDER BY property_count DESC NULLS LAST
LIMIT 20;
`

  return header + inserts + footer
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run the script
main()
