-- ============================================================================
-- MIGRATION 036: Unify agent_profiles → agents
--
-- The original migration 021 created an `agent_profiles` table.
-- Migration 030 created a separate `agents` table (the canonical one after the
-- agent system rebuild). The signup page, RLS fixes (035), and agent portal
-- all use `agents`, but the admin pages and find-agent still query
-- `agent_profiles`.
--
-- This migration:
--   1. Adds `status` and `featured` columns to `agents` (missing after 030)
--   2. Syncs `is_active` → `status` for any existing rows
--   3. Fixes `agent_service_areas.agent_id` FK to point to `agents(id)`
--   4. Drops the old `agent_profiles` TABLE (dev env — no production data)
--   5. Creates `agent_profiles` as a VIEW over `agents` for backwards compat
--
-- Paste into Supabase SQL Editor and run.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Add missing columns to `agents`
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'inactive'));

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Indexes for common filters
CREATE INDEX IF NOT EXISTS idx_agents_status   ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(featured);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Sync is_active → status for any rows that were already inserted
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE agents
   SET status = 'active'
 WHERE is_active = TRUE
   AND status    = 'pending';

UPDATE agents
   SET status = 'inactive'
 WHERE is_active = FALSE
   AND status    = 'pending';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Fix agent_service_areas FK → agents(id)
--    (021 pointed it to agent_profiles; after this migration agent_profiles is
--     a view and cannot be the target of a FK)
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE agent_service_areas
  DROP CONSTRAINT IF EXISTS agent_service_areas_agent_id_fkey;

ALTER TABLE agent_service_areas
  ADD CONSTRAINT agent_service_areas_agent_id_fkey
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3b. Fix agent_reviews FK → agents(id)
--     The old FK pointed to agent_profiles(id). Drop it before we drop the table.
--     We re-add it pointing to agents(id) so PostgREST can join it correctly.
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE agent_reviews
  DROP CONSTRAINT IF EXISTS agent_reviews_agent_id_fkey;

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Drop agent_profiles whether it is currently a TABLE or a VIEW
--    CASCADE removes any dependent objects (indexes, policies, old FKs)
-- ──────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Check if it is a regular table
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name   = 'agent_profiles'
       AND table_type   = 'BASE TABLE'
  ) THEN
    DROP TABLE agent_profiles CASCADE;
  -- Check if it is a view
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.views
     WHERE table_schema = 'public'
       AND table_name   = 'agent_profiles'
  ) THEN
    DROP VIEW agent_profiles CASCADE;
  END IF;
END;
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 4b. Re-point agent_reviews FK to agents(id) now that agent_profiles is gone
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE agent_reviews
  ADD CONSTRAINT agent_reviews_agent_id_fkey
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Create agent_profiles VIEW over agents
--    Simple 1-to-1 mapping → PostgreSQL makes it updatable automatically,
--    so existing PATCH/DELETE calls on agent_profiles continue to work.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW agent_profiles AS
  SELECT * FROM agents;

-- Grant access so RLS on the underlying `agents` table governs who can see what
GRANT SELECT ON agent_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON agent_profiles TO authenticated;

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Also add the `slug` index if missing (needed for public profile lookup)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
