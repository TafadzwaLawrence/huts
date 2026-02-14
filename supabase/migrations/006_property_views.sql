-- Property views (analytics) table
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  source TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_date ON property_views(property_id, viewed_at);
