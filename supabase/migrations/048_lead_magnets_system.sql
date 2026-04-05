-- Lead Magnets System
-- Tracks downloadable lead magnet content and captures leads

-- Create lead magnets table
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'buyer', 'landlord', 'renter', 'agent'
  priority INTEGER DEFAULT 1, -- 1 = high priority, 2 = secondary, 3 = bonus
  file_url TEXT NOT NULL, -- Uploadthing URL for PDF/downloadable content
  thumbnail_image_url TEXT,
  gate_fields TEXT[] DEFAULT ARRAY[]::TEXT[], -- Email, Location, etc.
  conversion_tracking BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create lead magnet downloads table (captures leads)
CREATE TABLE IF NOT EXISTS lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  location TEXT,
  additional_data JSONB DEFAULT '{}'::JSONB, -- Flexible field storage
  user_type TEXT, -- 'buyer', 'seller', 'landlord', 'renter', 'agent'
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  source_page TEXT, -- Where they downloaded from
  converted BOOLEAN DEFAULT FALSE, -- Did they create a listing/inquiry?
  conversion_date TIMESTAMP WITH TIME ZONE,
  conversion_type TEXT -- 'property_listing', 'inquiry', 'agent_signup'
);

-- Create email automation workflows table
CREATE TABLE IF NOT EXISTS email_automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL, -- 'welcome', 'nurture', 're_engagement'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email automation steps
CREATE TABLE IF NOT EXISTS email_automation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES email_automation_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_hours INTEGER DEFAULT 0, -- Hours after previous step
  email_template_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email automation logs (track sent emails)
