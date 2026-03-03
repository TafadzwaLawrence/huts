-- EVEN SIMPLER: Just try to delete a property with a review
-- If this fails, we'll see the exact error

DO $$
DECLARE
  v_prop_id UUID;
  v_user_id UUID;
  v_review_id UUID;
  v_success BOOLEAN := FALSE;
  v_error TEXT;
BEGIN
  -- Get a user
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  -- Clean up old test data
  DELETE FROM reviews WHERE title = 'Test' AND comment LIKE '%fifty character minimum%';
  DELETE FROM properties WHERE title = 'DELETE TEST';
  
  -- BYPASS RATE LIMIT: Clear the rate limit table for this user
  DELETE FROM review_rate_limits WHERE user_id = v_user_id;
  
  -- Create property
  INSERT INTO properties (user_id, title, price, listing_type, beds, baths, city, address, status)
  VALUES (v_user_id, 'DELETE TEST', 100000, 'rent', 1, 1, 'Test', 'Test', 'active')
  RETURNING id INTO v_prop_id;
  
  -- Create review
  INSERT INTO reviews (property_id, author_id, rating, title, comment, status)
  VALUES (v_prop_id, v_user_id, 5, 'Test', 
          'This is a test review that meets the fifty character minimum requirement', 
          'published')
  RETURNING id INTO v_review_id;
  
  -- THE CRITICAL TEST: Try to delete
  BEGIN
    DELETE FROM properties WHERE id = v_prop_id;
    v_success := TRUE;
  EXCEPTION 
    WHEN OTHERS THEN
      v_success := FALSE;
      v_error := SQLERRM;
      -- Clean up manually
      DELETE FROM reviews WHERE id = v_review_id;
      DELETE FROM properties WHERE id = v_prop_id;
  END;
  
  -- Output result
  IF v_success THEN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓✓✓ SUCCESS!';
    RAISE NOTICE 'Property deletion with reviews WORKS!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'The database fix is complete.';
    RAISE NOTICE 'Now you need to clear browser cache:';
    RAISE NOTICE '1. Hard refresh: Ctrl+Shift+R';
    RAISE NOTICE '2. Or close and reopen browser';
    RAISE NOTICE '3. Try deleting from UI again';
    RAISE NOTICE '===========================================';
  ELSE
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✗✗✗ FAILED!';
    RAISE NOTICE 'Error: %', v_error;
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'The database fix did NOT work.';
    RAISE NOTICE 'Still getting error when deleting property with reviews.';
    RAISE NOTICE '===========================================';
  END IF;
END $$;
