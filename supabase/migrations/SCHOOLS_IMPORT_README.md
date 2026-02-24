# Schools System Migration - Split Files

Due to Supabase SQL Editor size limitations, the schools migration has been split into multiple files.

## Files

- **019_schools_system_schema.sql** - Table definition, indexes, RLS policies, and trigger (Run this FIRST)
- **019_schools_data_part_aa.sql** - Schools data part 1 (~1,000 schools)
- **019_schools_data_part_ab.sql** - Schools data part 2 (~1,000 schools)
- **019_schools_data_part_ac.sql** - Schools data part 3 (~1,000 schools)
- **019_schools_data_part_ad.sql** - Schools data part 4 (~1,000 schools)
- **019_schools_data_part_ae.sql** - Schools data part 5 (~1,000 schools)
- **019_schools_data_part_af.sql** - Schools data part 6 (~1,000 schools)
- **019_schools_data_part_ag.sql** - Schools data part 7 (~1,000 schools)
- **019_schools_data_part_ah.sql** - Schools data part 8 (~920 schools)

**Total: 7,920 schools** (6,796 primary + 2,980 secondary)

## How to Import in Supabase SQL Editor

### Step 1: Run Schema File
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `019_schools_system_schema.sql`
3. Paste and run
4. ✅ Verify table `schools` is created

### Step 2: Import Data Files (in order)
Run each data file in alphabetical order (aa → ab → ac → ad → ae → af → ag → ah):

1. Copy contents of `019_schools_data_part_aa.sql`
2. Paste and run in SQL Editor
3. Wait for completion
4. Repeat for parts: ab, ac, ad, ae, af, ag, ah

### Step 3: Verify Import
```sql
-- Check total count
SELECT COUNT(*) FROM schools;
-- Should return: 7920

-- Check distribution by level
SELECT school_level, COUNT(*) 
FROM schools 
GROUP BY school_level 
ORDER BY COUNT(*) DESC;
-- Should show: primary ~6796, secondary ~2980

-- Check provinces
SELECT city, COUNT(*) 
FROM schools 
GROUP BY city 
ORDER BY COUNT(*) DESC 
LIMIT 10;
```

## Alternative: Use Supabase CLI

If you have Supabase CLI installed, you can apply all at once:

```bash
# Navigate to project root
cd /home/tafadzwa/Documents/Github/Huts

# Apply schema
npx supabase db push

# This will automatically run all .sql files in order
```

## Data Source
- Government dataset: `location_of_schools-1758396164.csv`
- Coverage: All provinces in Zimbabwe
- Coordinates: Accurate lat/lng for each school
- Levels: Primary (Grades 1-7) and Secondary (Form 1-6)
