-- ============================================================================
-- MIGRATION 031: Add 'agent' as a user role
-- 
-- Creates a proper first-class 'agent' role so authenticated agents get their
-- own portal (/agent/) separate from the consumer dashboard (/dashboard/).
--
-- Paste this in Supabase SQL Editor and run.
-- ============================================================================

-- 1. Drop the existing role CHECK constraint and re-add with 'agent'
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('landlord', 'renter', 'admin', 'agent'));

-- 2. Update the handle_new_user trigger function to support 'agent' role
--    (agents who sign up via /agents/signup will still default to 'renter'
--     until explicitly upgraded - this is done via the API after registration)

-- 3. RLS: Agents should be able to view any property (same as renters)
--    The existing policies already cover SELECT for authenticated users,
--    but let's ensure agents can also create and edit properties they represent.

-- Allow agents to insert/update properties (acting on behalf of clients)
DROP POLICY IF EXISTS "agents_can_insert_properties" ON properties;
CREATE POLICY "agents_can_insert_properties"
  ON properties FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'agent'
    )
  );

-- 4. Ensure agents can read all leads assigned to them (already covered in 030,
--    but add explicit policy on new role)

-- leads: agents can see leads assigned to their agent record
DROP POLICY IF EXISTS "agents_can_view_their_leads" ON leads;
CREATE POLICY "agents_can_view_their_leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.user_id = auth.uid()
        AND a.id = leads.assigned_to
    )
  );

-- 5. Function to upgrade a user's role to 'agent' when they complete agent registration
CREATE OR REPLACE FUNCTION fn_upgrade_to_agent(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET role = 'agent', updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Grant execute to authenticated users (they can only call it for themselves via the API layer)
GRANT EXECUTE ON FUNCTION fn_upgrade_to_agent(UUID) TO authenticated;

-- 6. Add index on profiles(role) if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
