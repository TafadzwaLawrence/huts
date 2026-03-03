-- FIX: notify_on_new_review uses wrong column name
-- Migration 026: Fix review notification trigger to use author_id instead of user_id

CREATE OR REPLACE FUNCTION notify_on_new_review()
RETURNS TRIGGER AS $$
DECLARE
  v_property RECORD;
  v_reviewer_name TEXT;
BEGIN
  -- Get property details
  SELECT * INTO v_property
  FROM properties
  WHERE id = NEW.property_id;
  
  -- Get reviewer name (FIX: use author_id, not user_id)
  SELECT name INTO v_reviewer_name
  FROM profiles
  WHERE id = NEW.author_id;
  
  -- Create notification for property owner
  PERFORM create_notification(
    v_property.user_id,
    'review',
    'New Review',
    COALESCE(v_reviewer_name, 'Someone') || ' left a ' || NEW.rating || '-star review',
    '/dashboard/reviews',
    jsonb_build_object('property_id', NEW.property_id, 'review_id', NEW.id, 'rating', NEW.rating)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
