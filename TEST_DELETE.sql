-- TEST: Simulate property deletion with reviews to verify the fix works
-- This tests the exact scenario that was failing

-- IMPORTANT: Run this AFTER applying NUCLEAR_FIX.sql

DO $$
DECLARE
  test_user_id UUID;
  test_property_id UUID;
  test_review_id UUID;
  test_passed BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '=== Starting Delete Test ===';
  
  -- 1. Create a test user (use existing or create dummy)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Cannot run test.';
  END IF;
  
  RAISE NOTICE '✓ Using test user: %', test_user_id;
  
  -- 2. Create a test property
  INSERT INTO properties (
    user_id, title, description, price, listing_type, 
    bedrooms, bathrooms, sqft, city, address, status
  ) VALUES (
    test_user_id, 'TEST PROPERTY - DELETE ME', 'Test property for deletion', 
    100000, 'rent', 2, 1, 800, 'Test City', 'Test Address', 'active'
  ) RETURNING id INTO test_property_id;
  
  RAISE NOTICE '✓ Created test property: %', test_property_id;
  
  -- 3. Create a test review for this property
  INSERT INTO reviews (
    property_id, author_id, rating, comment_text, status
  ) VALUES (
    test_property_id, test_user_id, 5, 'Test review for deletion test', 'published'
  ) RETURNING id INTO test_review_id;
  
  RAISE NOTICE '✓ Created test review: %', test_review_id;
  
  -- 4. Verify materialized view has this property rating
  IF EXISTS (SELECT 1 FROM property_ratings WHERE property_id = test_property_id) THEN
    RAISE NOTICE '✓ Materialized view contains property rating';
  ELSE
    RAISE NOTICE '⚠ Materializedview does not have rating yet (might need manual refresh)';
  END IF;
  
  -- 5. Try to delete the property (this should cascade delete the review and refresh the view)
  BEGIN
    DELETE FROM properties WHERE id = test_property_id;
    test_passed := TRUE;
    RAISE NOTICE '✓✓✓ SUCCESS! Property deleted without errors';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '✗✗✗ FAILED! Error during delete: %', SQLERRM;
      test_passed := FALSE;
  END;
  
  -- 6. Verify cleanup
  IF test_passed THEN
    IF NOT EXISTS (SELECT 1 FROM properties WHERE id = test_property_id) THEN
      RAISE NOTICE '✓ Property successfully deleted';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE id = test_review_id) THEN
      RAISE NOTICE '✓ Review successfully cascade-deleted';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST PASSED ===';
    RAISE NOTICE 'The fix is working! Property deletion with reviews now works correctly.';
    RAISE NOTICE 'You can now try deleting from the browser.';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST FAILED ===';
    RAISE NOTICE 'The error still persists. Check if NUCLEAR_FIX.sql was applied correctly.';
  END IF;
  
END $$;
