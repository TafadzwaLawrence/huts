-- ============================================
-- PROPERTY ANALYTICS FUNCTIONS
-- ============================================

-- Function to get property view statistics
CREATE OR REPLACE FUNCTION get_property_view_stats(p_property_id UUID)
RETURNS TABLE (
  total BIGINT,
  last7 BIGINT,
  last30 BIGINT,
  unique_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '7 days') as last7,
    COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '30 days') as last30,
    COUNT(DISTINCT COALESCE(viewer_id::text, session_id)) as unique_viewers
  FROM property_views
  WHERE property_id = p_property_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get property engagement metrics
CREATE OR REPLACE FUNCTION get_property_engagement(p_property_id UUID)
RETURNS TABLE (
  views_total BIGINT,
  views_last_7_days BIGINT,
  views_last_30_days BIGINT,
  inquiries_total BIGINT,
  inquiries_unread BIGINT,
  saves_total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM property_views WHERE property_id = p_property_id) as views_total,
    (SELECT COUNT(*) FROM property_views WHERE property_id = p_property_id AND viewed_at >= NOW() - INTERVAL '7 days') as views_last_7_days,
    (SELECT COUNT(*) FROM property_views WHERE property_id = p_property_id AND viewed_at >= NOW() - INTERVAL '30 days') as views_last_30_days,
    (SELECT COUNT(*) FROM inquiries WHERE property_id = p_property_id) as inquiries_total,
    (SELECT COUNT(*) FROM inquiries WHERE property_id = p_property_id AND status = 'unread') as inquiries_unread,
    (SELECT COUNT(*) FROM saved_properties WHERE property_id = p_property_id) as saves_total;
END;
$$ LANGUAGE plpgsql STABLE;

-- Materialized view for market statistics by city
CREATE MATERIALIZED VIEW IF NOT EXISTS market_stats AS
SELECT 
  city,
  listing_type,
  COUNT(*) as total_listings,
  AVG(CASE WHEN listing_type = 'rent' THEN price ELSE sale_price END) as avg_price,
  MIN(CASE WHEN listing_type = 'rent' THEN price ELSE sale_price END) as min_price,
  MAX(CASE WHEN listing_type = 'rent' THEN price ELSE sale_price END) as max_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CASE WHEN listing_type = 'rent' THEN price ELSE sale_price END) as median_price,
  AVG(sqft) FILTER (WHERE sqft IS NOT NULL) as avg_sqft,
  COUNT(DISTINCT neighborhood) as neighborhood_count
FROM properties
WHERE status = 'active'
GROUP BY city, listing_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_stats_city ON market_stats(city, listing_type);

-- Function to refresh market stats (call periodically)
CREATE OR REPLACE FUNCTION refresh_market_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY market_stats;
END;
$$ LANGUAGE plpgsql;

-- Property performance score calculation
CREATE OR REPLACE FUNCTION calculate_property_score(p_property_id UUID)
RETURNS TABLE (
  quality_score INTEGER,
  engagement_score INTEGER,
  overall_score INTEGER
) AS $$
DECLARE
  v_photo_count INTEGER;
  v_desc_length INTEGER;
  v_has_sqft BOOLEAN;
  v_has_neighborhood BOOLEAN;
  v_amenity_count INTEGER;
  v_views_30d BIGINT;
  v_inquiries BIGINT;
  v_saves BIGINT;
  v_quality INTEGER := 0;
  v_engagement INTEGER := 0;
BEGIN
  -- Get property details
  SELECT 
    (SELECT COUNT(*) FROM property_images WHERE property_id = p_property_id),
    COALESCE(LENGTH(description), 0),
    sqft IS NOT NULL,
    neighborhood IS NOT NULL,
    COALESCE(jsonb_array_length(amenities), 0)
  INTO v_photo_count, v_desc_length, v_has_sqft, v_has_neighborhood, v_amenity_count
  FROM properties WHERE id = p_property_id;

  -- Calculate quality score (0-100)
  -- Photos: max 25 points
  IF v_photo_count >= 10 THEN v_quality := v_quality + 25;
  ELSIF v_photo_count >= 5 THEN v_quality := v_quality + 18;
  ELSIF v_photo_count >= 3 THEN v_quality := v_quality + 12;
  ELSIF v_photo_count >= 1 THEN v_quality := v_quality + 6;
  END IF;

  -- Description: max 25 points
  IF v_desc_length >= 500 THEN v_quality := v_quality + 25;
  ELSIF v_desc_length >= 300 THEN v_quality := v_quality + 18;
  ELSIF v_desc_length >= 150 THEN v_quality := v_quality + 12;
  ELSIF v_desc_length >= 50 THEN v_quality := v_quality + 6;
  END IF;

  -- Details: max 20 points
  IF v_has_sqft THEN v_quality := v_quality + 10; END IF;
  IF v_has_neighborhood THEN v_quality := v_quality + 10; END IF;

  -- Amenities: max 15 points
  v_quality := v_quality + LEAST(v_amenity_count * 3, 15);

  -- Base pricing score: 15 points
  v_quality := v_quality + 15;

  -- Get engagement metrics
  SELECT 
    COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '30 days')
  INTO v_views_30d
  FROM property_views WHERE property_id = p_property_id;

  SELECT COUNT(*) INTO v_inquiries FROM inquiries WHERE property_id = p_property_id;
  SELECT COUNT(*) INTO v_saves FROM saved_properties WHERE property_id = p_property_id;

  -- Calculate engagement score (relative, 0-100)
  -- Views: max 40 points
  IF v_views_30d >= 100 THEN v_engagement := v_engagement + 40;
  ELSIF v_views_30d >= 50 THEN v_engagement := v_engagement + 30;
  ELSIF v_views_30d >= 20 THEN v_engagement := v_engagement + 20;
  ELSIF v_views_30d >= 10 THEN v_engagement := v_engagement + 10;
  ELSIF v_views_30d >= 5 THEN v_engagement := v_engagement + 5;
  END IF;

  -- Inquiries: max 35 points
  IF v_inquiries >= 10 THEN v_engagement := v_engagement + 35;
  ELSIF v_inquiries >= 5 THEN v_engagement := v_engagement + 25;
  ELSIF v_inquiries >= 3 THEN v_engagement := v_engagement + 15;
  ELSIF v_inquiries >= 1 THEN v_engagement := v_engagement + 8;
  END IF;

  -- Saves: max 25 points
  IF v_saves >= 15 THEN v_engagement := v_engagement + 25;
  ELSIF v_saves >= 10 THEN v_engagement := v_engagement + 18;
  ELSIF v_saves >= 5 THEN v_engagement := v_engagement + 12;
  ELSIF v_saves >= 1 THEN v_engagement := v_engagement + 5;
  END IF;

  RETURN QUERY SELECT 
    v_quality as quality_score,
    v_engagement as engagement_score,
    ((v_quality + v_engagement) / 2) as overall_score;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments for documentation
COMMENT ON FUNCTION get_property_view_stats IS 'Get view statistics for a specific property';
COMMENT ON FUNCTION get_property_engagement IS 'Get all engagement metrics for a property in one call';
COMMENT ON FUNCTION calculate_property_score IS 'Calculate quality and engagement scores for a property';
COMMENT ON MATERIALIZED VIEW market_stats IS 'Cached market statistics by city and listing type';
