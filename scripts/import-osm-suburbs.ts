#!/usr/bin/env tsx

/**
 * OSM Zimbabwe Suburb Importer
 *
 * Fetches suburb, neighbourhood, and quarter features for Zimbabwe from the
 * OpenStreetMap Overpass API, assigns each one to its parent city via
 * coordinate bounding boxes, and merges the results with the existing
 * priority-areas.csv — expanding coverage from 35 manually-curated entries
 * to the full OSM-mapped set (~200+).
 *
 * Usage:
 *   npx tsx scripts/import-osm-suburbs.ts
 *   npx tsx scripts/import-osm-suburbs.ts --dry-run   (print results, no file write)
 *   npx tsx scripts/import-osm-suburbs.ts --output scripts/data/priority-areas.csv
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { URL, URLSearchParams } from 'url'

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const OUTPUT_FLAG = args.indexOf('--output')
const OUTPUT_PATH =
  OUTPUT_FLAG !== -1
    ? args[OUTPUT_FLAG + 1]
    : path.join(__dirname, 'data', 'priority-areas.csv')
const EXISTING_CSV = path.join(__dirname, 'data', 'priority-areas.csv')

// ---------------------------------------------------------------------------
// City bounding boxes  (lat_min, lat_max, lon_min, lon_max)
// Covers the urban area + immediate suburbs of each city.
// ---------------------------------------------------------------------------
const CITY_BOUNDS: Record<string, [number, number, number, number]> = {
  Harare:          [-18.10, -17.65,  30.85, 31.35],
  Chitungwiza:     [-18.06, -17.94,  31.03, 31.18],
  Ruwa:            [-17.93, -17.82,  31.19, 31.32],
  Epworth:         [-17.96, -17.86,  31.11, 31.22],
  Norton:          [-17.93, -17.83,  30.60, 30.72],
  Bulawayo:        [-20.38, -19.92,  28.32, 28.80],
  Mutare:          [-19.05, -18.87,  32.58, 32.80],
  Gweru:           [-19.60, -19.30,  29.68, 29.95],
  Kwekwe:          [-19.02, -18.82,  29.72, 29.94],
  Kadoma:          [-18.47, -18.24,  29.82, 29.99],
  Masvingo:        [-20.18, -19.93,  30.73, 30.96],
  Chinhoyi:        [-17.46, -17.25,  30.10, 30.26],
  Bindura:         [-17.36, -17.22,  31.27, 31.42],
  Marondera:       [-18.28, -17.90,  31.45, 31.65],
  Zvishavane:      [-20.45, -20.22,  29.97, 30.14],
  Chegutu:         [-18.30, -18.05,  30.07, 30.22],
  'Victoria Falls': [-17.98, -17.85,  25.78, 25.95],
  Hwange:          [-18.50, -18.27,  26.40, 26.58],
  Rusape:          [-18.56, -18.45,  32.10, 32.22],
  Chipinge:        [-20.22, -20.10,  32.58, 32.72],
  Kariba:          [-16.55, -16.45,  28.77, 28.88],
  Karoi:           [-16.87, -16.76,  29.63, 29.74],
  Shurugwi:        [-19.71, -19.57,  30.00, 30.14],
  Gokwe:           [-18.26, -18.15,  28.92, 29.09],
  Beitbridge:      [-22.26, -22.11,  29.94, 30.08],
  Gwanda:          [-20.96, -20.84,  29.00, 29.11],
  Plumtree:        [-20.50, -20.38,  27.78, 27.90],
}

// ---------------------------------------------------------------------------
// Sanity filter — reject obvious non-suburb names
// ---------------------------------------------------------------------------
const REJECT_PATTERNS = [
  /mine$/i,
  /^inyati/i,
  /^teld/i,
  /township$/i,    // keep as-is if name is useful, but "Mopani Township" etc. are industrial
  /estates?$/i,
  /^charter$/i,
]

function isValidName(name: string): boolean {
  if (!name || name.trim().length < 2) return false
  for (const pattern of REJECT_PATTERNS) {
    if (pattern.test(name.trim())) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

interface SuburbRecord {
  name: string
  city: string
  neighborhood: string
  priority: number
  description_hint: string
  lat: number | null
  lon: number | null
  source: 'csv' | 'osm'
}

// ---------------------------------------------------------------------------
// Overpass API fetch with retry
// ---------------------------------------------------------------------------
const OVERPASS_QUERY = `
[out:json][timeout:90];
area["name"="Zimbabwe"]["admin_level"="2"]->.zw;
(
  node["place"~"suburb|neighbourhood|quarter"](area.zw);
  way["place"~"suburb|neighbourhood|quarter"]["name"](area.zw);
  relation["place"~"suburb|neighbourhood|quarter"]["name"](area.zw);
);
out center tags;
`.trim()

function httpPost(url: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'HutsZW/1.0 suburb-importer (+https://huts.co.zw)',
      },
    }
    const req = https.request(options, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    })
    req.on('error', reject)
    req.setTimeout(95_000, () => {
      req.destroy(new Error('Request timed out'))
    })
    req.write(body)
    req.end()
  })
}

async function fetchOsmSuburbs(retries = 3): Promise<OsmElement[]> {
  const body = new URLSearchParams({ data: OVERPASS_QUERY }).toString()
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`   Querying Overpass API (attempt ${attempt}/${retries})...`)
      const raw = await httpPost('https://overpass-api.de/api/interpreter', body)
      const json = JSON.parse(raw)
      if (!json.elements) throw new Error('Unexpected response: ' + raw.slice(0, 200))
      return json.elements as OsmElement[]
    } catch (err) {
      if (attempt === retries) throw err
      const wait = attempt * 5000
      console.log(`   ⚠️  Attempt ${attempt} failed, retrying in ${wait / 1000}s...`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  return []
}

// ---------------------------------------------------------------------------
// City assignment
// ---------------------------------------------------------------------------
function assignCity(lat: number, lon: number): string | null {
  for (const [city, [lmin, lmax, lomin, lomax]] of Object.entries(CITY_BOUNDS)) {
    if (lat >= lmin && lat <= lmax && lon >= lomin && lon <= lomax) {
      return city
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Load existing priority-areas.csv
// ---------------------------------------------------------------------------
function loadExistingCsv(): SuburbRecord[] {
  if (!fs.existsSync(EXISTING_CSV)) return []
  const lines = fs.readFileSync(EXISTING_CSV, 'utf-8').trim().split('\n')
  const records: SuburbRecord[] = []
  for (const line of lines.slice(1)) {
    const [name, city, neighborhood, priority, ...rest] = line.split(',')
    if (!name || !city) continue
    records.push({
      name: name.trim(),
      city: city.trim(),
      neighborhood: neighborhood?.trim() || name.trim(),
      priority: parseInt(priority || '999', 10),
      description_hint: rest.join(',').trim(),
      lat: null,
      lon: null,
      source: 'csv',
    })
  }
  return records
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🗺️  HUTS OSM Suburb Importer\n')
  console.log('═'.repeat(60))
  console.log(`Mode:   ${DRY_RUN ? 'DRY RUN (no file changes)' : 'LIVE'}`)
  console.log(`Output: ${OUTPUT_PATH}`)
  console.log('═'.repeat(60))
  console.log()

  // Step 1: Load existing CSV
  console.log('📋 Step 1: Loading existing priority-areas.csv...')
  const existingRecords = loadExistingCsv()
  const existingNames = new Set(existingRecords.map((r) => r.name.toLowerCase()))
  console.log(`   ✓ ${existingRecords.length} existing areas loaded`)
  console.log()

  // Step 2: Fetch OSM data
  console.log('🌍 Step 2: Fetching Zimbabwe suburb data from OpenStreetMap...')
  const elements = await fetchOsmSuburbs()
  console.log(`   ✓ ${elements.length} OSM elements returned`)
  console.log()

  // Step 3: Process and assign cities
  console.log('📍 Step 3: Assigning suburbs to cities...')
  const osmRecords: SuburbRecord[] = []
  const skipped: string[] = []

  for (const el of elements) {
    const tags = el.tags || {}
    const name = (tags.name || '').trim()
    const lat = el.lat ?? el.center?.lat ?? null
    const lon = el.lon ?? el.center?.lon ?? null

    if (!name || lat === null || lon === null) continue
    if (!isValidName(name)) {
      skipped.push(name)
      continue
    }
    if (existingNames.has(name.toLowerCase())) continue // already in CSV

    const city = assignCity(lat, lon)
    if (!city) continue // outside known urban bounds

    osmRecords.push({
      name,
      city,
      neighborhood: name,
      priority: 100, // OSM entries start at 100 — below all hand-curated entries
      description_hint: '',
      lat,
      lon,
      source: 'osm',
    })
  }

  // Sort OSM entries by city then name
  osmRecords.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))

  // Assign sequential priorities starting after existing max
  const maxExisting = existingRecords.reduce((m, r) => Math.max(m, r.priority), 0)
  osmRecords.forEach((r, i) => {
    r.priority = maxExisting + i + 1
  })

  console.log(`   ✓ ${osmRecords.length} new suburbs from OSM`)
  console.log(`   ⏭  ${skipped.length} entries skipped (noise/industrial)`)
  console.log()

  // Step 4: Print summary by city
  console.log('📊 Step 4: Coverage summary')
  console.log()

  const byCity: Record<string, { existing: number; osm: number }> = {}
  for (const r of existingRecords) {
    byCity[r.city] = byCity[r.city] || { existing: 0, osm: 0 }
    byCity[r.city].existing++
  }
  for (const r of osmRecords) {
    byCity[r.city] = byCity[r.city] || { existing: 0, osm: 0 }
    byCity[r.city].osm++
  }

  const allCities = Object.keys(byCity).sort()
  console.log(`   ${'City'.padEnd(22)} ${'Before'.padStart(7)} ${'Added'.padStart(7)} ${'Total'.padStart(7)}`)
  console.log(`   ${'─'.repeat(45)}`)
  for (const city of allCities) {
    const { existing, osm } = byCity[city]
    console.log(
      `   ${city.padEnd(22)} ${String(existing).padStart(7)} ${String(osm).padStart(7)} ${String(existing + osm).padStart(7)}`
    )
  }
  console.log()
  console.log(
    `   TOTAL: ${existingRecords.length} existing + ${osmRecords.length} new = ${existingRecords.length + osmRecords.length} areas`
  )
  console.log()

  // Step 5: Merge and write
  const merged = [...existingRecords, ...osmRecords]

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — new OSM entries that would be added:')
    for (const r of osmRecords) {
      console.log(`   [${r.city}] ${r.name}`)
    }
    console.log('\n✅ Dry run complete. No files modified.')
    return
  }

  console.log('💾 Step 5: Writing updated priority-areas.csv...')
  const header = 'name,city,neighborhood,priority,description_hint'
  const csvLines = merged.map((r) => {
    // Escape fields that may contain commas
    const esc = (s: string) => (s.includes(',') ? `"${s}"` : s)
    return [
      esc(r.name),
      esc(r.city),
      esc(r.neighborhood),
      r.priority,
      esc(r.description_hint),
    ].join(',')
  })

  const output = [header, ...csvLines].join('\n') + '\n'
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8')
  console.log(`   ✓ Written ${merged.length} areas to ${OUTPUT_PATH}`)
  console.log()
  console.log('✅ Import complete.')
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
