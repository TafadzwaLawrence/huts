-- Agent System Rebuild - Phase 1: Foundation & Lead Distribution
-- Builds on top of migration 021_agents_system.sql
-- Creates NEW tables (brokerages, agents (refactored), teams, leads, clients, appointments) WITHOUT recreating existing ones
-- Generated: 2026-03-21

-- ============================================================================
-- TABLE: brokerages
-- Real estate brokerage companies (optional - single agents can exist without brokerage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS brokerages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  website_url TEXT,
  
  -- Configuration
  assignment_mode TEXT NOT NULL DEFAULT 'round_robin' 
    CHECK (assignment_mode IN ('round_robin', 'performance_based', 'geographic', 'specialty')),
  default_commission_split_pct DECIMAL(5,2) DEFAULT 80.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(name, city)
);

-- ============================================================================
-- TABLE: agents (NEW - replaces agent_profiles workflow)
-- Primary agent account with professional information (refactored from agent_profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  brokerage_id UUID REFERENCES brokerages(id) ON DELETE SET NULL,
  
  -- Basic Info
  agent_type TEXT NOT NULL CHECK (agent_type IN ('real_estate_agent', 'property_manager', 'home_builder', 'photographer', 'other')),
  business_name TEXT,
  license_number TEXT,
  license_state TEXT,
  license_expiry_date DATE,
  years_experience INTEGER,
  
  -- Contact Info
  phone TEXT,
  whatsapp TEXT,
  office_address TEXT,
  office_city TEXT,
  
  -- Profile Content
  bio TEXT,
  specializations TEXT[],
  languages TEXT[],
  certifications TEXT[],
  
  -- Media
  profile_image_url TEXT,
  cover_image_url TEXT,
  video_url TEXT,
  
  -- Stats (auto-calculated)
  properties_listed INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  
  -- Verification & Status
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Featured / Premium
  is_featured BOOLEAN DEFAULT FALSE,
  is_premier BOOLEAN DEFAULT FALSE,
  
  -- SEO
  slug TEXT UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: agent_teams
-- Team structures for multi-agent collaboration
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brokerage_id UUID REFERENCES brokerages(id) ON DELETE SET NULL,
  team_lead_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  team_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  
  -- Configuration
  commission_split_pct DECIMAL(5,2) DEFAULT 80.0,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: team_members
-- Associates agents with teams
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES agent_teams(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member', 'coordinator')),
  commission_split_pct DECIMAL(5,2),
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, agent_id)
);

-- ============================================================================
-- TABLE: clients
-- Persistent buyer/seller profiles (created from converted leads)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  client_type TEXT NOT NULL CHECK (client_type IN ('buyer', 'seller', 'renter', 'landlord', 'mixed')),
  source_lead_id UUID,
  
  preferred_areas TEXT[],
  budget_min INTEGER,
  budget_max INTEGER,
  timeline TEXT,
  special_requirements TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  last_contacted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_notes
-- Private agent notes on clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  note_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: leads (NEW - replaces/refactors agent_inquiries)
-- Lead/inquiry system with distribution tracking and scoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  assigned_to UUID REFERENCES agents(id) ON DELETE SET NULL,
  team_id UUID REFERENCES agent_teams(id) ON DELETE SET NULL,
  
  source TEXT NOT NULL DEFAULT 'inquiry' CHECK (source IN ('inquiry', 'property_listing', 'search', 'advertisement', 'direct')),
  lead_type TEXT NOT NULL CHECK (lead_type IN ('buyer_lead', 'seller_lead', 'rental_lead', 'property_valuation', 'general_inquiry')),
  
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  message TEXT,
  
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_areas TEXT[],
  timeline TEXT,
  
  lead_score DECIMAL(5,2) DEFAULT 0,
  profile_completeness_pct DECIMAL(5,2) DEFAULT 0,
  financing_status TEXT CHECK (financing_status IN ('unknown', 'not_ready', 'pre_approved', 'pre_qualified')),
  
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'assigned', 'claimed', 'contacted', 'in_progress', 'converted', 'closed', 'lost', 'spam'
  )),
  
  auto_assigned_at TIMESTAMPTZ,
  claim_deadline_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  agent_notes TEXT,
  
  user_agent TEXT,
  ip_address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: lead_distribution_history
