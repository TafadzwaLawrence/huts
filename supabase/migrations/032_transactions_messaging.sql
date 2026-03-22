-- ============================================================================
-- MIGRATION 032: Phase 2 - Transactions & Messaging System
--
-- Adds transaction management, messaging, commissions, and document handling
-- for the agent system.
--
-- New tables:
-- - transactions: Property transactions (offers, contracts, closings)
-- - transaction_participants: Agents, clients, buyers involved in transactions
-- - transaction_documents: Uploaded documents (contracts, disclosures, etc.)
-- - messages: Direct messaging between agents and clients
-- - message_threads: Conversation threads
-- - commissions: Commission tracking and splits
-- - transaction_analytics: Performance metrics
--
-- Paste this in Supabase SQL Editor and run.
-- ============================================================================

-- ============================================================================
-- TABLE: transactions
-- Core transaction management for property deals
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rental', 'lease')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_offer', 'under_contract', 'closed', 'cancelled', 'expired')),

  -- Transaction details
  listing_price DECIMAL(12,2),
  offer_price DECIMAL(12,2),
  final_price DECIMAL(12,2),
  commission_rate DECIMAL(5,2), -- e.g., 3.00 for 3%
  commission_amount DECIMAL(10,2),

  -- Dates
  offer_date DATE,
  contract_date DATE,
  closing_date DATE,
  lease_start_date DATE,
  lease_end_date DATE,

  -- Financial details
  earnest_money DECIMAL(10,2),
  down_payment DECIMAL(10,2),
  financing_type TEXT CHECK (financing_type IN ('cash', 'conventional', 'fha', 'va', 'other')),
  appraisal_value DECIMAL(12,2),

  -- Metadata
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: transaction_participants
-- Links agents, clients, buyers to transactions with their roles
-- ============================================================================

CREATE TABLE transaction_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('listing_agent', 'selling_agent', 'buyer_agent', 'buyer', 'seller', 'landlord', 'tenant', 'coordinator')),

  -- Commission split for agents
  commission_split_pct DECIMAL(5,2), -- e.g., 50.00 for 50%
  commission_amount DECIMAL(10,2),

  -- Contact preferences
  can_contact BOOLEAN DEFAULT TRUE,
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'text', 'app')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(transaction_id, profile_id, role)
);

-- ============================================================================
-- TABLE: transaction_documents
-- Document management for contracts, disclosures, etc.
-- ============================================================================

CREATE TABLE transaction_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),

  -- Document details
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'disclosure', 'addendum', 'inspection_report', 'appraisal', 'closing_statement', 'other')),
  title TEXT NOT NULL,
  description TEXT,

  -- File storage (using Supabase Storage)
  file_path TEXT NOT NULL, -- Storage bucket path
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,

  -- Status and access
  is_private BOOLEAN DEFAULT FALSE, -- Only participants can view
  is_executed BOOLEAN DEFAULT FALSE, -- Has been signed/executed
  executed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: transaction_message_threads
-- Conversation threads for transactions (messages table already exists from 012)
-- ============================================================================

CREATE TABLE transaction_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTE: Uses existing 'messages' table from migration 012
-- Reuse for transaction messaging by linking via transaction_message_threads

-- ============================================================================
-- TABLE: commissions
-- Commission tracking and payment management
-- ============================================================================

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Commission details
  total_commission DECIMAL(10,2) NOT NULL,
  agent_split_pct DECIMAL(5,2) NOT NULL, -- Agent's percentage of total commission
  agent_commission DECIMAL(10,2) NOT NULL, -- Amount agent receives

  -- Brokerage split (if applicable)
  brokerage_id UUID REFERENCES brokerages(id),
  brokerage_split_pct DECIMAL(5,2),
  brokerage_commission DECIMAL(10,2),

  -- Payment tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: transaction_analytics
-- Performance metrics and analytics
-- ============================================================================

CREATE TABLE transaction_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,

  -- Metrics
  days_on_market INTEGER,
  offer_to_contract_days INTEGER,
  contract_to_close_days INTEGER,
  total_transaction_days INTEGER,

  -- Performance indicators
  price_vs_list DECIMAL(5,2), -- e.g., 98.50 for 98.5%
  commission_earned DECIMAL(10,2),

  -- Marketing attribution
  lead_source TEXT,
  marketing_channel TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Transactions
