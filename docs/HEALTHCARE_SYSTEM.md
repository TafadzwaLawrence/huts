# Healthcare Facilities System

This system displays all 1,688 healthcare facilities across Zimbabwe on an interactive map and list view.

## Setup Instructions

### Method 1: SQL Seeder (Recommended)

**Step 1: Create the table structure**

```bash
# Go to: https://supabase.com/dashboard/project/idhcvldxyhfjzytswomo/sql/new
# Copy and paste: supabase/migrations/022_healthcare_facilities.sql
# Click "Run"
```

**Step 2: Import data using SQL seeders**

Run these files **IN ORDER** in Supabase SQL Editor:

1. ✅ `022_healthcare_facilities.sql` (already done - creates table & functions)
2. `022_healthcare_data_part_a.sql` (850 facilities)
3. `022_healthcare_data_part_b.sql` (838 facilities)

**Step 3: Verify import**

```sql
SELECT COUNT(*) FROM healthcare_facilities;
-- Should return: 1688
```

**Quick reference for import order:**
```bash
./supabase/migrations/healthcare_import_order.sh
```

---

### Method 2: JavaScript Import (Alternative)

If you prefer programmatic import:

```bash
# Set your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run import script
npm run import-healthcare
```

---

### Step 3: Access the Healthcare Page

Visit: **https://www.huts.co.zw/healthcare**

Features:
- ✅ Interactive map with 1,689 facility markers
- ✅ List view with facility cards
- ✅ Simple search (by name, district, or province)
- ✅ No filters (as requested)
- ✅ Stats by province and facility type
- ✅ Mobile responsive

## Navigation Updates

Healthcare link added to:
- ✅ Main navbar (desktop): Areas | **Healthcare** | Help
- ✅ Mobile menu: Browse All, For Rent, For Sale, Areas, **Healthcare**

## Database Schema

**Table:** `healthcare_facilities`

Key fields:
- `name` - Facility name
- `province` - Zimbabwe province
- `district` - District name
- `latitude` / `longitude` - GPS coordinates
- `facility_type` - Type (District Hospital, Clinic, Rural Health Centre, etc.)
- `ownership_code` - Ownership type (2=?, 4=?, 5=?, 6=?, 8=?)
- `year_built` - Construction year (0 = unknown)
- `year_updated` - Last data update year

**Indexes:**
- Spatial index on lat/lng for proximity queries
- Full-text search on name/district/province
- Province and facility type filtering

**Functions:**
- `find_nearby_healthcare(lat, lng, radius_km, limit)` - Find facilities near coordinates
- `get_healthcare_by_province(province_name)` - Get all facilities in province

## CSV Data Source

File: `zwe_healthcare_facilities-1758397529.csv`

Columns:
- ID1, ID - Original identifiers
- Province, DISTRICT - Location hierarchy
- LONGITUDE, LATITUDE - Coordinates
- ELEVATION - Meters above sea level
- UPDATED - Year last updated
- NAMEOFFACI - Facility name
- OWNERSHIP - Ownership code (numeric)
- YEARBUILT - Construction year
- TYPEOFFACI - Facility type/category

Total records: **1,688 healthcare facilities** (1 record skipped due to missing data)

## Generating SQL Seeders

To regenerate the SQL seeder files from CSV:

```bash
npm run generate-healthcare-seeder
```

This creates:
- `022_healthcare_data_part_a.sql` (850 facilities)
- `022_healthcare_data_part_b.sql` (838 facilities)  
- `healthcare_import_order.sh` (import instructions)

## Facility Types

Based on CSV data:
- District Hospital
- Rural Hospital
- Clinic
- Rural Health Centre
- Mission Hospital
- Clinic (Not Open)
- Clinic (construction)

## Provinces Covered

All 10 provinces of Zimbabwe:
- Harare
- Bulawayo
- Manicaland
- Mashonaland Central
- Mashonaland East
- Mashonaland West
- Masvingo
- Matabeleland North
- Matabeleland South
- Midlands

## Future Enhancements (Optional)

- [ ] Show "Nearby Healthcare" section on property pages
- [ ] Filter properties by proximity to healthcare
- [ ] Add opening hours / contact info if available
- [ ] Integrate with property search (e.g., "Show properties near hospitals")
- [ ] Add facility reviews/ratings
- [ ] Admin interface to add/edit facilities

## Files Created

```
supabase/migrations/
  ├── 022_healthcare_facilities.sql          # Database schema & functions
  ├── 022_healthcare_data_part_a.sql        # Data seeder part 1 (850 records)
  ├── 022_healthcare_data_part_b.sql        # Data seeder part 2 (838 records)
  └── healthcare_import_order.sh            # Import order guide

scripts/
  ├── import-healthcare.js                   # CSV import script (Node.js)
  └── generate-healthcare-seeder.js          # SQL seeder generator

app/healthcare/
  └── page.tsx                               # Healthcare page

components/healthcare/
  └── HealthcareMapView.tsx                  # Map/list view component

Data:
  └── zwe_healthcare_facilities-1758397529.csv  # Source CSV (1,689 rows)
```

## Testing

1. **Database:** Check that table exists with 1,688 records
   ```sql
   SELECT COUNT(*) FROM healthcare_facilities;
   -- Should return: 1688
   SELECT COUNT(*) FROM healthcare_facilities;
   ```

2. **Page:** Visit `/healthcare` and verify:
   - Map loads with markers
   - List view shows all facilities
   - Search filters results
   - Stats cards display correct counts

3. **Navigation:** Check that "Healthcare" link appears in navbar and mobile menu

## Notes

- No filters implemented as requested ("they don't need filters in the search")
- Only basic search by name/district/province available
- Map uses OpenStreetMap tiles (free, no API key needed)
- Data is read-only (public can view, only admins can edit)
- All coordinates use WGS84 decimal degrees format
