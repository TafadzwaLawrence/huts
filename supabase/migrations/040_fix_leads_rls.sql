-- ============================================================================
-- MIGRATION 040: Fix duplicate/conflicting leads RLS policies
--
-- Problem: Migration 030 and 031 both created SELECT policies on the leads
-- table. Migration 031 supersedes 030's policy but didn't drop it, leaving
-- two overlapping policies. Also drop the old 030 UPDATE policy and replace
-- with a clean version.
--
-- The leads table uses `assigned_to` (references agents.id) as confirmed
-- by the production schema.
--
-- Run this in the Supabase SQL Editor.
-- ============================================================================

-- Drop all existing leads SELECT/UPDATE policies to start clean
DROP POLICY IF EXISTS "agents_can_view_their_leads" ON leads;
DROP POLICY IF EXISTS "Assigned agent and team members can view leads" ON leads;
DROP POLICY IF EXISTS "Agents can update leads assigned to them" ON leads;
DROP POLICY IF EXISTS "agents_can_update_their_leads" ON leads;

-- Recreate SELECT policy using the correct column name: assigned_to
CREATE POLICY "agents_can_view_their_leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.user_id = auth.uid()
        AND a.id = leads.assigned_to
    )
    OR
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      JOIN agents a ON a.id = tm.agent_id
      WHERE a.user_id = auth.uid()
    )
  );

-- Recreate UPDATE policy using the correct column name
CREATE POLICY "agents_can_update_their_leads"
  ON leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.user_id = auth.uid()
        AND a.id = leads.assigned_to
    )
  );
