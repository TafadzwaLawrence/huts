-- =============================================
-- REAL-TIME MESSAGING SYSTEM
-- Migration: 012_messages.sql
-- =============================================

-- Enable realtime for messaging
-- Note: Run in Supabase dashboard: ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique conversation per property between renter and landlord
  UNIQUE(property_id, renter_id, landlord_id)
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TYPING INDICATORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS typing_indicators (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (conversation_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_conversations_renter_id ON conversations(renter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_landlord_id ON conversations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = landlord_id);

-- Users can create conversations (as renter)
CREATE POLICY "Renters can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);

-- Participants can update conversation (e.g., last_message_at)
CREATE POLICY "Participants can update conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = landlord_id);

-- Messages RLS
-- Conversation participants can view messages
CREATE POLICY "Participants can view messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

-- Conversation participants can send messages
CREATE POLICY "Participants can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update messages they received"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

-- Typing indicators RLS
-- Conversation participants can view typing indicators
CREATE POLICY "Participants can view typing indicators"
  ON typing_indicators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = typing_indicators.conversation_id
      AND (c.renter_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

-- Users can insert/update their own typing status
CREATE POLICY "Users can manage their typing status"
  ON typing_indicators
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update conversation's last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update conversation when message is sent
DROP TRIGGER IF EXISTS on_message_sent ON messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_property_id UUID,
  p_renter_id UUID,
  p_landlord_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE property_id = p_property_id
    AND renter_id = p_renter_id
    AND landlord_id = p_landlord_id;
  
  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (property_id, renter_id, landlord_id)
    VALUES (p_property_id, p_renter_id, p_landlord_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE (c.renter_id = p_user_id OR c.landlord_id = p_user_id)
      AND m.sender_id != p_user_id
      AND m.read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ENABLE REALTIME
-- =============================================
-- Run these in Supabase SQL Editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
