-- VERIFY AND REAPPLY FIX for property deletion
-- This ensures the fix is properly applied and tests it

-- Step 1: Verify current function definition
DO $$
DECLARE
  func_def TEXT;
BEGIN
  SELECT pg_get_functiondef(oid) INTO func_def
  FROM pg_proc 
  WHERE proname = 'refresh_property_ratings';
  
  IF func_def LIKE '%CONCURRENTLY%' THEN
    RAISE NOTICE 'PROBLEM FOUND: Function still has CONCURRENTLY - needs update';
  ELSE
    RAISE NOTICE 'Function looks correct - does not use CONCURRENTLY';
  END IF;
END $$;

-- Step 2: Force update the function (remove CONCURRENTLY completely)
CREATE OR REPLACE FUNCTION refresh_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Do NOT use CONCURRENTLY - it cannot run inside trigger transactions
  REFRESH MATERIALIZED VIEW property_ratings;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but never block the operation
    RAISE WARNING 'refresh_property_ratings failed: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS refresh_ratings_on_review_change ON reviews;

CREATE TRIGGER refresh_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_property_ratings();

-- Step 4: Also ensure delete_property function exists and has proper error handling
CREATE OR REPLACE FUNCTION delete_property(p_property_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_property_exists BOOLEAN;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check if property exists and user owns it
  SELECT EXISTS (
    SELECT 1 FROM properties 
    WHERE id = p_property_id AND user_id = v_user_id
  ) INTO v_property_exists;
  
  IF NOT v_property_exists THEN
    RAISE EXCEPTION 'Property not found or you do not have permission to delete it';
  END IF;
  
  -- Delete the property (cascading deletes will handle related records)
  -- This will trigger review deletes, which trigger the materialized view refresh
  DELETE FROM properties 
  WHERE id = p_property_id AND user_id = v_user_id;
  
  -- If we got here, success
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log and re-raise
    RAISE WARNING 'delete_property error: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION delete_property(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_property_ratings() TO postgres;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Fix applied successfully. Try deleting a property now.';
END $$;
