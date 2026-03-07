-- ============================================================
-- Migration 028: Rental Agreements & Rent Payment Tracking
-- ============================================================
-- When landlord and tenant finalize a deal:
--   1. A rental_agreement record is created
--   2. The property status is updated to 'rented' or 'sold'
--   3. Monthly payments can be tracked in rent_payments
-- ============================================================

-- ── Rental Agreements ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rental_agreements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id       UUID        NOT NULL REFERENCES profiles(id)   ON DELETE CASCADE,
  tenant_id         UUID        NOT NULL REFERENCES profiles(id)   ON DELETE CASCADE,
  conversation_id   UUID        REFERENCES conversations(id)        ON DELETE SET NULL,

  -- Agreement type mirrors property listing_type
  agreement_type    TEXT        NOT NULL CHECK (agreement_type IN ('rent', 'sale')),
  status            TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'completed', 'terminated')),

  -- Rent-specific fields
  lease_start_date  DATE        NOT NULL,
  lease_end_date    DATE,
  monthly_rent      BIGINT      NOT NULL DEFAULT 0,  -- in cents (ZWL or USD)
  deposit_amount    BIGINT      NOT NULL DEFAULT 0,

  -- Sale-specific field
  agreed_sale_price BIGINT,                          -- in cents

  -- Misc
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active agreement per property at a time
CREATE UNIQUE INDEX IF NOT EXISTS rental_agreements_property_active_uniq
  ON rental_agreements(property_id)
  WHERE status = 'active';

-- ── Rent Payments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rent_payments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id    UUID        NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
  due_date        DATE        NOT NULL,
  amount          BIGINT      NOT NULL,  -- in cents
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  paid_at         TIMESTAMPTZ,
  payment_method  TEXT,       -- 'cash' | 'bank_transfer' | 'ecocash' | 'other'
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS rental_agreements_landlord_id_idx  ON rental_agreements(landlord_id);
CREATE INDEX IF NOT EXISTS rental_agreements_tenant_id_idx    ON rental_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS rental_agreements_property_id_idx  ON rental_agreements(property_id);
CREATE INDEX IF NOT EXISTS rent_payments_agreement_id_idx     ON rent_payments(agreement_id);
CREATE INDEX IF NOT EXISTS rent_payments_due_date_idx         ON rent_payments(due_date);
CREATE INDEX IF NOT EXISTS rent_payments_status_idx           ON rent_payments(status);

-- ── updated_at triggers ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rental_agreements_updated_at ON rental_agreements;
CREATE TRIGGER rental_agreements_updated_at
  BEFORE UPDATE ON rental_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS rent_payments_updated_at ON rent_payments;
CREATE TRIGGER rent_payments_updated_at
  BEFORE UPDATE ON rent_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Auto-mark overdue payments ────────────────────────────────
-- Run nightly: UPDATE rent_payments SET status = 'overdue'
-- WHERE status = 'pending' AND due_date < CURRENT_DATE;
-- (handled in application layer for now)

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments     ENABLE ROW LEVEL SECURITY;

-- Landlord and tenant can view their agreements
CREATE POLICY "rental_agreements_select" ON rental_agreements
  FOR SELECT USING (
    auth.uid() = landlord_id OR auth.uid() = tenant_id
  );

-- Only landlord can create an agreement
CREATE POLICY "rental_agreements_insert" ON rental_agreements
  FOR INSERT WITH CHECK (
    auth.uid() = landlord_id
  );

-- Only landlord can update an agreement
CREATE POLICY "rental_agreements_update" ON rental_agreements
  FOR UPDATE USING (auth.uid() = landlord_id);

-- Only landlord can delete an agreement
CREATE POLICY "rental_agreements_delete" ON rental_agreements
  FOR DELETE USING (auth.uid() = landlord_id);

-- Both parties can view payments
CREATE POLICY "rent_payments_select" ON rent_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = rent_payments.agreement_id
        AND (ra.landlord_id = auth.uid() OR ra.tenant_id = auth.uid())
    )
  );

-- Only landlord can log payments
CREATE POLICY "rent_payments_insert" ON rent_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = rent_payments.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- Only landlord can update payments
CREATE POLICY "rent_payments_update" ON rent_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = rent_payments.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );

-- Only landlord can delete payments
CREATE POLICY "rent_payments_delete" ON rent_payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rental_agreements ra
      WHERE ra.id = rent_payments.agreement_id
        AND ra.landlord_id = auth.uid()
    )
  );
