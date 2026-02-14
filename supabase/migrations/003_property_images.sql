-- Property images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_order ON property_images(property_id, "order");

-- Ensure only one primary image per property
CREATE UNIQUE INDEX idx_property_images_primary 
  ON property_images(property_id) 
  WHERE is_primary = TRUE;
