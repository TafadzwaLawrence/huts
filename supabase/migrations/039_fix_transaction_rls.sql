-- ============================================================================
-- MIGRATION 039: Fix Self-Referential RLS on transaction_participants
--
-- Problem: The policies on transaction_participants contained sub-queries
-- that selected from transaction_participants itself.  PostgreSQL detects
-- this as "infinite recursion in policy for relation transaction_participants"
-- and throws an error on EVERY query that touches the table — including the
-- nested join in GET /api/transactions.  This is why the Transactions page
-- always shows "Couldn't load transactions / Failed to fetch transactions".
--
-- Fix: Replace self-referential USING clauses with simple, non-recursive checks:
--   - profile_id = auth.uid()               (the user's own participant row)
--   - OR profiles.role IN ('agent','admin')  (agents see all participants)
--
-- Run this in the Supabase SQL Editor.
-- ============================================================================

-- ── 1. transaction_participants ─────────────────────────────────────────────

-- Drop both existing policies (they both have the recursive subquery)
DROP POLICY IF EXISTS "transaction_participants_can_view_participants" ON transaction_participants;
DROP POLICY IF EXISTS "agents_can_manage_participants"                 ON transaction_participants;

-- SELECT: own row OR any agent/admin can read
CREATE POLICY "transaction_participants_select"
  ON transaction_participants FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

-- INSERT / UPDATE / DELETE: only agents/admins (non-recursive)
CREATE POLICY "transaction_participants_write"
  ON transaction_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );


-- ── 2. transactions ─────────────────────────────────────────────────────────
-- The existing "agents_can_manage_transactions" FOR ALL policy subqueries
-- transaction_participants, which — when combined with the old recursive
-- transaction_participants policy — also triggered infinite recursion.
-- Simplify it to a direct profiles-role check so it never recurses.

DROP POLICY IF EXISTS "transaction_participants_can_view" ON transactions;
DROP POLICY IF EXISTS "agents_can_manage_transactions"    ON transactions;

-- View: participant rows OR creator OR agent/admin
CREATE POLICY "transactions_select"
  ON transactions FOR SELECT
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM transaction_participants tp
      WHERE tp.transaction_id = transactions.id
        AND tp.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );

-- Write (INSERT/UPDATE/DELETE): creator OR agent/admin
CREATE POLICY "transactions_write"
  ON transactions FOR ALL
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('agent', 'admin')
    )
  );
