-- Property types enum
CREATE TYPE property_type AS ENUM (
  'apartment',
  'house',
  'studio',
  'room',
  'townhouse',
  'condo'
);

-- Property status enum
CREATE TYPE property_status AS ENUM (
  'draft',
  'active',
  'rented',
  'inactive'
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL DEFAULT 'apartment',
  status property_status NOT NULL DEFAULT 'draft',
  
  -- Pricing (in cents for precision)
  price INTEGER NOT NULL CHECK (price > 0),
  deposit INTEGER,
  
  -- Details
  beds INTEGER NOT NULL CHECK (beds >= 0),
  baths NUMERIC(3,1) NOT NULL CHECK (baths >= 0),
  sqft INTEGER CHECK (sqft > 0),
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  neighborhood TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  
  -- Features (JSONB for flexibility)
  amenities JSONB DEFAULT '[]',
  
  -- Availability
  available_from DATE,
  lease_term TEXT,
  
  -- SEO
  slug TEXT UNIQUE,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for search performance
CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_beds ON properties(beds);

-- Full-text search index
CREATE INDEX idx_properties_search ON properties USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(neighborhood, '') || ' ' || coalesce(city, ''))
);

-- Auto-generate slug and update timestamp
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(NEW.id::text, 1, 8);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_property_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_slug();
