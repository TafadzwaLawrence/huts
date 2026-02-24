-- ============================================
-- SCHOOLS SYSTEM FOR MAP OVERLAY
-- ============================================
-- Create standalone schools table for showing educational institutions on map
-- User can filter by school level: primary, secondary, university/college

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_level TEXT NOT NULL CHECK (school_level IN ('primary', 'secondary', 'tertiary', 'combined')),
  -- 'primary' = elementary/junior school (grades 1-7)
  -- 'secondary' = high school (form 1-6)
  -- 'tertiary' = university/college/polytechnic
  -- 'combined' = combined primary+secondary
  school_type TEXT CHECK (school_type IN ('public', 'private', 'charter', null)),
  address TEXT,
  city TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  rating DECIMAL(2,1), -- 0.0-10.0 rating
  website TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for geo queries
CREATE INDEX idx_schools_location ON schools(lat, lng);
CREATE INDEX idx_schools_city ON schools(city);
CREATE INDEX idx_schools_level ON schools(school_level);

-- RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schools"
  ON schools FOR SELECT
  USING (true);

-- Only admins can manage schools (future feature)
CREATE POLICY "Admins can manage schools"
  ON schools FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================
-- TRIGGER: Update updated_at on changes
-- ============================================

CREATE OR REPLACE FUNCTION update_schools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_updated_at_trigger
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_schools_updated_at();
