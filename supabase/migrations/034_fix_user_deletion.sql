-- Fix: Ensure refresh_property_ratings() never blocks a DELETE operation.
-- Migration 010 used REFRESH MATERIALIZED VIEW CONCURRENTLY which crashes
-- inside a transaction. Migration 024 fixed this, but re-applying here
-- in case 024 was skipped or reverted.
-- Also adds delete_user_completely() RPC for atomic user deletion.

-- 1. Fix the materialized-view refresh trigger
CREATE OR REPLACE FUNCTION refresh_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW property_ratings;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'refresh_property_ratings: could not refresh view: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS refresh_ratings_on_review_change ON reviews;
CREATE TRIGGER refresh_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_property_ratings();

-- 2. Atomic user-deletion function (call via adminClient.rpc)
CREATE OR REPLACE FUNCTION delete_user_completely(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prop_ids UUID[];
  rev_ids  UUID[];
BEGIN
  -- Collect property IDs owned by this user
  SELECT COALESCE(array_agg(id), '{}') INTO prop_ids
    FROM properties WHERE user_id = target_user_id;

  -- Collect review IDs authored by user OR on user's properties
  SELECT COALESCE(array_agg(id), '{}') INTO rev_ids
    FROM reviews
    WHERE author_id = target_user_id
       OR property_id = ANY(prop_ids);

  -- Delete review leaf tables, then reviews
  DELETE FROM review_votes    WHERE review_id = ANY(rev_ids) OR user_id = target_user_id;
  DELETE FROM review_responses WHERE review_id = ANY(rev_ids);
  DELETE FROM reviews          WHERE id = ANY(rev_ids);

  -- Delete property dependents, then properties
  DELETE FROM property_images  WHERE property_id = ANY(prop_ids);
  DELETE FROM saved_properties WHERE property_id = ANY(prop_ids) OR user_id = target_user_id;
  DELETE FROM properties       WHERE id = ANY(prop_ids);

  -- Conversations & messages
  DELETE FROM conversations WHERE renter_id = target_user_id OR landlord_id = target_user_id;
  DELETE FROM messages      WHERE sender_id = target_user_id;

  -- Direct auth.users FK tables
  DELETE FROM agents         WHERE user_id = target_user_id;
  DELETE FROM saved_searches WHERE user_id = target_user_id;

  -- Profile (cascades anything remaining)
  DELETE FROM profiles WHERE id = target_user_id;

  -- Auth user (all FKs are now clear — cascade is a no-op)
  DELETE FROM auth.users WHERE id = target_user_id;

  -- Best-effort refresh of materialized view
  BEGIN
    REFRESH MATERIALIZED VIEW property_ratings;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END;
$$;

-- Only admins / service-role can call this function
REVOKE ALL ON FUNCTION delete_user_completely(UUID) FROM public;
REVOKE ALL ON FUNCTION delete_user_completely(UUID) FROM authenticated;