-- Audit trail for lead assignment and routing decisions
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_distribution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  assigned_team_id UUID REFERENCES agent_teams(id) ON DELETE SET NULL,
  
  assignment_mode TEXT NOT NULL,
  assignment_reason TEXT,
  
  assignment_status TEXT NOT NULL DEFAULT 'assigned' CHECK (assignment_status IN (
    'assigned', 'claimed', 'abandoned', 'reassigned'
  )),
  
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  response_at TIMESTAMPTZ,
  response_time_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: appointments
-- Tours, open houses, meetings, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('tour', 'open_house', 'consultation', 'meeting', 'inspection', 'appraisal')),
  title TEXT NOT NULL,
  description TEXT,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  client_feedback TEXT,
  agent_notes TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  
  google_calendar_event_id TEXT,
  reminder_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: appointment_attendees
-- Who attended the appointment
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointment_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  attendee_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attendee_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  attendance_status TEXT NOT NULL DEFAULT 'invited' CHECK (attendance_status IN ('invited', 'confirmed', 'attended', 'absent', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_brokerages_city ON brokerages(city);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_brokerage_id ON agents(brokerage_id);
CREATE INDEX IF NOT EXISTS idx_agents_agent_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_office_city ON agents(office_city);
CREATE INDEX IF NOT EXISTS idx_agents_avg_rating ON agents(avg_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);

CREATE INDEX IF NOT EXISTS idx_agent_teams_brokerage_id ON agent_teams(brokerage_id);
CREATE INDEX IF NOT EXISTS idx_agent_teams_team_lead_id ON agent_teams(team_lead_id);
CREATE INDEX IF NOT EXISTS idx_agent_teams_is_active ON agent_teams(is_active);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_agent_id ON team_members(agent_id);

CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON clients(client_type);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_agent_id ON client_notes(agent_id);

CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_expires_at ON leads(expires_at);
CREATE INDEX IF NOT EXISTS idx_leads_contact_email ON leads(contact_email);

CREATE INDEX IF NOT EXISTS idx_lead_distribution_history_lead_id ON lead_distribution_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_distribution_history_assigned_agent_id ON lead_distribution_history(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_lead_distribution_history_assigned_at ON lead_distribution_history(assigned_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_agent_id ON appointments(agent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_property_id ON appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointment_attendees_appointment_id ON appointment_attendees(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_attendees_attendee_user_id ON appointment_attendees(attendee_user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_distribution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_attendees ENABLE ROW LEVEL SECURITY;

-- Brokerages: Everyone can view
CREATE POLICY "Brokerages are viewable by everyone"
  ON brokerages FOR SELECT TO public USING (TRUE);

CREATE POLICY "Admins can manage brokerages"
  ON brokerages FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Agents: Active agents publicly visible, agents can edit their own profile
CREATE POLICY "Active agents are viewable by everyone"
  ON agents FOR SELECT TO public USING (is_active = TRUE);

CREATE POLICY "Users can insert their own agent profile"
  ON agents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent profile"
  ON agents FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage any agent"
  ON agents FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Agent Teams: Team lead can manage, team members can view their own
CREATE POLICY "Team members can view their teams"
  ON agent_teams FOR SELECT TO authenticated
  USING (
    team_lead_id = auth.uid() OR 
    id IN (SELECT team_id FROM team_members WHERE agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()))
  );

CREATE POLICY "Team leads can manage their teams"
  ON agent_teams FOR ALL TO authenticated USING (team_lead_id = auth.uid());

-- Team Members: Only team leads and members can view
CREATE POLICY "Team members can view team membership"
  ON team_members FOR SELECT TO authenticated
  USING (
    agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()) OR
    team_id IN (SELECT id FROM agent_teams WHERE team_lead_id IN (SELECT id FROM agents WHERE user_id = auth.uid()))
  );

-- Clients: Agent can view clients they manage, clients can view their own record
CREATE POLICY "Agents can view their clients"
  ON clients FOR SELECT TO authenticated
  USING (
    agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()) OR 
    user_id = auth.uid()
  );

CREATE POLICY "Agents can create clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can update their clients"
  ON clients FOR UPDATE TO authenticated
  USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

-- Client Notes: Agent who created can view/edit
CREATE POLICY "Agents can view and manage their client notes"
  ON client_notes FOR ALL TO authenticated
  USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

-- Leads: Assigned agent and team members can view
CREATE POLICY "Assigned agent and team members can view leads"
  ON leads FOR SELECT TO authenticated
  USING (
    assigned_to IN (SELECT id FROM agents WHERE user_id = auth.uid()) OR
    team_id IN (SELECT team_id FROM team_members WHERE agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()))
  );

CREATE POLICY "Authenticated users can create leads"
  ON leads FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Anonymous users can create leads"
  ON leads FOR INSERT TO anon WITH CHECK (TRUE);

CREATE POLICY "Agents can update leads assigned to them"
  ON leads FOR UPDATE TO authenticated
  USING (assigned_to IN (SELECT id FROM agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all leads"
  ON leads FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Lead Distribution History: Assigned agent and admins can view
CREATE POLICY "Assigned agent can view their lead distribution history"
  ON lead_distribution_history FOR SELECT TO authenticated
  USING (assigned_agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all distribution history"
  ON lead_distribution_history FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Appointments: Agent and attendees can view
CREATE POLICY "Agents can view and manage their appointments"
  ON appointments FOR ALL TO authenticated
  USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

CREATE POLICY "Clients can view their appointments"
  ON appointments FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Appointment Attendees: Appointment owner and attendees can view
CREATE POLICY "Users can view appointment attendees"
  ON appointment_attendees FOR SELECT TO authenticated
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE 
        agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()) OR
        client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    ) OR
    attendee_user_id = auth.uid() OR
    attendee_client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- ============================================================================
-- UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on record modification
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER trg_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_brokerages_updated_at BEFORE UPDATE ON brokerages FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_agent_teams_updated_at BEFORE UPDATE ON agent_teams FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_client_notes_updated_at BEFORE UPDATE ON client_notes FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- Function to calculate lead score based on profile completeness and demographic factors
CREATE OR REPLACE FUNCTION fn_calculate_lead_score(
  p_profile_completeness DECIMAL,
  p_financing_status TEXT,
  p_timeline TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  v_financing_weight DECIMAL := 0;
  v_timeline_weight DECIMAL := 0;
BEGIN
  v_financing_weight := CASE p_financing_status
    WHEN 'pre_approved' THEN 1.0
    WHEN 'pre_qualified' THEN 0.7
    WHEN 'not_ready' THEN 0.3
    ELSE 0
  END;
  
  v_timeline_weight := CASE p_timeline
    WHEN 'asap' THEN 1.0
    WHEN '1_month' THEN 0.8
    WHEN '3_months' THEN 0.5
    WHEN '6_months' THEN 0.3
    ELSE 0.5
  END;
  
  RETURN ROUND(
    (p_profile_completeness * 0.4) + 
    (v_financing_weight * 100 * 0.35) + 
    (v_timeline_weight * 100 * 0.25)
  , 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update agent stats (avg_rating, total_reviews)
CREATE OR REPLACE FUNCTION fn_update_agent_stats(p_agent_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET
    total_reviews = (
      SELECT COUNT(*) FROM agent_reviews
      WHERE agent_id = p_agent_id AND status = 'published'
    ),
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) FROM agent_reviews
      WHERE agent_id = p_agent_id AND status = 'published'
    ),
    updated_at = NOW()
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update agent stats when reviews change
CREATE OR REPLACE FUNCTION fn_trigger_update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM fn_update_agent_stats(NEW.agent_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agent_reviews_update_stats
  AFTER INSERT OR UPDATE OR DELETE ON agent_reviews
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_update_agent_stats();

-- Function to expire unclaimed leads after 15 minutes
CREATE OR REPLACE FUNCTION fn_expire_unclaimed_leads()
RETURNS TABLE(expired_count INTEGER) AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE leads
  SET status = 'expired'
  WHERE status = 'assigned' AND expires_at < NOW();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN QUERY SELECT v_expired_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
