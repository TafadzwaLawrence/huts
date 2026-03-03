-- SUPER NUCLEAR FIX: Force drop all versions and recreate
-- Checks all schemas and completely removes any trace of the old function

-- Step 1: Find and drop ALL versions of the function in ALL schemas
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT n.nspname as schema_name, p.proname as function_name, p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'refresh_property_ratings'
  LOOP
    RAISE NOTICE 'Found function in schema: %.%', r.schema_name, r.function_name;
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I() CASCADE', r.schema_name, r.function_name);
    RAISE NOTICE '✓ Dropped function from schema: %', r.schema_name;
  END LOOP;
END $$;

-- Step 2: Drop the trigger explicitly
DROP TRIGGER IF EXISTS refresh_ratings_on_review_change ON reviews CASCADE;

-- Step 3: Wait and clear
SELECT pg_sleep(1);

-- Step 4: Verify function is completely gone
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_property_ratings') THEN
    RAISE EXCEPTION 'Function still exists after drop!';
  ELSE
    RAISE NOTICE '✓ Function successfully removed';
  END IF;
END $$;

-- Step 5: Create the NEW function (NO CONCURRENTLY)
CREATE OR REPLACE FUNCTION refresh_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- NO CONCURRENTLY - it fails in triggers
  REFRESH MATERIALIZED VIEW property_ratings;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'refresh_property_ratings: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION refresh_property_ratings() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_property_ratings() TO postgres;
GRANT EXECUTE ON FUNCTION refresh_property_ratings() TO anon;

-- Step 7: Recreate the trigger
CREATE TRIGGER refresh_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_property_ratings();

-- Step 8: Final verification
DO $$
DECLARE
  func_def TEXT;
  func_count INTEGER;
BEGIN
  -- Count all versions
  SELECT COUNT(*) INTO func_count
  FROM pg_proc 
  WHERE proname = 'refresh_property_ratings';
  
  IF func_count = 0 THEN
    RAISE EXCEPTION 'Function not created!';
  ELSIF func_count > 1 THEN
    RAISE EXCEPTION 'Multiple versions of function exist! Count: %', func_count;
  END IF;
  
  -- Get the definition
  SELECT pg_get_functiondef(oid) INTO func_def
  FROM pg_proc 
  WHERE proname = 'refresh_property_ratings';
  
  -- Check for CONCURRENTLY
  IF func_def LIKE '%CONCURRENTLY%' THEN
    RAISE EXCEPTION 'FAILED: Function STILL has CONCURRENTLY! Definition: %', func_def;
  ELSE
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓✓✓ SUCCESS ✓✓✓';
    RAISE NOTICE 'Function correctly created WITHOUT CONCURRENTLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Hard refresh browser: Ctrl+Shift+R';
    RAISE NOTICE '2. Or restart dev server: rm -rf .next && npm run dev';
    RAISE NOTICE '3. Try deleting property again';
    RAISE NOTICE '========================================';
  END IF;
END $$;
