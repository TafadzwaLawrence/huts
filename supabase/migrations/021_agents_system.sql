-- Agents/Professionals System Migration
-- Modeled after Zillow's agent marketplace
-- Generated: 2026-02-24

-- ============================================================================
-- TABLE: agent_profiles
-- Extended professional profiles for real estate agents, property managers, photographers, etc.
-- ============================================================================

CREATE TABLE agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  agent_type TEXT NOT NULL CHECK (agent_type IN ('real_estate_agent', 'property_manager', 'home_builder', 'photographer', 'other')),
  business_name TEXT,
  license_number TEXT,
  license_state TEXT,
  years_experience INTEGER,
  
  -- Contact Info
  phone TEXT,
  whatsapp TEXT,
  office_address TEXT,
  office_city TEXT,
  service_areas TEXT[], -- Array of cities/neighborhoods they serve
  
  -- Profile Content
  bio TEXT,
  specializations TEXT[], -- e.g., ['luxury_homes', 'first_time_buyers', 'commercial']
  languages TEXT[], -- e.g., ['English', 'Shona', 'Ndebele']
  certifications TEXT[],
  
  -- Media
  profile_image_url TEXT,
  cover_image_url TEXT,
  video_url TEXT,
  
  -- Stats (auto-calculated)
  properties_listed INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  properties_managed INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  response_rate INTEGER, -- percentage
  response_time_hours INTEGER,
  
  -- Verification & Status
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  featured BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  
  -- SEO
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: agent_reviews
-- Professional reviews separate from property reviews
-- ============================================================================

CREATE TABLE agent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Review Categories (1-5 scale)
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  knowledge_rating INTEGER CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
  responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  
  -- Relationship type
  relationship_type TEXT CHECK (relationship_type IN ('buyer', 'seller', 'renter', 'landlord', 'other')),
  
  -- Response from agent
  agent_response TEXT,
  agent_response_date TIMESTAMPTZ,
  
  -- Status
  verified BOOLEAN DEFAULT FALSE, -- Verified transaction
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'flagged', 'removed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One review per user per agent
  UNIQUE(agent_id, reviewer_id)
);

-- ============================================================================
-- TABLE: agent_service_areas
-- Structured service area tracking for better filtering
-- ============================================================================

CREATE TABLE agent_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  neighborhood TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: agent_inquiries
-- Lead/inquiry system for agents
-- ============================================================================

CREATE TABLE agent_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Inquiry Details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('general', 'buying', 'selling', 'renting', 'property_management', 'photography', 'other')),
  
  -- Context
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_areas TEXT[],
  timeline TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'closed', 'spam')),
  agent_notes TEXT,
  
  -- Tracking
  source TEXT, -- 'profile', 'property_listing', 'search', 'advertisement'
  user_agent TEXT,
  ip_address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: agent_achievements
-- Badges/achievements system for gamification and trust
-- ============================================================================

CREATE TABLE agent_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'top_performer',
    'quick_responder',
    'verified_agent',
    'luxury_specialist',
    '100_properties',
    '50_reviews',
    '5_star_agent',
    'rising_star',
    'years_experience_5',
    'years_experience_10',
    'certified_professional'
  )),
  
  earned_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(agent_id, achievement_type)
);

-- ============================================================================
-- TABLE: agent_advertisements
-- Premium advertising campaigns
-- ============================================================================

CREATE TABLE agent_advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  
  -- Campaign Details
  campaign_name TEXT NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('featured_listing', 'profile_boost', 'sponsored_search', 'banner')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Targeting
  target_cities TEXT[],
  target_property_types TEXT[],
  target_price_range_min INTEGER,
  target_price_range_max INTEGER,
  
  -- Budget & Schedule
  budget_total INTEGER, -- in cents
  budget_spent INTEGER DEFAULT 0,
  cost_per_click INTEGER,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX idx_agent_profiles_user_id ON agent_profiles(user_id);
