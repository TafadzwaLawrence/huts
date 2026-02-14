-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_guides ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PROPERTIES POLICIES
-- ============================================

CREATE POLICY "Active properties are viewable by everyone"
  ON properties FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Landlords can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'landlord')
  );

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PROPERTY IMAGES POLICIES
-- ============================================

CREATE POLICY "Property images are viewable with property"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND (status = 'active' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Property owners can manage images"
  ON property_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- SAVED PROPERTIES POLICIES
-- ============================================

CREATE POLICY "Users can view own saved properties"
  ON saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties"
  ON saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave properties"
  ON saved_properties FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INQUIRIES POLICIES
-- ============================================

CREATE POLICY "Users can view own inquiries (sent or received)"
  ON inquiries FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update inquiry status"
  ON inquiries FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ============================================
-- PROPERTY VIEWS POLICIES
-- ============================================

CREATE POLICY "Anyone can insert views"
  ON property_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Property owners can view analytics"
  ON property_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- AREA GUIDES POLICIES (public read)
-- ============================================

CREATE POLICY "Area guides are public"
  ON area_guides FOR SELECT
  USING (true);
