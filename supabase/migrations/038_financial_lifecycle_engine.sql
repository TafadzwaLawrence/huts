-- ============================================================
-- Migration 038: Financial Lifecycle Engine
-- ============================================================
-- Extends rental_agreements with late fee config, currency,
-- grace periods, and adds a full financial tracking layer:
--   • lease_recurring_fees    – extra monthly/weekly fees per agreement
--   • lease_obligations       – scheduled charges (rent, late fees, etc.)
--   • financial_ledger_entries – immutable double-entry ledger
--   • lease_adjustments       – landlord-issued credits/charges
--   • deposit_transactions    – deposit received / deductions / refunds
--   • financial_statements    – monthly snapshots generated per agreement
--   • payment_disputes        – tenant disputes with landlord resolution
-- ============================================================

-- ── 1. Extend rental_agreements ───────────────────────────────

ALTER TABLE rental_agreements
  ADD COLUMN IF NOT EXISTS due_day            INTEGER DEFAULT 1
    CHECK (due_day BETWEEN 1 AND 28),
  ADD COLUMN IF NOT EXISTS grace_period_days  INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS late_fee_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS late_fee_type      TEXT
    CHECK (late_fee_type IN ('flat', 'percent', 'both')),
  ADD COLUMN IF NOT EXISTS late_fee_flat      BIGINT  DEFAULT 0,  -- cents
  ADD COLUMN IF NOT EXISTS late_fee_percent   NUMERIC(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency           TEXT NOT NULL DEFAULT 'usd'
    CHECK (currency IN ('usd', 'zwl'));

-- ── 2. Recurring fees (e.g. parking, trash, etc.) ─────────────

CREATE TABLE IF NOT EXISTS lease_recurring_fees (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id   UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  name           TEXT         NOT NULL,                   -- e.g. "Parking Fee"
  amount         BIGINT       NOT NULL,                   -- cents
  frequency      TEXT         NOT NULL DEFAULT 'monthly'
                              CHECK (frequency IN ('monthly', 'weekly', 'once')),
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lease_recurring_fees_agreement_id_idx
  ON lease_recurring_fees(agreement_id);

ALTER TABLE lease_recurring_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recurring_fees_party_select" ON lease_recurring_fees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = lease_recurring_fees.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

CREATE POLICY "recurring_fees_landlord_write" ON lease_recurring_fees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = lease_recurring_fees.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- ── 3. Lease obligations ──────────────────────────────────────
-- One row per charge per billing period. Immutable once paid.

CREATE TABLE IF NOT EXISTS lease_obligations (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id    UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  type            TEXT         NOT NULL
                               CHECK (type IN ('rent', 'late_fee', 'recurring_fee', 'deposit', 'adjustment')),
  description     TEXT,                                   -- e.g. "Rent - March 2025"
  amount          BIGINT       NOT NULL,                  -- cents (always positive)
  currency        TEXT         NOT NULL DEFAULT 'usd',
  due_date        DATE         NOT NULL,
  grace_deadline  DATE,                                   -- due_date + grace_period_days
  period_label    TEXT,                                   -- e.g. "2025-03"
  status          TEXT         NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'waived', 'delinquent')),
  amount_paid     BIGINT       NOT NULL DEFAULT 0,        -- cents paid so far
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lease_obligations_agreement_id_idx ON lease_obligations(agreement_id);
CREATE INDEX IF NOT EXISTS lease_obligations_due_date_idx     ON lease_obligations(due_date);
CREATE INDEX IF NOT EXISTS lease_obligations_status_idx       ON lease_obligations(status);

ALTER TABLE lease_obligations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "obligations_party_select" ON lease_obligations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = lease_obligations.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

CREATE POLICY "obligations_landlord_write" ON lease_obligations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = lease_obligations.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS lease_obligations_updated_at ON lease_obligations;
CREATE TRIGGER lease_obligations_updated_at
  BEFORE UPDATE ON lease_obligations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 4. Financial ledger entries (immutable) ───────────────────
-- Every money movement is recorded here. No UPDATE/DELETE allowed.

CREATE TABLE IF NOT EXISTS financial_ledger_entries (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id    UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  obligation_id   UUID         REFERENCES lease_obligations(id) ON DELETE SET NULL,
  type            TEXT         NOT NULL
                               CHECK (type IN ('charge', 'payment', 'credit', 'refund', 'adjustment', 'deposit')),
  amount          BIGINT       NOT NULL,                  -- always positive, sign implied by type
  currency        TEXT         NOT NULL DEFAULT 'usd',
  description     TEXT         NOT NULL,
  reference_id    TEXT,                                   -- external ref (bank TXN, etc.)
  created_by      UUID         NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- NO updated_at — this is intentionally immutable
);

CREATE INDEX IF NOT EXISTS ledger_entries_agreement_id_idx ON financial_ledger_entries(agreement_id);
CREATE INDEX IF NOT EXISTS ledger_entries_obligation_id_idx ON financial_ledger_entries(obligation_id);
CREATE INDEX IF NOT EXISTS ledger_entries_created_at_idx   ON financial_ledger_entries(created_at);

ALTER TABLE financial_ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ledger_party_select" ON financial_ledger_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = financial_ledger_entries.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

-- Only landlord can insert ledger entries (payments are landlord-logged)
CREATE POLICY "ledger_landlord_insert" ON financial_ledger_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = financial_ledger_entries.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- NO UPDATE / DELETE policy = immutable once written

-- ── 5. Lease adjustments ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS lease_adjustments (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id   UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  created_by     UUID         NOT NULL REFERENCES profiles(id),
  type           TEXT         NOT NULL CHECK (type IN ('charge', 'credit')),
  amount         BIGINT       NOT NULL,                   -- cents
  currency       TEXT         NOT NULL DEFAULT 'usd',
  reason         TEXT         NOT NULL,
  applied_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lease_adjustments_agreement_id_idx ON lease_adjustments(agreement_id);

ALTER TABLE lease_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adjustments_party_select" ON lease_adjustments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = lease_adjustments.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

CREATE POLICY "adjustments_landlord_insert" ON lease_adjustments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = lease_adjustments.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- ── 6. Deposit transactions ───────────────────────────────────

CREATE TABLE IF NOT EXISTS deposit_transactions (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id   UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  type           TEXT         NOT NULL CHECK (type IN ('received', 'deduction', 'refund')),
  amount         BIGINT       NOT NULL,                   -- cents
  reason         TEXT,
  created_by     UUID         NOT NULL REFERENCES profiles(id),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deposit_txns_agreement_id_idx ON deposit_transactions(agreement_id);

ALTER TABLE deposit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deposit_party_select" ON deposit_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = deposit_transactions.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

CREATE POLICY "deposit_landlord_insert" ON deposit_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = deposit_transactions.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- ── 7. Financial statements ───────────────────────────────────
-- Monthly snapshots generated on-demand or via cron.

CREATE TABLE IF NOT EXISTS financial_statements (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id     UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  period_start     DATE         NOT NULL,
  period_end       DATE         NOT NULL,
  opening_balance  BIGINT       NOT NULL DEFAULT 0,       -- cents (+ = tenant owes, - = overpaid)
  total_charges    BIGINT       NOT NULL DEFAULT 0,
  total_payments   BIGINT       NOT NULL DEFAULT 0,
  closing_balance  BIGINT       NOT NULL DEFAULT 0,
  currency         TEXT         NOT NULL DEFAULT 'usd',
  generated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (agreement_id, period_start)
);

CREATE INDEX IF NOT EXISTS statements_agreement_id_idx ON financial_statements(agreement_id);

ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "statements_party_select" ON financial_statements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = financial_statements.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

CREATE POLICY "statements_landlord_insert" ON financial_statements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = financial_statements.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

CREATE POLICY "statements_landlord_update" ON financial_statements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = financial_statements.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- ── 8. Payment disputes ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_disputes (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id       UUID         NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  obligation_id      UUID         REFERENCES lease_obligations(id) ON DELETE SET NULL,
  tenant_id          UUID         NOT NULL REFERENCES profiles(id),
  reason             TEXT         NOT NULL,
  status             TEXT         NOT NULL DEFAULT 'open'
                                  CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolution_notes   TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  resolved_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS disputes_agreement_id_idx ON payment_disputes(agreement_id);
CREATE INDEX IF NOT EXISTS disputes_tenant_id_idx    ON payment_disputes(tenant_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx       ON payment_disputes(status);

ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disputes_party_select" ON payment_disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = payment_disputes.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

-- Tenants can open disputes
CREATE POLICY "disputes_tenant_insert" ON payment_disputes
  FOR INSERT WITH CHECK (
    auth.uid() = tenant_id AND
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = payment_disputes.agreement_id
        AND ra.tenant_id = auth.uid()
    )
  );

-- Landlord can resolve/dismiss (UPDATE)
CREATE POLICY "disputes_landlord_resolve" ON payment_disputes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = payment_disputes.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- ── 9. Helper function: calculate current balance ─────────────
-- balance > 0 means tenant owes money
-- balance < 0 means tenant has a credit

CREATE OR REPLACE FUNCTION fn_agreement_balance(p_agreement_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    SUM(CASE
      WHEN type IN ('charge', 'deposit') THEN  amount
      WHEN type IN ('payment', 'credit', 'refund', 'adjustment') THEN -amount
    END),
    0
  )
  FROM financial_ledger_entries
  WHERE agreement_id = p_agreement_id;
$$;

-- ── 10. Late fee cron helper function ────────────────────────
-- Marks obligations as overdue past their grace deadline
-- and inserts late fee obligations where configured.

CREATE OR REPLACE FUNCTION fn_process_late_fees()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_agreement RECORD;
  v_late_amount BIGINT;
BEGIN
  -- 1. Mark pending obligations as overdue when grace deadline has passed
  UPDATE lease_obligations
  SET status = 'overdue',
      updated_at = NOW()
  WHERE status = 'pending'
    AND grace_deadline IS NOT NULL
    AND grace_deadline < CURRENT_DATE;

  -- 2. For agreements with late fees enabled, create late fee obligations
  FOR v_agreement IN
    SELECT
      ra.id,
      ra.late_fee_type,
      ra.late_fee_flat,
      ra.late_fee_percent,
      ra.currency,
      lo.id   AS obligation_id,
      lo.amount AS obligation_amount,
      lo.period_label,
      lo.due_date
    FROM rental_agreements  ra
    JOIN lease_obligations  lo ON lo.agreement_id = ra.id
    WHERE ra.late_fee_enabled = TRUE
      AND lo.type = 'rent'
      AND lo.status = 'overdue'
      -- Only generate late fee once per obligation
      AND NOT EXISTS (
        SELECT 1 FROM lease_obligations lf
        WHERE lf.agreement_id = ra.id
          AND lf.type = 'late_fee'
          AND lf.period_label = lo.period_label
      )
  LOOP
    -- Calculate late fee amount
    CASE v_agreement.late_fee_type
      WHEN 'flat' THEN
        v_late_amount := v_agreement.late_fee_flat;
      WHEN 'percent' THEN
        v_late_amount := ROUND(v_agreement.obligation_amount * v_agreement.late_fee_percent / 100.0);
      WHEN 'both' THEN
        v_late_amount := v_agreement.late_fee_flat +
          ROUND(v_agreement.obligation_amount * v_agreement.late_fee_percent / 100.0);
      ELSE
        v_late_amount := 0;
    END CASE;

    IF v_late_amount > 0 THEN
      INSERT INTO lease_obligations (
        agreement_id, type, description, amount, currency,
        due_date, period_label, status
      ) VALUES (
        v_agreement.id,
        'late_fee',
        'Late Fee - ' || v_agreement.period_label,
        v_late_amount,
        v_agreement.currency,
        CURRENT_DATE,
        v_agreement.period_label,
        'pending'
      );

      -- Also add a ledger charge entry
      INSERT INTO financial_ledger_entries (
        agreement_id, type, amount, currency, description, created_by
      )
      SELECT
        v_agreement.id,
        'charge',
        v_late_amount,
        v_agreement.currency,
        'Late Fee - ' || v_agreement.period_label,
        ra.landlord_id
      FROM rental_agreements ra WHERE ra.id = v_agreement.id;
    END IF;
  END LOOP;
END;
$$;

-- ── 11. Indexes for performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS ledger_type_idx ON financial_ledger_entries(type);

-- ── Verification query ────────────────────────────────────────
DO $$
DECLARE
  v_cols TEXT;
BEGIN
  SELECT string_agg(column_name, ', ' ORDER BY column_name) INTO v_cols
  FROM information_schema.columns
  WHERE table_name = 'rental_agreements'
    AND column_name IN ('currency', 'due_day', 'grace_period_days', 'late_fee_enabled', 'late_fee_flat', 'late_fee_percent', 'late_fee_type');

  RAISE NOTICE 'Migration 038 complete. New rental_agreements columns: %', v_cols;
END;
$$;
