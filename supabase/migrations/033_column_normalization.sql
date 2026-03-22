-- ============================================================================
-- MIGRATION 033: Column Normalization
--
-- Renames property columns to use descriptive names, and updates profiles
-- to match the TypeScript type definitions.
--
-- Properties:  beds → bedrooms, baths → bathrooms, sqft → square_feet, neighborhood → area
-- Profiles:    name → full_name, add city TEXT, add area TEXT
--
-- Paste into Supabase SQL Editor and run.
-- ============================================================================

-- -------------------------------------------------------------------------
-- 1. PROPERTIES: Rename columns
-- -------------------------------------------------------------------------
ALTER TABLE properties RENAME COLUMN beds TO bedrooms;
ALTER TABLE properties RENAME COLUMN baths TO bathrooms;
ALTER TABLE properties RENAME COLUMN sqft TO square_feet;
ALTER TABLE properties RENAME COLUMN neighborhood TO area;

-- Drop old indexes (they reference the old column names)
DROP INDEX IF EXISTS idx_properties_beds;
DROP INDEX IF EXISTS idx_properties_neighborhood;
DROP INDEX IF EXISTS idx_properties_search;
DROP INDEX IF EXISTS idx_properties_beds_baths; -- from migration 017

-- Recreate indexes with new column names
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_bedrooms_bathrooms ON properties(bedrooms, bathrooms);

-- Recreate full-text search index using new column name
CREATE INDEX idx_properties_search ON properties USING GIN (
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(area, '') || ' ' ||
    coalesce(city, '')
  )
);

-- -------------------------------------------------------------------------
-- 2. UPDATE DB FUNCTIONS that reference old column names
-- -------------------------------------------------------------------------

-- update_area_stats() referenced neighborhood → update to area
CREATE OR REPLACE FUNCTION update_area_stats()
RETURNS void AS $$
BEGIN
  UPDATE area_guides ag
  SET
    property_count = (
      SELECT COUNT(*) FROM properties p
      WHERE p.city = ag.city
        AND (ag.neighborhood IS NULL OR p.area = ag.neighborhood)
        AND p.status = 'active'
    ),
    avg_rent = (
      SELECT AVG(price)::INTEGER FROM properties p
      WHERE p.city = ag.city
        AND (ag.neighborhood IS NULL OR p.area = ag.neighborhood)
        AND p.status = 'active'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- 3. PROFILES: Rename name → full_name, add city and area columns
-- -------------------------------------------------------------------------
ALTER TABLE profiles RENAME COLUMN name TO full_name;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS area TEXT;

-- -------------------------------------------------------------------------
-- 4. UPDATE handle_new_user trigger to use full_name
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
