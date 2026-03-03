-- DIRECT TEST: Manually test deletion without the RPC function
-- This bypasses the delete_property RPC and tests raw SQL

-- First, let's see what the actual error is
DO $$
DECLARE
  test_prop_id UUID;
  test_user_id UUID;
BEGIN
  -- Get a user
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  -- Create a simple property (no reviews yet)
  INSERT INTO properties (user_id, title, price, listing_type, beds, baths, city, address, status)
  VALUES (test_user_id, 'SIMPLE TEST', 100000, 'rent', 1, 1, 'Test', 'Test', 'active')
  RETURNING id INTO test_prop_id;
  
  RAISE NOTICE 'Created property: %', test_prop_id;
  
  -- Try to delete it
  BEGIN
    DELETE FROM properties WHERE id = test_prop_id;
    RAISE NOTICE '✓ Deletion without reviews: SUCCESS';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✗ Deletion without reviews FAILED: % (code: %)', SQLERRM, SQLSTATE;
  END;
END $$;

-- Now test with a review
DO $$
DECLARE
  test_prop_id UUID;
  test_user_id UUID;
  test_review_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  -- Create property
  INSERT INTO properties (user_id, title, price, listing_type, beds, baths, city, address, status)
  VALUES (test_user_id, 'WITH REVIEW TEST', 100000, 'rent', 1, 1, 'Test', 'Test', 'active')
  RETURNING id INTO test_prop_id;
  
  RAISE NOTICE 'Created property with review test: %', test_prop_id;
  
  -- Add a review
  INSERT INTO reviews (property_id, author_id, rating, title, comment, status)
  VALUES (test_prop_id, test_user_id, 5, 'Test', 'This is a test review that meets the fifty character minimum requirement', 'published')
  RETURNING id INTO test_review_id;
  
  RAISE NOTICE 'Created review: %', test_review_id;
  
  -- Try to delete the property (this triggers review cascade delete)
  BEGIN
    DELETE FROM properties WHERE id = test_prop_id;
    RAISE NOTICE '✓✓✓ Deletion WITH reviews: SUCCESS!';
    RAISE NOTICE 'The database fix is working!';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '✗✗✗ Deletion WITH reviews FAILED: % (code: %)', SQLERRM, SQLSTATE;
    RAISE NOTICE 'This is the error the browser is seeing';
    -- Clean up
    DELETE FROM reviews WHERE id = test_review_id;
    DELETE FROM properties WHERE id = test_prop_id;
  END;
END $$;

-- Check if the trigger is actually enabled
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE 'UNKNOWN: ' || tgenabled::text
  END as status
FROM pg_trigger
WHERE tgrelid = 'reviews'::regclass
AND tgname = 'refresh_ratings_on_review_change';