CREATE INDEX idx_transactions_property_id ON transactions(property_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_transactions_closing_date ON transactions(closing_date);

-- Transaction participants
CREATE INDEX idx_transaction_participants_transaction_id ON transaction_participants(transaction_id);
CREATE INDEX idx_transaction_participants_profile_id ON transaction_participants(profile_id);
CREATE INDEX idx_transaction_participants_role ON transaction_participants(role);

-- Transaction documents
CREATE INDEX idx_transaction_documents_transaction_id ON transaction_documents(transaction_id);
CREATE INDEX idx_transaction_documents_uploaded_by ON transaction_documents(uploaded_by);
CREATE INDEX idx_transaction_documents_type ON transaction_documents(document_type);

-- Message threads
CREATE INDEX idx_transaction_message_threads_transaction_id ON transaction_message_threads(transaction_id);
CREATE INDEX idx_transaction_message_threads_created_by ON transaction_message_threads(created_by);
CREATE INDEX idx_transaction_message_threads_last_message_at ON transaction_message_threads(last_message_at);

-- Note: messages table indexes already exist from migration 012

-- Commissions
CREATE INDEX idx_commissions_transaction_id ON commissions(transaction_id);
CREATE INDEX idx_commissions_agent_id ON commissions(agent_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_paid_at ON commissions(paid_at);

-- Transaction analytics
CREATE INDEX idx_transaction_analytics_agent_id ON transaction_analytics(agent_id);
CREATE INDEX idx_transaction_analytics_transaction_id ON transaction_analytics(transaction_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trigger_transaction_participants_updated_at
  BEFORE UPDATE ON transaction_participants
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trigger_transaction_documents_updated_at
  BEFORE UPDATE ON transaction_documents
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trigger_transaction_message_threads_updated_at
  BEFORE UPDATE ON transaction_message_threads
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trigger_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- Note: triggers for messages table already exist in migration 012

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_analytics ENABLE ROW LEVEL SECURITY;

-- Note: messages RLS already configured in migration 012

-- Transactions: Participants can view, agents can create/manage
DROP POLICY IF EXISTS "transaction_participants_can_view" ON transactions;
CREATE POLICY "transaction_participants_can_view"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transactions.id
        AND tp.profile_id = auth.uid()
    ) OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "agents_can_manage_transactions" ON transactions;
CREATE POLICY "agents_can_manage_transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transactions.id
        AND tp.profile_id = auth.uid()
        AND tp.role IN ('listing_agent', 'selling_agent', 'buyer_agent', 'coordinator')
    ) OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

-- Transaction participants: Participants can view, agents can manage
DROP POLICY IF EXISTS "transaction_participants_can_view_participants" ON transaction_participants;
CREATE POLICY "transaction_participants_can_view_participants"
  ON transaction_participants FOR SELECT
  USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transaction_participants.transaction_id
        AND tp.profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

DROP POLICY IF EXISTS "agents_can_manage_participants" ON transaction_participants;
CREATE POLICY "agents_can_manage_participants"
  ON transaction_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transaction_participants.transaction_id
        AND tp.profile_id = auth.uid()
        AND tp.role IN ('listing_agent', 'selling_agent', 'buyer_agent', 'coordinator')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

-- Transaction documents: Participants can view non-private, agents can manage
DROP POLICY IF EXISTS "participants_can_view_documents" ON transaction_documents;
CREATE POLICY "participants_can_view_documents"
  ON transaction_documents FOR SELECT
  USING (
    NOT is_private OR
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transaction_documents.transaction_id
        AND tp.profile_id = auth.uid()
    ) OR
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

DROP POLICY IF EXISTS "agents_can_manage_documents" ON transaction_documents;
CREATE POLICY "agents_can_manage_documents"
  ON transaction_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transaction_documents.transaction_id
        AND tp.profile_id = auth.uid()
        AND tp.role IN ('listing_agent', 'selling_agent', 'buyer_agent', 'coordinator')
    ) OR
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

