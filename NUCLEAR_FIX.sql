-- NUCLEAR FIX: Completely drop and recreate the trigger and function
-- This ensures no cached versions or stale connections interfere

-- Step 1: Drop the trigger first
DROP TRIGGER IF EXISTS refresh_ratings_on_review_change ON reviews CASCADE;

-- Step 2: Drop the function completely (not just replace)
DROP FUNCTION IF EXISTS refresh_property_ratings() CASCADE;

-- Step 3: Terminate any connections that might have cached the old function
-- (This part is commented out as it requires superuser - but try uncommenting if you have access)
-- SELECT pg_terminate_backend(pid) 
-- FROM pg_stat_activity 
-- WHERE datname = current_database() 
--   AND pid <> pg_backend_pid()
--   AND application_name LIKE '%supabase%';

-- Step 4: Wait a moment (give PostgreSQL time to clear caches)
SELECT pg_sleep(1);

-- Step 5: Create the function from scratch (NO CONCURRENTLY)
CREATE FUNCTION refresh_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- IMPORTANT: Do NOT use CONCURRENTLY - it cannot run in trigger transactions
  REFRESH MATERIALIZED VIEW property_ratings;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Log warning but never block the operation
    RAISE WARNING 'refresh_property_ratings: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION refresh_property_ratings() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_property_ratings() TO postgres;

-- Step 7: Recreate the trigger
CREATE TRIGGER refresh_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_property_ratings();

-- Step 8: Verify it worked
DO $$
DECLARE
  func_def TEXT;
BEGIN
  SELECT pg_get_functiondef(oid) INTO func_def
  FROM pg_proc 
  WHERE proname = 'refresh_property_ratings';
  
  IF func_def LIKE '%CONCURRENTLY%' THEN
    RAISE EXCEPTION 'FAILED: Function still has CONCURRENTLY!';
  ELSE
    RAISE NOTICE '✓ SUCCESS: Function correctly updated without CONCURRENTLY';
    RAISE NOTICE '✓ Now hard refresh your browser (Ctrl+Shift+R) and try deleting again';
  END IF;
END $$;
