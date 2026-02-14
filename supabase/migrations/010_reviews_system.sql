-- ============================================
-- REVIEW SYSTEM TABLES
-- ============================================

-- Review status enum
CREATE TYPE review_status AS ENUM (
  'pending',
  'published',
  'flagged',
  'hidden',
  'deleted'
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL CHECK (char_length(comment) >= 50 AND char_length(comment) <= 2000),
  
  is_verified BOOLEAN DEFAULT FALSE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  
  status review_status DEFAULT 'published',
  flagged_reason TEXT,
  flagged_at TIMESTAMPTZ,
  
  editable_until TIMESTAMPTZ,
  edited BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_review_per_property_user UNIQUE (property_id, author_id)
);

-- Landlord responses
CREATE TABLE review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (char_length(response) >= 10 AND char_length(response) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_response_per_review UNIQUE (review_id)
);

-- Helpful votes
CREATE TABLE review_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_property ON reviews(property_id) WHERE status = 'published';
CREATE INDEX idx_reviews_author ON reviews(author_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(property_id, rating);
CREATE INDEX idx_reviews_created ON reviews(property_id, created_at DESC);
CREATE INDEX idx_review_responses_review ON review_responses(review_id);
CREATE INDEX idx_review_responses_landlord ON review_responses(landlord_id);

-- Auto-set editable_until
CREATE OR REPLACE FUNCTION set_review_editable_until()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.editable_until IS NULL THEN
    NEW.editable_until := NEW.created_at + INTERVAL '7 days';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_review_metadata
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_review_editable_until();

-- Verify review eligibility
CREATE OR REPLACE FUNCTION verify_review_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified := EXISTS (
    SELECT 1 FROM inquiries
    WHERE property_id = NEW.property_id
    AND sender_id = NEW.author_id
    AND created_at < NEW.created_at
  );
  
  IF NEW.is_verified THEN
    SELECT id INTO NEW.inquiry_id
    FROM inquiries
    WHERE property_id = NEW.property_id
    AND sender_id = NEW.author_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verify_review
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION verify_review_eligibility();

-- Property ratings view
CREATE MATERIALIZED VIEW property_ratings AS
SELECT 
  property_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
  COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
  COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
  COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
  COUNT(*) FILTER (WHERE rating = 1) as one_star_count
FROM reviews
WHERE status = 'published'
GROUP BY property_id;

CREATE UNIQUE INDEX idx_property_ratings_property ON property_ratings(property_id);

-- Refresh ratings trigger
CREATE OR REPLACE FUNCTION refresh_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY property_ratings;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_property_ratings();

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Verified users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Responses are viewable with reviews"
  ON review_responses FOR SELECT
  USING (true);

CREATE POLICY "Property owners can create responses"
  ON review_responses FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own responses"
  ON review_responses FOR UPDATE
  USING (auth.uid() = landlord_id);

CREATE POLICY "Anyone can view votes"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Rate limiting
CREATE TABLE review_rate_limits (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, review_date)
);

CREATE OR REPLACE FUNCTION check_review_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  SELECT review_count INTO daily_count
  FROM review_rate_limits
  WHERE user_id = NEW.author_id
  AND review_date = CURRENT_DATE;
  
  IF daily_count IS NULL THEN
    INSERT INTO review_rate_limits (user_id, review_date, review_count)
    VALUES (NEW.author_id, CURRENT_DATE, 1);
  ELSIF daily_count >= 3 THEN
    RAISE EXCEPTION 'Daily review limit exceeded';
  ELSE
    UPDATE review_rate_limits
    SET review_count = review_count + 1
    WHERE user_id = NEW.author_id
    AND review_date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_review_rate_limit
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_rate_limit();
