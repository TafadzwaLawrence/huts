# Area Guide Seeder Data - 35 Priority Areas

## Overview
This CSV contains curated priority areas for Harare and Bulawayo, ranked by importance for SEO and user demand.

## Data Source
- **Harare (30 areas):** Top neighborhoods identified from market research and property demand
- **Bulawayo (5 areas):** Major residential areas in Zimbabwe's second-largest city
- **Manual curation:** Each area selected based on:
  - Property listing volume
  - Search demand
  - Economic importance
  - Demographic coverage (low/mid/high density)

## Structure

### CSV Columns
```csv
name,city,neighborhood,priority,description_hint
```

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `name` | string | Area name (matches neighborhood for consistency) | Borrowdale |
| `city` | string | Parent city | Harare |
| `neighborhood` | string | Neighborhood identifier (same as name) | Borrowdale |
| `priority` | integer | Ranking (1 = highest priority) | 1 |
| `description_hint` | string | Optional hint for content generation | Upscale residential area with shopping malls |

### Priority Rankings

**1-10: Premium/High-traffic areas**
- Borrowdale, Avondale, Mount Pleasant, Ballantyne Park, Highlands
- Eastlea, Greendale, Marlborough, Belvedere, Mabelreign

**11-20: Established residential areas**
- Newlands, Alexandra Park, Cranborne, Glen Lorne, Gunhill
- Greystone Park, Hatfield, Kuwadzana, Mbare, Warren Park

**21-30: Growing/High-density areas**
- Waterfalls, Budiriro, Glen View, Dzivarasekwa, Chitungwiza
- Epworth, Greendale North, Milton Park, Riverside, Tynwald

**31-35: Bulawayo areas**
- CBD, Hillside, Suburbs, Northend, Matsheumhlope

## Usage in Script

The CSV is loaded by `scripts/generate-area-guides.ts`:

```typescript
// Load CSV priority areas
const csvAreas = await loadCSVAreas()
// Merge with database neighborhoods
const allAreas = mergeAreas(csvAreas, dbAreas)
// Process in priority order
const processedAreas = await Promise.all(
  allAreas.map(processArea)
)
```

### Priority Order Logic

1. CSV areas are processed first (by priority value)
2. Database areas (from properties table) are added if not in CSV
3. Final list is sorted by:
   - Priority (if present)
   - Alphabetically (if no priority)

This ensures:
- High-priority areas get generated first
- No neighborhoods with properties are missed
- New areas from property listings are auto-discovered

## Generated Data from Seeders

For each area in the CSV, the script generates:

### Database Insert
```typescript
{
  slug: "borrowdale",                    // auto-generated from name
  name: "Borrowdale",                    // from CSV
  city: "Harare",                        // from CSV
  neighborhood: "Borrowdale",            // from CSV
  description: "...",                    // 150-250 words (template)
  content: "...",                        // 500-1500 words (markdown)
  meta_title: "Borrowdale Harare - Property Rentals & Sales | HUTS",
  meta_description: "...",               // first 155 chars of description
  // Statistics populated by RPC function after insert:
  property_count: 0,                     // auto-calculated
  avg_rent: null,                        // auto-calculated
  // Geographic bounds (reserved for future enhancement):
  bounds_ne_lat: null,
  bounds_ne_lng: null,
  bounds_sw_lat: null,
  bounds_sw_lng: null,
}
```

### Content Sections (Template-based)

Each area guide includes markdown sections:

1. **Overview** - Character, target demographic, key features
2. **Location & Accessibility** - Geographic context, transport links
3. **Property Types & Availability** - Common property types, price ranges
4. **Amenities & Facilities** - Shopping, healthcare, recreational
5. **Schools & Education** - Nearby schools from database
6. **Transport & Connectivity** - Public transport, road access
7. **Living Costs** - Rental prices, utilities, budgeting
8. **Why Choose {Area}?** - Unique selling points, lifestyle benefits

### SEO Metadata

Generated for each area:

```typescript
meta_title: "{Name} {City} - Property Rentals & Sales | HUTS"
meta_description: "{First 155 chars of description...}"
```

Examples:
- "Borrowdale Harare - Property Rentals & Sales | HUTS"
- "Hillside Bulawayo - Property Rentals & Sales | HUTS"

## Data Quality

### Validation Rules
- ✅ Name: 2+ characters
- ✅ City: 2+ characters
- ✅ Slug: Valid format (`[a-z0-9-]+`)
- ✅ Description: 50-600 characters
- ✅ Content: 200+ characters
- ✅ Unique slugs (no duplicates)

