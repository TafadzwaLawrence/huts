-- ============================================================================
-- MIGRATION 041: Allow agents to list properties (Zillow-like model)
--
-- Changes:
-- 1. Add agent_id column to properties (FK to agents.id)
-- 2. Update RLS policies on properties to allow agent creation/management
-- 3. Allow agents to see/manage properties they listed
--
-- Schema:
-- - user_id (existing): property owner
-- - agent_id (new): agent who listed the property on behalf of owner
--
-- Run this in the Supabase SQL Editor.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add agent_id column to properties table
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;

-- Add indexes for faster queries on agent properties
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent_listing_type ON properties(agent_id, listing_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Update RLS policies on properties — allow agents to list properties
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old restrictive agent policy and landlord-only policies
DROP POLICY IF EXISTS "agents_can_insert_properties" ON properties;
DROP POLICY IF EXISTS "Properties are viewable by owner or agent" ON properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;

-- SELECT: owner, OR agent who listed, OR public if active
CREATE POLICY "Properties viewable by owner agent or all if active"
  ON properties FOR SELECT
  USING (
    auth.uid() = user_id  -- property owner can see their own
    OR
    (
      EXISTS (
        SELECT 1 FROM agents a
        WHERE a.user_id = auth.uid()
          AND a.id = properties.agent_id
      )
    )  -- agent who listed can see and manage
    OR
    status = 'active'  -- active properties visible to all authenticated users
  );

-- INSERT: owner listing their own, OR agent listing for client
CREATE POLICY "Owners and agents can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    auth.uid() = user_id  -- owner listing their own property
    OR
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.user_id = auth.uid()  -- agent (any agent) can create
    )
  );

-- UPDATE: owner of property, or agent who listed it
CREATE POLICY "Owners and agents can update properties"
  ON properties FOR UPDATE
  USING (
    auth.uid() = user_id  -- property owner
    OR
    (
      EXISTS (
        SELECT 1 FROM agents a
        WHERE a.user_id = auth.uid()
          AND a.id = properties.agent_id
      )
    )  -- agent who listed
  );

-- DELETE: owner of property, or agent who listed it
CREATE POLICY "Owners and agents can delete properties"
  ON properties FOR DELETE
  USING (
    auth.uid() = user_id  -- property owner
    OR
    (
      EXISTS (
        SELECT 1 FROM agents a
        WHERE a.user_id = auth.uid()
          AND a.id = properties.agent_id
      )
    )  -- agent who listed
  );

-- Reinstate admin override for all operations
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;

CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
