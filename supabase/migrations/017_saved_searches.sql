-- ============================================
-- SAVED SEARCHES & PRICE HISTORY SYSTEM
-- ============================================

-- Enable pg_trgm for fuzzy text matching in search suggestions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- 1. SAVED SEARCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly', 'off')),
  last_notified_at TIMESTAMPTZ,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for saved searches
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_frequency ON saved_searches(frequency) WHERE frequency != 'off';

-- RLS for saved searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_searches_updated_at();

-- ============================================
-- 2. PRICE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('listed', 'price_change', 'price_drop', 'price_increase', 'sold', 'delisted', 'relisted')),
  price BIGINT NOT NULL,
  previous_price BIGINT,
  change_amount BIGINT,
  change_percent NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for price history
CREATE INDEX idx_price_history_property_id ON price_history(property_id);
CREATE INDEX idx_price_history_created_at ON price_history(created_at DESC);
CREATE INDEX idx_price_history_event_type ON price_history(event_type);

-- RLS for price history (public read, system write)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price history"
  ON price_history FOR SELECT
  USING (true);

-- Trigger: auto-record price changes on property update
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
DECLARE
  old_price BIGINT;
  new_price BIGINT;
  change BIGINT;
  pct NUMERIC(5,2);
  evt TEXT;
BEGIN
  -- Determine the effective price based on listing type
  IF NEW.listing_type = 'sale' THEN
    old_price := OLD.sale_price;
    new_price := NEW.sale_price;
  ELSE
    old_price := OLD.price;
    new_price := NEW.price;
  END IF;

  -- Only record if price actually changed and both are non-null
  IF old_price IS NOT NULL AND new_price IS NOT NULL AND old_price != new_price THEN
    change := new_price - old_price;
    IF old_price > 0 THEN
      pct := ROUND((change::NUMERIC / old_price::NUMERIC) * 100, 2);
    END IF;

    IF change > 0 THEN
      evt := 'price_increase';
    ELSE
      evt := 'price_drop';
    END IF;

    INSERT INTO price_history (property_id, event_type, price, previous_price, change_amount, change_percent)
    VALUES (NEW.id, evt, new_price, old_price, change, pct);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_price_change
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION record_price_change();

-- Trigger: record initial listing price on insert
CREATE OR REPLACE FUNCTION record_initial_price()
RETURNS TRIGGER AS $$
DECLARE
  initial_price BIGINT;
BEGIN
  IF NEW.listing_type = 'sale' THEN
    initial_price := NEW.sale_price;
  ELSE
    initial_price := NEW.price;
  END IF;

  IF initial_price IS NOT NULL THEN
    INSERT INTO price_history (property_id, event_type, price)
    VALUES (NEW.id, 'listed', initial_price);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_initial_price
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION record_initial_price();

-- ============================================
-- 3. SEARCH PERFORMANCE INDEXES
-- ============================================

-- GIN index for full-text search on properties
CREATE INDEX IF NOT EXISTS idx_properties_search_gin
  ON properties USING GIN (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(city, '') || ' ' || COALESCE(neighborhood, '') || ' ' || COALESCE(description, ''))
  );

-- Trigram indexes for fuzzy matching (autocomplete)
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON properties USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_city_trgm ON properties USING GIN (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood_trgm ON properties USING GIN (neighborhood gin_trgm_ops);

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_properties_search_active
  ON properties(status, verification_status, listing_type)
  WHERE status = 'active' AND verification_status = 'approved';

CREATE INDEX IF NOT EXISTS idx_properties_price_rent
  ON properties(price)
  WHERE status = 'active' AND verification_status = 'approved' AND listing_type = 'rent';

CREATE INDEX IF NOT EXISTS idx_properties_price_sale
  ON properties(sale_price)
  WHERE status = 'active' AND verification_status = 'approved' AND listing_type = 'sale';

CREATE INDEX IF NOT EXISTS idx_properties_beds_baths
  ON properties(beds, baths)
  WHERE status = 'active' AND verification_status = 'approved';

CREATE INDEX IF NOT EXISTS idx_properties_geo
  ON properties(lat, lng)
  WHERE status = 'active' AND verification_status = 'approved' AND lat IS NOT NULL AND lng IS NOT NULL;

-- ============================================
-- 4. RECENTLY VIEWED TRACKING (enhance property_views)
-- ============================================
-- Add user_id to property_views if not exists (for personalized recently viewed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_views' AND column_name = 'viewer_id'
  ) THEN
    ALTER TABLE property_views ADD COLUMN viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX idx_property_views_viewer ON property_views(viewer_id, viewed_at DESC) WHERE viewer_id IS NOT NULL;
  END IF;
END $$;

COMMENT ON TABLE saved_searches IS 'User-saved search filters with email alert preferences';
COMMENT ON TABLE price_history IS 'Tracks price changes over time for properties';
COMMENT ON COLUMN saved_searches.filters IS 'JSONB containing search filters: {listingType, minPrice, maxPrice, beds, baths, propertyType, city, neighborhood, bounds}';
COMMENT ON COLUMN saved_searches.frequency IS 'How often to send email alerts: instant, daily, weekly, or off';
