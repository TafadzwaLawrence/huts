-- FIX: REFRESH MATERIALIZED VIEW CONCURRENTLY cannot run inside a transaction block
-- (triggers always run within a transaction), causing "UPDATE requires a WHERE clause"
-- error (code 21000) whenever a property with reviews is deleted.
-- Solution: drop CONCURRENTLY so the refresh works inside the trigger transaction.
-- Also: wrap in EXCEPTION so a failed refresh never blocks a delete.

CREATE OR REPLACE FUNCTION refresh_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW property_ratings;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the warning but never let a view-refresh failure block an INSERT/UPDATE/DELETE
    RAISE WARNING 'refresh_property_ratings: could not refresh view: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach the trigger to make sure it points at the updated function
DROP TRIGGER IF EXISTS refresh_ratings_on_review_change ON reviews;

CREATE TRIGGER refresh_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_property_ratings();