CREATE TABLE IF NOT EXISTS email_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  download_id UUID NOT NULL REFERENCES lead_magnet_downloads(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES email_automation_workflows(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES email_automation_steps(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced BOOLEAN DEFAULT FALSE,
  error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_magnets_slug ON lead_magnets(slug);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_category ON lead_magnets(category);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_email ON lead_magnet_downloads(email);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_lead_magnet_id ON lead_magnet_downloads(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_converted ON lead_magnet_downloads(converted);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_created_at ON lead_magnet_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_email_automation_logs_download_id ON email_automation_logs(download_id);
CREATE INDEX IF NOT EXISTS idx_email_automation_logs_sent_at ON email_automation_logs(sent_at);

-- Enable RLS
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public can read active lead magnets
CREATE POLICY "Anyone can read active lead magnets"
  ON lead_magnets FOR SELECT
  USING (is_active = TRUE);

-- RLS Policies - Admin only for writes
CREATE POLICY "Only admins can manage lead magnets"
  ON lead_magnets FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Anyone can insert their download (lead capture)
CREATE POLICY "Anyone can submit lead magnet download"
  ON lead_magnet_downloads FOR INSERT
  WITH CHECK (TRUE);

-- Users can view their own downloads
CREATE POLICY "Users can view their own downloads"
  ON lead_magnet_downloads FOR SELECT
  USING (email = CURRENT_USER OR auth.uid()::TEXT = email);

-- Admin can view all downloads
CREATE POLICY "Admins can view all downloads"
  ON lead_magnet_downloads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admin only for automation workflows
CREATE POLICY "Only admins can manage workflows"
  ON email_automation_workflows FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can manage workflow steps"
  ON email_automation_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can view automation logs"
  ON email_automation_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Trigger to update lead_magnets.updated_at
CREATE TRIGGER update_lead_magnets_updated_at
  BEFORE UPDATE ON lead_magnets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update email_automation_workflows.updated_at
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON email_automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial lead magnets (10 magnets from recommendations)
INSERT INTO lead_magnets (slug, title, description, category, priority, gate_fields, file_url, is_active) VALUES
  (
    'buying-guide-zimbabwe',
    'The Ultimate Guide to Buying Property in Zimbabwe',
    'Complete step-by-step guide to property purchase process, costs breakdown, and red flags to watch.',
    'buyer',
    1,
    ARRAY['name', 'email', 'location'],
    'https://placeholder-pdf.example.com/buying-guide.pdf',
    TRUE
  ),
  (
    'landlord-rental-yield',
    'Landlord''s Guide to Maximizing Rental Yield in Zimbabwe',
    'Suburb-by-suburb rental yield analysis, tenant screening, legal obligations, and pricing strategies.',
    'landlord',
    1,
    ARRAY['name', 'email', 'location'],
    'https://placeholder-pdf.example.com/rental-yield.pdf',
    TRUE
  ),
  (
    'home-valuation-tool',
    'Home Valuation Tool & Instant Property Estimator',
    'Instant online tool to estimate your property value based on location, type, and condition.',
    'buyer',
    1,
    ARRAY['email', 'property_address'],
    'https://placeholder-pdf.example.com/valuation-report.pdf',
    TRUE
  ),
  (
    'rental-affordability-calculator',
    'Rental Affordability Calculator & Budget Planner',
    'Calculate your ideal rental budget including utilities, security, and commuting costs in Zimbabwean context.',
    'renter',
    2,
    ARRAY['name', 'email'],
    'https://placeholder-pdf.example.com/budget-planner.pdf',
    TRUE
  ),
  (
    'relocation-guide',
    'Moving to Harare, Bulawayo or Victoria Falls Guide',
    'Hyper-local guides for relocating to major Zimbabwe cities with suburb rankings, costs, and amenities.',
    'renter',
    2,
    ARRAY['name', 'email', 'city'],
    'https://placeholder-pdf.example.com/relocation-guide.pdf',
    TRUE
  ),
  (
    'agent-commission-calculator',
    'Real Estate Agent Commission Calculator & Proposal Template',
    'Professional tools for agents to calculate commissions, generate client proposals, and marketing plans.',
    'agent',
    2,
    ARRAY['name', 'email', 'agency_name'],
    'https://placeholder-pdf.example.com/agent-toolkit.pdf',
    TRUE
  ),
  (
    'investment-roi-calculator',
    'Property Investment ROI Calculator (Airbnb vs Long-term)',
    'Compare yields between traditional rental and short-term rental (Airbnb) investments with location-specific data.',
    'landlord',
    2,
    ARRAY['name', 'email', 'property_type'],
    'https://placeholder-pdf.example.com/roi-calculator.pdf',
    TRUE
  ),
  (
    'property-laws-cheat-sheet',
    'Zimbabwe Property Laws & Regulations Cheat Sheet',
    'PDF covering Urban Councils Act, tenant rights, landlord obligations, and ZIMRA property tax guide.',
    'buyer',
    3,
    ARRAY['email'],
    'https://placeholder-pdf.example.com/laws-cheat-sheet.pdf',
    TRUE
  ),
  (
    'renovation-roi-guide',
    'Property Renovation ROI Guide',
    'What renovations add the most value, cost estimates, before/after examples, and contractor referrals.',
    'buyer',
    3,
    ARRAY['name', 'email'],
    'https://placeholder-pdf.example.com/renovation-guide.pdf',
    TRUE
  ),
  (
    'market-report-newsletter',
    'Weekly Property Market Report Newsletter',
    'Subscribe to weekly/monthly market trends, new listings, price movements, and expert insights.',
    'buyer',
    3,
    ARRAY['name', 'email'],
    'https://placeholder-pdf.example.com/market-report.pdf',
    TRUE
  ) ON CONFLICT DO NOTHING;

-- Create default email automation workflows
INSERT INTO email_automation_workflows (name, trigger_lead_magnet_id, workflow_type, is_active)
SELECT CONCAT(title, ' - Welcome'), id, 'welcome', TRUE
FROM lead_magnets
WHERE slug IN ('buying-guide-zimbabwe', 'landlord-rental-yield', 'home-valuation-tool')
ON CONFLICT DO NOTHING;

-- Log: migration complete
-- Total: 5 tables, 1 junction table, email logs table, 10 lead magnets pre-seeded
