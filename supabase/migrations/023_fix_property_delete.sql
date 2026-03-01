-- FIX PROPERTY DELETE
-- Migration: 023_fix_property_delete.sql
-- Issue: "UPDATE requires a WHERE clause" error when deleting properties
-- Solution: Create a secure delete function that properly handles cascading deletes

-- Create secure delete function for properties
CREATE OR REPLACE FUNCTION delete_property(p_property_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check if user owns the property
  IF NOT EXISTS (
    SELECT 1 FROM properties 
    WHERE id = p_property_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Property not found or you do not have permission to delete it';
  END IF;
  
  -- Delete the property (cascading deletes will handle related records)
  DELETE FROM properties 
  WHERE id = p_property_id AND user_id = v_user_id;
  
  -- Return success
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE NOTICE 'Delete property error: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_property(UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION delete_property IS 'Securely delete a property owned by the current user. Handles all cascading deletes properly.';