-- Transaction message threads: Participants can view/manage
DROP POLICY IF EXISTS "transaction_thread_participants_can_view" ON transaction_message_threads;
CREATE POLICY "transaction_thread_participants_can_view"
  ON transaction_message_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transaction_message_threads.transaction_id
        AND tp.profile_id = auth.uid()
    ) OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

DROP POLICY IF EXISTS "agents_can_manage_transaction_threads" ON transaction_message_threads;
CREATE POLICY "agents_can_manage_transaction_threads"
  ON transaction_message_threads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transaction_message_threads.transaction_id
        AND tp.profile_id = auth.uid()
        AND tp.role IN ('listing_agent', 'selling_agent', 'buyer_agent', 'coordinator')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

-- Note: messages RLS already configured in migration 012

-- Commissions: Agents can view their commissions, admins can view all
DROP POLICY IF EXISTS "agents_can_view_own_commissions" ON commissions;
CREATE POLICY "agents_can_view_own_commissions"
  ON commissions FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "agents_can_update_own_commissions" ON commissions;
CREATE POLICY "agents_can_update_own_commissions"
  ON commissions FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Transaction analytics: Agents can view their own analytics
DROP POLICY IF EXISTS "agents_can_view_own_analytics" ON transaction_analytics;
CREATE POLICY "agents_can_view_own_analytics"
  ON transaction_analytics FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "agents_can_manage_own_analytics" ON transaction_analytics;
CREATE POLICY "agents_can_manage_own_analytics"
  ON transaction_analytics FOR ALL
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to calculate commission splits
CREATE OR REPLACE FUNCTION fn_calculate_commission_split(
  p_transaction_id UUID,
  p_agent_id UUID
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_commission DECIMAL(10,2);
  agent_split DECIMAL(5,2);
  agent_commission DECIMAL(10,2);
BEGIN
  -- Get transaction commission
  SELECT commission_amount INTO total_commission
  FROM transactions WHERE id = p_transaction_id;

  -- Get agent's split percentage
  SELECT commission_split_pct INTO agent_split
  FROM transaction_participants
  WHERE transaction_id = p_transaction_id
    AND profile_id IN (
      SELECT user_id FROM agents WHERE id = p_agent_id
    )
    AND role IN ('listing_agent', 'selling_agent', 'buyer_agent');

  -- Calculate agent's share
  agent_commission := total_commission * (agent_split / 100);

  RETURN agent_commission;
END;
$$;

-- Function to create commission record
CREATE OR REPLACE FUNCTION fn_create_commission_record(
  p_transaction_id UUID,
  p_agent_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  commission_id UUID;
  total_commission DECIMAL(10,2);
  agent_split DECIMAL(5,2);
  agent_commission DECIMAL(10,2);
  brokerage_id UUID;
  brokerage_split DECIMAL(5,2);
BEGIN
  -- Get transaction details
  SELECT commission_amount INTO total_commission
  FROM transactions WHERE id = p_transaction_id;

  -- Get agent's split
  SELECT tp.commission_split_pct INTO agent_split
  FROM transaction_participants tp
  WHERE tp.transaction_id = p_transaction_id
    AND tp.profile_id IN (
      SELECT a.user_id FROM agents a WHERE a.id = p_agent_id
    )
    AND tp.role IN ('listing_agent', 'selling_agent', 'buyer_agent');

  -- Calculate agent's commission
  agent_commission := total_commission * (agent_split / 100);

  -- Get brokerage info
  SELECT b.id, b.default_commission_split_pct INTO brokerage_id, brokerage_split
  FROM agents a
  JOIN brokerages b ON a.brokerage_id = b.id
  WHERE a.id = p_agent_id;

  -- Create commission record
  INSERT INTO commissions (
    transaction_id,
    agent_id,
    total_commission,
    agent_split_pct,
    agent_commission,
    brokerage_id,
    brokerage_split_pct,
    brokerage_commission
  ) VALUES (
    p_transaction_id,
    p_agent_id,
    total_commission,
    agent_split,
    agent_commission,
    brokerage_id,
    brokerage_split,
    total_commission - agent_commission
  )
  RETURNING id INTO commission_id;

  RETURN commission_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION fn_calculate_commission_split(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_create_commission_record(UUID, UUID) TO authenticated;