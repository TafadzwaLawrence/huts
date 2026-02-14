-- ============================================
-- FULL-TEXT SEARCH FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION search_properties(search_query TEXT)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM properties
  WHERE status = 'active'
    AND to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(description, '') || ' ' || 
      coalesce(neighborhood, '') || ' ' || 
      coalesce(city, '')
    ) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(
    to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(description, '')
    ),
    plainto_tsquery('english', search_query)
  ) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GEO SEARCH FUNCTION (requires earthdistance extension)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Find properties within radius (kilometers)
CREATE OR REPLACE FUNCTION properties_within_radius(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM properties
  WHERE status = 'active'
    AND lat IS NOT NULL
    AND lng IS NOT NULL
    AND earth_distance(
      ll_to_earth(center_lat, center_lng),
      ll_to_earth(lat, lng)
    ) / 1000 <= radius_km
  ORDER BY earth_distance(
    ll_to_earth(center_lat, center_lng),
    ll_to_earth(lat, lng)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE AREA STATS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_area_stats()
RETURNS void AS $$
BEGIN
  UPDATE area_guides ag
  SET 
    property_count = (
      SELECT COUNT(*) FROM properties p
      WHERE p.city = ag.city
        AND (ag.neighborhood IS NULL OR p.neighborhood = ag.neighborhood)
        AND p.status = 'active'
    ),
    avg_rent = (
      SELECT AVG(price)::INTEGER FROM properties p
      WHERE p.city = ag.city
        AND (ag.neighborhood IS NULL OR p.neighborhood = ag.neighborhood)
        AND p.status = 'active'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GET PROPERTY WITH RELATED DATA
-- ============================================

CREATE OR REPLACE FUNCTION get_property_details(property_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'property', p,
    'images', (
      SELECT json_agg(pi ORDER BY pi."order")
      FROM property_images pi
      WHERE pi.property_id = p.id
    ),
    'landlord', json_build_object(
      'id', pr.id,
      'name', pr.name,
      'avatar_url', pr.avatar_url,
      'verified', pr.verified
    ),
    'view_count', (
      SELECT COUNT(*) FROM property_views pv
      WHERE pv.property_id = p.id
    )
  ) INTO result
  FROM properties p
  JOIN profiles pr ON p.user_id = pr.id
  WHERE p.id = property_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INCREMENT VIEW COUNT (for analytics)
-- ============================================

CREATE OR REPLACE FUNCTION track_property_view(
  p_property_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'direct'
)
RETURNS void AS $$
BEGIN
  INSERT INTO property_views (property_id, viewer_id, session_id, source)
  VALUES (p_property_id, p_viewer_id, p_session_id, p_source);
END;
$$ LANGUAGE plpgsql;
