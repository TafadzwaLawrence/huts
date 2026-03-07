-- FIX: agent_inquiries RLS allows anon inserts
-- Migration: 027_fix_agent_inquiries_rls.sql
-- Issue: INSERT policy requires 'authenticated' but AgentContactForm allows guest
--        submissions with user_id = NULL, causing silent failures for logged-out users.
-- Fix: Drop authenticated-only policy, add public INSERT policy + anon grant.

-- Also fix: update_agent_stats() missing WHERE clause (causes "UPDATE requires a WHERE clause")
-- when agent_reviews rows are SET NULL on property delete.

-- ============================================================
-- 1. Fix agent_inquiries INSERT policy for anonymous users
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can submit agent inquiries" ON agent_inquiries;
DROP POLICY IF EXISTS "Anyone can submit agent inquiries" ON agent_inquiries;

-- Allow both authenticated and anonymous users to insert inquiries
-- user_id is nullable so guests can submit without an account
CREATE POLICY "Anyone can submit agent inquiries"
  ON agent_inquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Grant INSERT to anon role so the Supabase client can insert without a session
GRANT INSERT ON agent_inquiries TO anon;

-- ============================================================
-- 2. Fix update_agent_stats() missing WHERE clause
-- ============================================================

CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS void AS $$
BEGIN
  UPDATE agent_profiles
  SET
    total_reviews = (
      SELECT COUNT(*) FROM agent_reviews
      WHERE agent_id = agent_profiles.id AND status = 'published'
    ),
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(3,2) FROM agent_reviews
      WHERE agent_id = agent_profiles.id AND status = 'published'
    ),
    updated_at = NOW()
  WHERE TRUE;
END;
$$ LANGUAGE plpgsql;
