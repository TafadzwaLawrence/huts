-- Create a temporary function to test and return results
CREATE OR REPLACE FUNCTION test_property_deletion()
RETURNS TABLE(test_result TEXT, details TEXT) AS $$
DECLARE
  v_prop_id UUID;
  v_user_id UUID;
  v_review_id UUID;
  v_success BOOLEAN := FALSE;
  v_error TEXT := NULL;
BEGIN
  -- Get a user
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  -- Clean up old test data
  DELETE FROM reviews WHERE title = 'Test' AND comment LIKE '%fifty character minimum%';
  DELETE FROM properties WHERE title = 'DELETE TEST';
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
    v_error := 'No error - deletion successful!';
  EXCEPTION 
    WHEN OTHERS THEN
      v_success := FALSE;
      v_error := SQLERRM;
      -- Clean up manually
      DELETE FROM reviews WHERE id = v_review_id;
      DELETE FROM properties WHERE id = v_prop_id;
  END;
  
  -- Return results
  IF v_success THEN
    RETURN QUERY SELECT 
      '✓✓✓ SUCCESS!' as test_result,
      'Property deletion with reviews WORKS! Now clear browser cache (Ctrl+Shift+R) and try from UI.' as details;
  ELSE
    RETURN QUERY SELECT 
      '✗✗✗ FAILED!' as test_result,
      'Error: ' || v_error as details;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the test and show results
SELECT * FROM test_property_deletion();

-- Clean up the test function
DROP FUNCTION test_property_deletion();
