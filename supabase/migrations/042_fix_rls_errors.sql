-- ============================================================================
-- MIGRATION 042: Fix three RLS/permission errors
--
-- 1. leads 500     — Recursive RLS: team_members sub-query inside leads SELECT
--                    policy causes infinite policy evaluation → 500
--
-- 2. properties 403 — Agent INSERT: user_id is set to the owner's UUID (not
--                    auth.uid()), so condition-1 fails; the agents EXISTS
--                    sub-query is evaluated under anon RLS and can fail because
--                    is_active check excludes the agent.  Fix: allow INSERT when
--                    agent_id in the new row links to the calling user's agent
--                    record (cleaner, avoids sub-query RLS recursion).
--
-- 3. price_history 42501 — record_initial_price() and record_price_change()
--                    trigger functions run as the calling user who has no INSERT
--                    policy on price_history (only SELECT is defined).
--                    Fix: mark both functions SECURITY DEFINER so they run as
--                    the postgres/owner role and bypass RLS.
--
-- Run this in the Supabase SQL Editor.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Fix leads SELECT policy (remove recursive team_members sub-query)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agents_can_view_their_leads" ON leads;

-- Simplified: agent sees leads assigned directly to them.
-- Team-based visibility removed until a safe SECURITY DEFINER helper is in
-- place (avoids recursive policy evaluation through team_members → agent_teams).
CREATE POLICY "agents_can_view_their_leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.user_id = auth.uid()
        AND a.id = leads.assigned_to
    )
    OR
    -- Admins can see all leads
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Fix properties INSERT policy for agents listing on behalf of owners
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Owners and agents can insert properties" ON properties;

CREATE POLICY "Owners and agents can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Owner listing their own property
    auth.uid() = user_id
    OR
    -- Agent listing on behalf of a client:
    -- the agent_id column in the new row must belong to the calling user
    agent_id IN (
      SELECT id FROM agents
      WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Fix price_history trigger functions — make them SECURITY DEFINER
--    so they run as the function owner (bypasses RLS on price_history)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  old_price BIGINT;
  new_price BIGINT;
  change    BIGINT;
  pct       NUMERIC(5,2);
  evt       TEXT;
BEGIN
  IF NEW.listing_type = 'sale' THEN
    old_price := OLD.sale_price;
    new_price := NEW.sale_price;
  ELSE
    old_price := OLD.price;
    new_price := NEW.price;
  END IF;

  IF old_price IS NOT NULL AND new_price IS NOT NULL AND old_price <> new_price THEN
    change := new_price - old_price;
    IF old_price > 0 THEN
      pct := ROUND((change::NUMERIC / old_price::NUMERIC) * 100, 2);
    END IF;
    evt := CASE WHEN change > 0 THEN 'price_increase' ELSE 'price_drop' END;

    INSERT INTO price_history (property_id, event_type, price, previous_price, change_amount, change_percent)
    VALUES (NEW.id, evt, new_price, old_price, change, pct);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION record_initial_price()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  initial_price BIGINT;
BEGIN
  IF NEW.listing_type = 'sale' THEN
    initial_price := NEW.sale_price;
  ELSE
    initial_price := NEW.price;
  END IF;

  IF initial_price IS NOT NULL THEN
    INSERT INTO price_history (property_id, event_type, price)
    VALUES (NEW.id, 'listed', initial_price);
  END IF;

  RETURN NEW;
END;
$$;
