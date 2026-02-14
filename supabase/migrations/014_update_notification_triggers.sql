-- =============================================
-- UPDATE NOTIFICATION TRIGGERS
-- Migration: 014_update_notification_triggers.sql
-- 
-- Updates notification triggers to:
-- 1. Remove stale /dashboard/messages links (now handled by floating chat widget)
-- 2. Add conversation_id to inquiry notifications metadata
-- =============================================

-- Updated: Create notification when new message is received
-- Changed: link from '/dashboard/messages' to NULL (handled by floating chat widget)
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation RECORD;
  v_sender_name TEXT;
  v_recipient_id UUID;
BEGIN
  -- Get conversation details
  SELECT * INTO v_conversation
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Get sender name
  SELECT name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Determine recipient (the other participant)
  IF NEW.sender_id = v_conversation.renter_id THEN
    v_recipient_id := v_conversation.landlord_id;
  ELSE
    v_recipient_id := v_conversation.renter_id;
  END IF;
  
  -- Create notification for recipient
  -- link is NULL because the floating chat widget handles opening via metadata
  PERFORM create_notification(
    v_recipient_id,
    'message',
    'New Message',
    COALESCE(v_sender_name, 'Someone') || ': ' || LEFT(NEW.content, 50),
    NULL,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated: Create notification when new inquiry is received
-- Changed: link from '/dashboard/my-properties' to NULL (handled by floating chat widget)
-- Added: sender_id to metadata for better context
CREATE OR REPLACE FUNCTION notify_on_new_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  v_property RECORD;
  v_sender_name TEXT;
BEGIN
  -- Get property details
  SELECT * INTO v_property
  FROM properties
  WHERE id = NEW.property_id;
  
  -- Get sender name
  SELECT name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Create notification for property owner
  -- link is NULL because the floating chat widget handles opening via metadata
  PERFORM create_notification(
    v_property.user_id,
    'inquiry',
    'New Inquiry',
    COALESCE(v_sender_name, 'Someone') || ' inquired about ' || v_property.title,
    NULL,
    jsonb_build_object(
      'property_id', NEW.property_id,
      'inquiry_id', NEW.id,
      'sender_id', NEW.sender_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
