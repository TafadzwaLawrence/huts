-- ============================================================================
-- MIGRATION 037: Clean agent system setup — idempotent, safe to run any time
--
-- Handles any partial state left by migration 036 (which may have failed).
-- Run this in the Supabase SQL Editor.  It is fully safe to run more than once.
--
-- What it does:
--   1. Adds `status` and `featured` columns to `agents` (if missing)
--   2. Syncs `is_active` → `status` for existing rows
--   3. Fixes agent_service_areas FK → agents(id)
--   4. Fixes agent_reviews FK → agents(id)  (may be dangling after 036 partial run)
--   5. Drops agent_profiles (whether TABLE or VIEW) then recreates as VIEW over agents
--   6. Adds indexes
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add columns to agents (IF NOT EXISTS = safe to re-run)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Backfill NULLs before adding NOT NULL constraint
UPDATE agents SET status   = 'pending' WHERE status   IS NULL;
UPDATE agents SET featured = FALSE      WHERE featured IS NULL;

ALTER TABLE agents ALTER COLUMN status   SET NOT NULL;
ALTER TABLE agents ALTER COLUMN featured SET NOT NULL;

-- Add CHECK constraint if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
     WHERE constraint_schema = 'public'
       AND constraint_name   = 'agents_status_check'
  ) THEN
    ALTER TABLE agents
      ADD CONSTRAINT agents_status_check
        CHECK (status IN ('pending', 'active', 'suspended', 'inactive'));
  END IF;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Sync is_active → status
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE agents SET status = 'active'   WHERE is_active = TRUE  AND status = 'pending';
UPDATE agents SET status = 'inactive' WHERE is_active = FALSE AND status = 'pending';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Fix agent_service_areas FK → agents(id)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Drop whatever FK is there (any name)
  ALTER TABLE agent_service_areas
    DROP CONSTRAINT IF EXISTS agent_service_areas_agent_id_fkey;

  -- Re-add pointing to agents
  ALTER TABLE agent_service_areas
    ADD CONSTRAINT agent_service_areas_agent_id_fkey
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

EXCEPTION WHEN duplicate_object THEN
  NULL; -- already pointing to agents(id), nothing to do
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Fix agent_reviews FK → agents(id)
--    May be dangling if 036 dropped it but never re-added it.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  ALTER TABLE agent_reviews
    DROP CONSTRAINT IF EXISTS agent_reviews_agent_id_fkey;

  ALTER TABLE agent_reviews
    ADD CONSTRAINT agent_reviews_agent_id_fkey
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

EXCEPTION WHEN duplicate_object THEN
  NULL;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Drop agent_profiles (table OR view) then recreate as a plain VIEW
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name   = 'agent_profiles'
       AND table_type   = 'BASE TABLE'
  ) THEN
    DROP TABLE agent_profiles CASCADE;

  ELSIF EXISTS (
    SELECT 1 FROM information_schema.views
     WHERE table_schema = 'public'
       AND table_name   = 'agent_profiles'
  ) THEN
    DROP VIEW agent_profiles CASCADE;

  END IF;
END;
$$;

CREATE OR REPLACE VIEW agent_profiles AS
  SELECT * FROM agents;

-- Let RLS on the underlying agents table control access
GRANT SELECT ON agent_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON agent_profiles TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Indexes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_status   ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(featured);
CREATE INDEX IF NOT EXISTS idx_agents_slug     ON agents(slug);


-- ─────────────────────────────────────────────────────────────────────────────
-- Done
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM agents)                              AS total_agents,
  (SELECT COUNT(*) FROM agents WHERE status = 'pending')     AS pending,
  (SELECT COUNT(*) FROM agents WHERE status = 'active')      AS active,
  (SELECT column_name FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'status'
    LIMIT 1)                                                 AS status_col_exists,
  'Setup complete' AS result;
