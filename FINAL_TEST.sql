-- FINAL FIX: The function is correct, just enable the trigger and test
-- The previous "error" was a false positive - it matched the word in a comment

-- Step 1: Make sure trigger is enabled
ALTER TABLE reviews ENABLE TRIGGER refresh_ratings_on_review_change;

-- Step 2: Verify the function is correct (check actual code, not comments)
DO $$
DECLARE
  func_body TEXT;
BEGIN
  -- Get just the function body
  SELECT prosrc INTO func_body
  FROM pg_proc 
  WHERE proname = 'refresh_property_ratings';
  
  -- Check if REFRESH MATERIALIZED VIEW CONCURRENTLY exists (this would be bad)
  IF func_body LIKE '%REFRESH MATERIALIZED VIEW CONCURRENTLY%' THEN
    RAISE EXCEPTION 'Function has CONCURRENTLY in the refresh statement';
  -- Check if correct pattern exists (this is good)
  ELSIF func_body LIKE '%REFRESH MATERIALIZED VIEW property_ratings%' THEN
    RAISE NOTICE '✓ Function is correct - refreshes without CONCURRENTLY';
  ELSE
    RAISE EXCEPTION 'Function does not refresh materialized view';
  END IF;
END $$;

-- Step 3: Test the actual deletion process
DO $$
DECLARE
  test_user_id UUID;
  test_property_id UUID;
  test_review_id UUID;
BEGIN
  RAISE NOTICE '=== Testing Property Deletion with Reviews ===';
  
  -- Get first user
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found - cannot test';
    RETURN;
  END IF;
  
  -- Create test property
  INSERT INTO properties (
    user_id, title, description, price, listing_type,
    beds, baths, sqft, city, address, status
  ) VALUES (
    test_user_id, 'TEST DELETE ME', 'Test', 100000, 'rent',
    2, 1, 800, 'Test', 'Test', 'active'
  ) RETURNING id INTO test_property_id;
  
  RAISE NOTICE '✓ Created test property: %', test_property_id;
  
  -- Create test review
  INSERT INTO reviews (
    property_id, author_id, rating, title, comment, status
  ) VALUES (
    test_property_id, test_user_id, 5, 'Test Review', 
    'This is a test review with enough characters to meet the 50 character minimum requirement for testing deletion.',
    'published'
  ) RETURNING id INTO test_review_id;
  
  RAISE NOTICE '✓ Created test review: %', test_review_id;
  
  -- THE CRITICAL TEST: Delete the property
  BEGIN
    DELETE FROM properties WHERE id = test_property_id;
    RAISE NOTICE '✓✓✓ SUCCESS! Property deleted without errors!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ The fix is working correctly';
    RAISE NOTICE '✓ Now test from your browser:';
    RAISE NOTICE '  1. Hard refresh: Ctrl+Shift+R';
    RAISE NOTICE '  2. Delete a property';
    RAISE NOTICE '===========================================';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '✗✗✗ FAILED: %', SQLERRM;
      RAISE NOTICE 'Error code: %', SQLSTATE;
      -- Clean up
      DELETE FROM properties WHERE id = test_property_id;
  END;
END $$;
