-- =============================================
-- NOTIFICATIONS SYSTEM
-- Migration: 013_notifications.sql
-- =============================================

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'inquiry', 'review', 'property_update', 'system')),
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications (via triggers/functions)
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, description, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_description, p_link, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE user_id = auth.uid()
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id
      AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- NOTIFICATION TRIGGERS
-- =============================================

-- Trigger: Create notification when new message is received
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
  PERFORM create_notification(
    v_recipient_id,
    'message',
    'New Message',
    COALESCE(v_sender_name, 'Someone') || ': ' || LEFT(NEW.content, 50),
    '/dashboard/messages',
    jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_message();

-- Trigger: Create notification when new inquiry is received
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
  PERFORM create_notification(
    v_property.user_id,
    'inquiry',
    'New Inquiry',
    COALESCE(v_sender_name, 'Someone') || ' inquired about ' || v_property.title,
    '/dashboard/my-properties',
    jsonb_build_object('property_id', NEW.property_id, 'inquiry_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_inquiry_notify ON inquiries;
CREATE TRIGGER on_new_inquiry_notify
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_inquiry();

-- Trigger: Create notification when new review is received
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
  
  -- Get reviewer name
  SELECT name INTO v_reviewer_name
  FROM profiles
  WHERE id = NEW.user_id;
  
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

DROP TRIGGER IF EXISTS on_new_review_notify ON reviews;
CREATE TRIGGER on_new_review_notify
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_review();

-- =============================================
-- ENABLE REALTIME
-- =============================================
-- Run in Supabase SQL Editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
