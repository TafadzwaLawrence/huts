-- SIMPLER TEST: Returns results instead of messages
WITH test_without_review AS (
  -- Test 1: Delete without review
  SELECT 
    'Test 1: Delete property without review' as test_name,
    (
      WITH created_prop AS (
        INSERT INTO properties (user_id, title, price, listing_type, beds, baths, city, address, status)
        SELECT id, 'NO REVIEW TEST', 100000, 'rent', 1, 1, 'Test', 'Test', 'active'
        FROM profiles LIMIT 1
        RETURNING id
      ),
      deleted AS (
        DELETE FROM properties WHERE id = (SELECT id FROM created_prop)
        RETURNING id
      )
      SELECT CASE 
        WHEN EXISTS(SELECT 1 FROM deleted) THEN '✓ SUCCESS'
        ELSE '✗ FAILED'
      END
    ) as result
),
test_with_review AS (
  -- Test 2: Delete WITH review (the real test)
  SELECT 
    'Test 2: Delete property WITH review' as test_name,
    (
      WITH created_prop AS (
        INSERT INTO properties (user_id, title, price, listing_type, beds, baths, city, address, status)
        SELECT id, 'WITH REVIEW TEST', 100000, 'rent', 1, 1, 'Test', 'Test', 'active'
        FROM profiles LIMIT 1
        RETURNING id, user_id
      ),
      created_review AS (
        INSERT INTO reviews (property_id, author_id, rating, title, comment, status)
        SELECT id, user_id, 5, 'Test', 'This is a test review that meets the fifty character minimum requirement', 'published'
        FROM created_prop
        RETURNING id, property_id
      ),
      try_delete AS (
        DELETE FROM properties 
        WHERE id = (SELECT property_id FROM created_review)
        RETURNING id
      )
      SELECT CASE 
        WHEN EXISTS(SELECT 1 FROM try_delete) THEN '✓✓✓ SUCCESS - FIX WORKS!'
        ELSE '✗✗✗ FAILED - Still broken'
      END
    ) as result
)
SELECT * FROM test_without_review
UNION ALL
SELECT * FROM test_with_review
UNION ALL
SELECT 
  'Trigger status' as test_name,
  CASE 
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'DISABLED - This is the problem!'
    ELSE 'Unknown: ' || tgenabled::text
  END as result
FROM pg_trigger
WHERE tgrelid = 'reviews'::regclass
AND tgname = 'refresh_ratings_on_review_change';
