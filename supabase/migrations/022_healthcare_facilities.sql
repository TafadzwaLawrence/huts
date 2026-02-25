-- Healthcare Facilities System Migration
-- Store healthcare facilities across Zimbabwe for property location context
-- Generated: 2026-02-25

-- ============================================================================
-- TABLE: healthcare_facilities
-- Store all healthcare facilities in Zimbabwe with coordinates
-- ============================================================================

CREATE TABLE healthcare_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Original IDs from dataset
  source_id1 INTEGER,
  source_id INTEGER,
  
  -- Location
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  elevation INTEGER,
  
  -- Facility Details
  facility_type TEXT DEFAULT 'Unknown', -- 'District Hospital', 'Clinic', 'Rural Health Centre', etc.
  ownership_code INTEGER,
  year_built INTEGER,
  year_updated INTEGER,
  
  -- Search
  search_vector tsvector,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

-- Spatial index for finding facilities near coordinates
CREATE INDEX idx_healthcare_lat_lng ON healthcare_facilities(latitude, longitude);

-- Province/district filtering
CREATE INDEX idx_healthcare_province ON healthcare_facilities(province);
CREATE INDEX idx_healthcare_district ON healthcare_facilities(district);

-- Facility type filtering
CREATE INDEX idx_healthcare_type ON healthcare_facilities(facility_type);

-- Full-text search on name
CREATE INDEX idx_healthcare_search ON healthcare_facilities USING gin(search_vector);

-- Composite index for common queries
CREATE INDEX idx_healthcare_province_type ON healthcare_facilities(province, facility_type);

-- ============================================================================
-- TRIGGER: Auto-update search vector
-- ============================================================================

CREATE OR REPLACE FUNCTION update_healthcare_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.district, '') || ' ' ||
    COALESCE(NEW.province, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER healthcare_search_vector_update
  BEFORE INSERT OR UPDATE ON healthcare_facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_healthcare_search_vector();

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER update_healthcare_facilities_updated_at
  BEFORE UPDATE ON healthcare_facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES: Public read-only access
-- ============================================================================

ALTER TABLE healthcare_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Healthcare facilities are publicly viewable"
  ON healthcare_facilities FOR SELECT
  TO public
  USING (TRUE);

-- ============================================================================
-- HELPER FUNCTION: Find facilities near coordinates
-- ============================================================================

CREATE OR REPLACE FUNCTION find_nearby_healthcare(
  lat DECIMAL,
  lng DECIMAL,
  radius_km DECIMAL DEFAULT 10,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  facility_type TEXT,
  distance_km DECIMAL,
  province TEXT,
  district TEXT,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.name,
    h.facility_type,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(h.latitude)) *
        cos(radians(h.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(h.latitude))
      )
    )::DECIMAL(10, 2) AS distance_km,
    h.province,
    h.district,
    h.latitude,
    h.longitude
  FROM healthcare_facilities h
  WHERE (
    6371 * acos(
      cos(radians(lat)) * cos(radians(h.latitude)) *
      cos(radians(h.longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(h.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Get facilities by province
-- ============================================================================

CREATE OR REPLACE FUNCTION get_healthcare_by_province(province_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  facility_type TEXT,
  district TEXT,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.name,
    h.facility_type,
    h.district,
    h.latitude,
    h.longitude
  FROM healthcare_facilities h
  WHERE h.province = province_name
  ORDER BY h.district, h.name;
END;
$$ LANGUAGE plpgsql;
