-- ============================================
-- ZILLOW-STYLE PROPERTY FEATURES
-- Adds fields for property criteria, pet policy, office hours, fees, etc.
-- ============================================

-- ============================================
-- 1. ADD NEW COLUMNS TO PROPERTIES TABLE
-- ============================================

-- Property Criteria & Requirements
ALTER TABLE properties ADD COLUMN IF NOT EXISTS income_requirement TEXT DEFAULT '3x rent'; -- e.g., "3x rent", "2.5x rent"
ALTER TABLE properties ADD COLUMN IF NOT EXISTS credit_score_min INTEGER; -- minimum credit score
ALTER TABLE properties ADD COLUMN IF NOT EXISTS employment_verification BOOLEAN DEFAULT TRUE;

-- Pet Policy Details
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pets_small_dogs BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pets_large_dogs BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pets_cats BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pets_max_count INTEGER DEFAULT 0; -- max pets allowed
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_deposit_cents INTEGER; -- one-time pet deposit
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_rent_monthly_cents INTEGER; -- monthly pet rent

-- Lease Terms
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_terms TEXT[] DEFAULT ARRAY['12 months']; -- e.g., ['6 months', '12 months', 'Month-to-month']
ALTER TABLE properties ADD COLUMN IF NOT EXISTS min_lease_months INTEGER DEFAULT 12;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_lease_months INTEGER;

-- Fees & Charges
ALTER TABLE properties ADD COLUMN IF NOT EXISTS application_fee_cents INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS admin_fee_cents INTEGER; -- one-time admin/redecoration fee
ALTER TABLE properties ADD COLUMN IF NOT EXISTS security_deposit_cents INTEGER; -- refundable security deposit
ALTER TABLE properties ADD COLUMN IF NOT EXISTS utility_fees JSONB DEFAULT '{}'::jsonb; -- {"electricity": "varies", "water": 1500, "gas": "included"}
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_fee_monthly_cents INTEGER; -- monthly parking fee
ALTER TABLE properties ADD COLUMN IF NOT EXISTS storage_fee_monthly_cents INTEGER; -- monthly storage fee

-- Property Manager / Landlord Contact
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_manager_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_manager_company TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_manager_phone TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_manager_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_manager_website TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS office_hours JSONB DEFAULT '{}'::jsonb; -- {"mon": "9am-5pm", "tue": "9am-5pm", ...}

-- Building Features (for multi-unit properties)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_units INTEGER; -- total units in building
ALTER TABLE properties ADD COLUMN IF NOT EXISTS units_available INTEGER; -- available units
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plans JSONB DEFAULT '[]'::jsonb; -- array of floor plan objects
ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT; -- 3D tour URL

-- Neighborhood Scores (can be fetched from third-party APIs)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS walk_score INTEGER; -- 0-100
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bike_score INTEGER; -- 0-100
ALTER TABLE properties ADD COLUMN IF NOT EXISTS transit_score INTEGER; -- 0-100

-- Special Offers
ALTER TABLE properties ADD COLUMN IF NOT EXISTS special_offers JSONB DEFAULT '[]'::jsonb; -- [{text: "...", expires: "2026-02-28"}]

-- ============================================
-- 2. CREATE PROPERTY FAQS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS property_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_property_faqs_property_id ON property_faqs(property_id);
CREATE INDEX idx_property_faqs_display_order ON property_faqs(property_id, display_order);

-- RLS for property_faqs
ALTER TABLE property_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property FAQs"
  ON property_faqs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_faqs.property_id
        AND properties.status = 'active'
        AND properties.verification_status = 'approved'
    )
  );

CREATE POLICY "Property owners can manage their property FAQs"
  ON property_faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_faqs.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_property_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_faqs_updated_at
  BEFORE UPDATE ON property_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_property_faqs_updated_at();

-- ============================================
-- 3. CREATE NEARBY SCHOOLS TABLE (optional)
-- ============================================

CREATE TABLE IF NOT EXISTS nearby_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grades TEXT, -- e.g., "PK-5", "6-8", "9-12"
  rating DECIMAL(2,1), -- GreatSchools rating 0.0-10.0
  distance_mi DECIMAL(4,2), -- distance in miles
  school_type TEXT, -- "public", "private", "charter"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_nearby_schools_property_id ON nearby_schools(property_id);

-- RLS for nearby_schools
ALTER TABLE nearby_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view nearby schools"
  ON nearby_schools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = nearby_schools.property_id
        AND properties.status = 'active'
        AND properties.verification_status = 'approved'
    )
  );

CREATE POLICY "Property owners can manage nearby schools"
  ON nearby_schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = nearby_schools.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

-- Pet-friendly search is common
CREATE INDEX idx_properties_pets_allowed ON properties(pets_allowed) WHERE pets_allowed = TRUE;

-- Walk score filtering
CREATE INDEX idx_properties_walk_score ON properties(walk_score) WHERE walk_score IS NOT NULL;

-- Multi-unit properties
CREATE INDEX idx_properties_total_units ON properties(total_units) WHERE total_units > 1;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Calculate total monthly cost (rent + fees)
CREATE OR REPLACE FUNCTION calculate_total_monthly_cost(property_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  prop RECORD;
BEGIN
  SELECT
    COALESCE(price, 0) as price,
    COALESCE(pet_rent_monthly_cents, 0) as pet_rent,
    COALESCE(parking_fee_monthly_cents, 0) as parking_fee,
    COALESCE(storage_fee_monthly_cents, 0) as storage_fee
  INTO prop
  FROM properties
  WHERE id = property_id;

  total := prop.price + prop.pet_rent + prop.parking_fee + prop.storage_fee;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Get FAQs for a property
CREATE OR REPLACE FUNCTION get_property_faqs(p_property_id UUID)
RETURNS TABLE(question TEXT, answer TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT pf.question, pf.answer
  FROM property_faqs pf
  WHERE pf.property_id = p_property_id
  ORDER BY pf.display_order, pf.created_at;
END;
$$ LANGUAGE plpgsql;
