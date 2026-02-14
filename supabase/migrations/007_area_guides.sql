-- Area guides (SEO pages) table
CREATE TABLE area_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  
  -- Content
  description TEXT,
  content TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats (updated periodically)
  avg_rent INTEGER,
  property_count INTEGER DEFAULT 0,
  
  -- Location bounds for filtering
  bounds_ne_lat DOUBLE PRECISION,
  bounds_ne_lng DOUBLE PRECISION,
  bounds_sw_lat DOUBLE PRECISION,
  bounds_sw_lng DOUBLE PRECISION,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_area_guides_slug ON area_guides(slug);
CREATE INDEX idx_area_guides_city ON area_guides(city);
