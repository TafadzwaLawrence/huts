-- Saved properties (favorites) table
CREATE TABLE saved_properties (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (user_id, property_id)
);

-- Index for user lookups
CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);