CREATE INDEX idx_agent_profiles_agent_type ON agent_profiles(agent_type);
CREATE INDEX idx_agent_profiles_status ON agent_profiles(status);
CREATE INDEX idx_agent_profiles_slug ON agent_profiles(slug);
CREATE INDEX idx_agent_profiles_featured ON agent_profiles(featured) WHERE featured = TRUE;
CREATE INDEX idx_agent_profiles_city ON agent_profiles(office_city);

CREATE INDEX idx_agent_reviews_agent_id ON agent_reviews(agent_id);
CREATE INDEX idx_agent_reviews_rating ON agent_reviews(rating);
CREATE INDEX idx_agent_reviews_created_at ON agent_reviews(created_at DESC);

CREATE INDEX idx_agent_service_areas_agent_id ON agent_service_areas(agent_id);
CREATE INDEX idx_agent_service_areas_city ON agent_service_areas(city);
CREATE INDEX idx_agent_service_areas_neighborhood ON agent_service_areas(neighborhood);

CREATE INDEX idx_agent_inquiries_agent_id ON agent_inquiries(agent_id);
CREATE INDEX idx_agent_inquiries_status ON agent_inquiries(status);
CREATE INDEX idx_agent_inquiries_created_at ON agent_inquiries(created_at DESC);

CREATE INDEX idx_agent_achievements_agent_id ON agent_achievements(agent_id);

CREATE INDEX idx_agent_advertisements_agent_id ON agent_advertisements(agent_id);
CREATE INDEX idx_agent_advertisements_status ON agent_advertisements(status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_advertisements ENABLE ROW LEVEL SECURITY;

-- Agent profiles: Public read (active only), owner write
CREATE POLICY "Agent profiles are viewable by everyone"
  ON agent_profiles FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Users can insert their own agent profile"
  ON agent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent profile"
  ON agent_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Agent reviews: Public read (published only), authenticated write
CREATE POLICY "Agent reviews are viewable by everyone"
  ON agent_reviews FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can create reviews"
  ON agent_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON agent_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- Service areas: Public read, agent write
CREATE POLICY "Service areas are viewable by everyone"
  ON agent_service_areas FOR SELECT
  TO public
  USING (TRUE);

CREATE POLICY "Agents can manage their service areas"
  ON agent_service_areas FOR ALL
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
  );

-- Inquiries: Agent can read their own
CREATE POLICY "Agents can view inquiries sent to them"
  ON agent_inquiries FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create inquiries"
  ON agent_inquiries FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Agents can update their inquiries"
  ON agent_inquiries FOR UPDATE
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
  );

-- Achievements: Public read
CREATE POLICY "Achievements are viewable by everyone"
  ON agent_achievements FOR SELECT
  TO public
  USING (is_active = TRUE);

-- Advertisements: Agent can manage their own
CREATE POLICY "Agents can view their own advertisements"
  ON agent_advertisements FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can create advertisements"
  ON agent_advertisements FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update their own advertisements"
  ON agent_advertisements FOR UPDATE
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agent_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update agent stats (avg_rating, total_reviews)
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS void AS $$
BEGIN
  UPDATE agent_profiles ap
  SET
    total_reviews = (
      SELECT COUNT(*) FROM agent_reviews
      WHERE agent_id = ap.id AND status = 'published'
    ),
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) FROM agent_reviews
      WHERE agent_id = ap.id AND status = 'published'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_profiles_updated_at
  BEFORE UPDATE ON agent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_reviews_updated_at
  BEFORE UPDATE ON agent_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_inquiries_updated_at
  BEFORE UPDATE ON agent_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_advertisements_updated_at
  BEFORE UPDATE ON agent_advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update agent stats when review is added/updated
CREATE OR REPLACE FUNCTION trigger_update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_agent_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON agent_reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_agent_stats();

-- ============================================================================
-- HELPER FUNCTION: Generate unique agent slug
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_agent_slug(agent_name TEXT, agent_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name
  base_slug := lower(regexp_replace(agent_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Try base slug first
  final_slug := base_slug;
  
  -- If exists, append counter
  WHILE EXISTS (SELECT 1 FROM agent_profiles WHERE slug = final_slug AND id != agent_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