### Content Variation

Template generator uses area characteristics to vary content:

**Upscale areas:** (Borrowdale, Glen Lorne, Avondale, Highlands)
- "upscale properties and premium amenities"
- "executives and diplomatic staff"
- Price range: $800-$2,000+/month

**Family areas:** (Ballantyne, Marlborough, Greendale)
- "family-friendly environment and peaceful atmosphere"
- Price range: $400-$1,000/month

**Central areas:** (Eastlea, Alexandra Park, Milton Park)
- "central location and urban convenience"
- "convenient access to CBD"

**Affordable areas:** (Mbare, Kuwadzana, Warren Park)
- "affordable options"
- "working families and first-time renters"
- Price range: $150-$500/month

## Extending the Seeder

### Add New Areas

Edit `scripts/data/priority-areas.csv`:

```csv
name,city,neighborhood,priority,description_hint
Your New Area,Harare,Your New Area,36,Brief characteristic hint
Another Area,Bulawayo,Another Area,37,Another hint here
```

Then run:
```bash
npm run generate-areas
```

### Update Existing Areas

Two options:

**Option 1:** Edit CSV and re-run with `--force`
```bash
npm run generate-areas -- --force
```

**Option 2:** Edit directly in Supabase dashboard
- Go to Table Editor > area_guides
- Find the row by slug
- Update description, content, or meta fields
- Save changes

## Statistics Auto-Update

After seeder insertion, the script calls:

```sql
SELECT update_area_stats();
```

This RPC function updates all area guides with:

```typescript
property_count = COUNT(properties WHERE city = area.city AND neighborhood = area.neighborhood AND status = 'active')
avg_rent = AVG(price) of matching properties
```

Run manually to update stats:

```bash
# In Supabase SQL Editor
SELECT update_area_stats();

# Or via script
# (future enhancement - could add standalone script)
```

## Data Sources for Future Enhancements

Currently, the seeder only uses:
- ✅ CSV priority list (manual curation)
- ✅ Database properties table (auto-discovered neighborhoods)
- ✅ Schools database (nearby schools for content)

Future enhancements could add:
- 🔜 PropertyPro scraping (market data, price validation)
- 🔜 OpenStreetMap (geographic boundaries for `bounds_*` fields)
- 🔜 Google Maps API (POI data, photos)
- 🔜 Census data (demographics, statistics)
- 🔜 OpenAI API (AI-generated descriptions)

## Performance

**Generation time:**
- 35 areas × ~2 seconds each = ~70 seconds total (template-based)
- Small delay between insertions to avoid rate limits
- Batched inserts (50 at a time) for efficiency

**Database impact:**
- Minimal - uses admin client with batching
- Safe to run during development
- Can re-run with `--force` to update existing

## Maintenance Schedule

**Weekly:**
- Run script to catch new neighborhoods from property listings
- Review new areas for quality

**Monthly:**
- Update descriptions for high-traffic areas
- Add manually researched content for top 10 areas
- Verify statistics are up to date

**Quarterly:**
- Expand to new cities (e.g., Gweru, Mutare, Masvingo)
- Add geographic boundaries
- Enhance with AI-generated content

## Files Generated

When you run `npm run generate-areas`, it:

1. **Reads:** `scripts/data/priority-areas.csv` (35 rows)
2. **Queries:** `properties` table for additional neighborhoods
3. **Generates:** Content for all unique areas
4. **Validates:** Each area passes quality checks
5. **Inserts:** Valid areas into `area_guides` table
6. **Updates:** Statistics via `update_area_stats()` RPC

Result:
- 35+ area guide pages ready to go
- SEO-optimized meta tags
- Rich content with local context
- Automatic property statistics

## Verification

After running the seeder:

```bash
# 1. Check database
# Supabase SQL Editor:
SELECT COUNT(*) FROM area_guides;
SELECT slug, name, city, property_count, avg_rent FROM area_guides ORDER BY priority;

# 2. Visit pages
http://localhost:3000/areas
http://localhost:3000/areas/borrowdale
http://localhost:3000/areas/avondale

# 3. Check SEO
# View page source for meta tags
# Verify unique descriptions
# Test social share previews

# 4. Regenerate types
npm run generate-types
```

## Support

For issues:
1. Check `scripts/README.md` for troubleshooting
2. Review `ENV_SETUP.md` for environment setup
3. Check Supabase logs for database errors
4. Run with `--dry-run` flag to test before inserting
