-- Inquiry status enum
CREATE TYPE inquiry_status AS ENUM (
  'unread',
  'read',
  'replied',
  'archived'
);

-- Inquiries (messages) table
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'unread',
  
  -- Contact preferences
  preferred_contact TEXT,
  preferred_move_in DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_inquiries_property ON inquiries(property_id);
CREATE INDEX idx_inquiries_sender ON inquiries(sender_id);
CREATE INDEX idx_inquiries_recipient ON inquiries(recipient_id);
CREATE INDEX idx_inquiries_status ON inquiries(recipient_id, status);
