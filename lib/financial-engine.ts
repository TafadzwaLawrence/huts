/**
 * Financial Lifecycle Engine — Core Utilities
 *
 * Server-side only. All amounts are in cents (bigint).
 * +balance = tenant owes money  |  -balance = tenant has a credit
 */

import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

// ── Types ──────────────────────────────────────────────────────

export type ObligationType = 'rent' | 'late_fee' | 'recurring_fee' | 'deposit' | 'adjustment'
export type ObligationStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'waived' | 'delinquent'
export type LedgerEntryType = 'charge' | 'payment' | 'credit' | 'refund' | 'adjustment' | 'deposit'
export type DepositTransactionType = 'received' | 'deduction' | 'refund'
export type AdjustmentType = 'charge' | 'credit'
export type DisputeStatus = 'open' | 'resolved' | 'dismissed'
export type Currency = 'usd' | 'zwl'

export interface AgreementFinancials {
  agreement_id: string
  currency: Currency
  due_day: number
  grace_period_days: number
  late_fee_enabled: boolean
  late_fee_type: 'flat' | 'percent' | 'both' | null
  late_fee_flat: number
  late_fee_percent: number
  monthly_rent: number
  landlord_id: string
  tenant_id: string
}

export interface ObligationRow {
  id: string
  agreement_id: string
  type: ObligationType
  description: string | null
  amount: number
  currency: Currency
  due_date: string
  grace_deadline: string | null
  period_label: string | null
  status: ObligationStatus
  amount_paid: number
  created_at: string
}

export interface LedgerEntry {
  id: string
  agreement_id: string
  obligation_id: string | null
  type: LedgerEntryType
  amount: number
  currency: Currency
  description: string
  reference_id: string | null
  created_by: string
  created_at: string
}

export interface BalanceSummary {
  balance: number               // cents (+ve = owed, -ve = credit)
  total_charges: number
  total_payments: number
  currency: Currency
  overdue_obligations: number   // count
  overdue_amount: number        // cents
}

// ── Helpers ────────────────────────────────────────────────────

/** Add days to a date string, returns YYYY-MM-DD */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** Format a date as "YYYY-MM" period label */
function toPeriodLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Get next due date for a given period using the agreement's due_day */
function getDueDate(year: number, month: number, dueDay: number): string {
  // Clamp to last day of month if needed
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(dueDay, lastDay)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ── Core functions ─────────────────────────────────────────────

/**
 * Calculate the current outstanding balance for an agreement.
 * Uses the PostgreSQL function fn_agreement_balance for accuracy.
 */
export async function calculateBalance(
  supabase: SupabaseClient,
  agreementId: string
): Promise<BalanceSummary> {
  const [balanceResult, overdueResult, ledgerTotals] = await Promise.all([
    supabase.rpc('fn_agreement_balance', { p_agreement_id: agreementId }),
    supabase
      .from('lease_obligations')
      .select('amount, amount_paid, currency')
      .eq('agreement_id', agreementId)
      .in('status', ['overdue', 'delinquent']),
    supabase
      .from('financial_ledger_entries')
      .select('type, amount')
      .eq('agreement_id', agreementId),
  ])

  const balance: number = balanceResult.data ?? 0
  const overdueObs = overdueResult.data ?? []
  const entries = ledgerTotals.data ?? []

  const total_charges = entries
    .filter(e => e.type === 'charge' || e.type === 'deposit')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const total_payments = entries
    .filter(e => ['payment', 'credit', 'refund', 'adjustment'].includes(e.type))
    .reduce((sum, e) => sum + Number(e.amount), 0)

  // Get agreement currency
  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select('currency')
    .eq('id', agreementId)
    .single()

  return {
    balance: Number(balance),
    total_charges,
    total_payments,
    currency: (agreement?.currency as Currency) ?? 'usd',
    overdue_obligations: overdueObs.length,
    overdue_amount: overdueObs.reduce((sum, o) => sum + Number(o.amount) - Number(o.amount_paid), 0),
  }
}

/**
 * Generate obligations for a specific billing period.
 * Creates: rent obligation + any active recurring fee obligations.
 * Idempotent — skips if obligation already exists for period.
 */
export async function generateObligationsForPeriod(
  supabase: SupabaseClient,
  agreementId: string,
  periodDate: Date   // any date within the target month
): Promise<ObligationRow[]> {
  const { data: agreement, error } = await supabase
    .from('rental_agreements')
    .select('id, monthly_rent, due_day, grace_period_days, currency, late_fee_enabled, status')
    .eq('id', agreementId)
    .single()

  if (error || !agreement) throw new Error('Agreement not found')
  if (agreement.status !== 'active') throw new Error('Agreement is not active')

  const periodLabel = toPeriodLabel(periodDate)
  const dueDay = agreement.due_day ?? 1
  const graceDays = agreement.grace_period_days ?? 5
  const dueDate = getDueDate(periodDate.getFullYear(), periodDate.getMonth(), dueDay)
  const graceDeadline = addDays(dueDate, graceDays)

  // Fetch recurring fees
  const { data: recurringFees } = await supabase
    .from('lease_recurring_fees')
    .select('id, name, amount')
    .eq('agreement_id', agreementId)
    .eq('is_active', true)

  const obligationsToCreate: Omit<ObligationRow, 'id' | 'created_at'>[] = []

  // Rent obligation (idempotency: skip if already exists for this period)
  const { data: existingRent } = await supabase
    .from('lease_obligations')
    .select('id')
    .eq('agreement_id', agreementId)
    .eq('type', 'rent')
    .eq('period_label', periodLabel)
    .maybeSingle()

  if (!existingRent) {
    obligationsToCreate.push({
      agreement_id: agreementId,
      type: 'rent',
      description: `Rent - ${periodLabel}`,
      amount: agreement.monthly_rent,
      currency: agreement.currency as Currency,
      due_date: dueDate,
      grace_deadline: graceDeadline,
      period_label: periodLabel,
      status: 'pending',
      amount_paid: 0,
    })
  }

  // Recurring fee obligations
  for (const fee of recurringFees ?? []) {
    const { data: existingFee } = await supabase
      .from('lease_obligations')
      .select('id')
      .eq('agreement_id', agreementId)
      .eq('type', 'recurring_fee')
      .eq('period_label', periodLabel)
      .eq('description', `${fee.name} - ${periodLabel}`)
      .maybeSingle()

    if (!existingFee) {
      obligationsToCreate.push({
        agreement_id: agreementId,
        type: 'recurring_fee',
        description: `${fee.name} - ${periodLabel}`,
        amount: fee.amount,
        currency: agreement.currency as Currency,
        due_date: dueDate,
        grace_deadline: graceDeadline,
        period_label: periodLabel,
        status: 'pending',
        amount_paid: 0,
      })
    }
  }

  if (obligationsToCreate.length === 0) {
    // Already generated — return existing
    const { data: existing } = await supabase
      .from('lease_obligations')
      .select('*')
      .eq('agreement_id', agreementId)
      .eq('period_label', periodLabel)
    return (existing ?? []) as ObligationRow[]
  }

  const { data: created, error: createError } = await supabase
    .from('lease_obligations')
    .insert(obligationsToCreate)
    .select()

  if (createError) throw createError

  // Also insert ledger charge entries
  const { data: landlordRow } = await supabase
    .from('rental_agreements')
    .select('landlord_id')
    .eq('id', agreementId)
    .single()

  if (landlordRow) {
    const ledgerEntries = (created ?? []).map(ob => ({
      agreement_id: agreementId,
      obligation_id: ob.id,
      type: 'charge' as LedgerEntryType,
      amount: ob.amount,
      currency: ob.currency,
      description: ob.description ?? 'Charge',
      created_by: landlordRow.landlord_id,
    }))
    await supabase.from('financial_ledger_entries').insert(ledgerEntries)
  }

  return (created ?? []) as ObligationRow[]
}

/**
 * Apply a payment to outstanding obligations (oldest-first: fees → rent → other).
 * Records ledger entry. Updates obligation statuses.
 */
export async function applyPaymentToObligations(
  supabase: SupabaseClient,
  agreementId: string,
  paymentAmountCents: number,
  paymentMethod: string,
  referenceId: string | null,
  loggedBy: string   // landlord's user id
): Promise<{ appliedTo: { obligationId: string; amountApplied: number }[]; remainder: number }> {
  // Get unpaid/partial obligations: late fees first, then rent, then others
  const { data: obligations, error } = await supabase
    .from('lease_obligations')
    .select('id, type, amount, amount_paid, status, description')
    .eq('agreement_id', agreementId)
    .in('status', ['pending', 'partial', 'overdue'])
    .order('due_date', { ascending: true })

  if (error) throw error

  // Sort: late_fee → rent → recurring_fee → others
  const typeOrder: Record<ObligationType, number> = {
    late_fee: 0, rent: 1, recurring_fee: 2, adjustment: 3, deposit: 4,
  }
  const sorted = [...(obligations ?? [])].sort(
    (a, b) => (typeOrder[a.type as ObligationType] ?? 9) - (typeOrder[b.type as ObligationType] ?? 9)
  )

  let remaining = paymentAmountCents
  const appliedTo: { obligationId: string; amountApplied: number }[] = []

  for (const ob of sorted) {
    if (remaining <= 0) break
    const outstanding = Number(ob.amount) - Number(ob.amount_paid)
    const toApply = Math.min(remaining, outstanding)
    if (toApply <= 0) continue

    const newAmountPaid = Number(ob.amount_paid) + toApply
    const newStatus: ObligationStatus = newAmountPaid >= Number(ob.amount) ? 'paid' : 'partial'

    await supabase
      .from('lease_obligations')
      .update({ amount_paid: newAmountPaid, status: newStatus })
      .eq('id', ob.id)

    appliedTo.push({ obligationId: ob.id, amountApplied: toApply })
    remaining -= toApply
  }

  // Record a single ledger payment entry
  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select('currency')
    .eq('id', agreementId)
    .single()

  await supabase.from('financial_ledger_entries').insert({
    agreement_id: agreementId,
    obligation_id: appliedTo.length === 1 ? appliedTo[0].obligationId : null,
    type: 'payment' as LedgerEntryType,
    amount: paymentAmountCents - remaining,
    currency: (agreement?.currency as Currency) ?? 'usd',
    description: `Payment via ${paymentMethod}`,
    reference_id: referenceId,
    created_by: loggedBy,
  })

  return { appliedTo, remainder: remaining }
}

/**
 * Record a landlord adjustment (charge or credit).
 * Creates an obligation row + ledger entry.
 */
export async function recordAdjustment(
  supabase: SupabaseClient,
  agreementId: string,
  type: AdjustmentType,
  amountCents: number,
  reason: string,
  loggedBy: string
): Promise<void> {
  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select('currency, landlord_id')
    .eq('id', agreementId)
    .single()

  // Insert adjustment table record
  await supabase.from('lease_adjustments').insert({
    agreement_id: agreementId,
    created_by: loggedBy,
    type,
    amount: amountCents,
    currency: agreement?.currency ?? 'usd',
    reason,
  })

  // Create an obligation for charges (so it appears in "what is owed")
  if (type === 'charge') {
    await supabase.from('lease_obligations').insert({
      agreement_id: agreementId,
      type: 'adjustment',
      description: reason,
      amount: amountCents,
      currency: agreement?.currency ?? 'usd',
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending',
    })
  }

  // Ledger entry
  await supabase.from('financial_ledger_entries').insert({
    agreement_id: agreementId,
    type: (type === 'charge' ? 'charge' : 'credit') as LedgerEntryType,
    amount: amountCents,
    currency: agreement?.currency ?? 'usd',
    description: reason,
    created_by: loggedBy,
  })
}

/**
 * Generate (or regenerate) a financial statement for a given period.
 * Upserts based on (agreement_id, period_start).
 */
export async function generateStatement(
  supabase: SupabaseClient,
  agreementId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  const periodStartStr = periodStart.toISOString().split('T')[0]
  const periodEndStr = periodEnd.toISOString().split('T')[0]

  const { data: agreement } = await supabase
    .from('rental_agreements')
    .select('currency')
    .eq('id', agreementId)
    .single()

  // Balance at period start (all ledger entries BEFORE period)
  const { data: priorEntries } = await supabase
    .from('financial_ledger_entries')
    .select('type, amount')
    .eq('agreement_id', agreementId)
    .lt('created_at', periodStartStr)

  const opening_balance = (priorEntries ?? []).reduce((sum, e) => {
    if (['charge', 'deposit'].includes(e.type)) return sum + Number(e.amount)
    return sum - Number(e.amount)
  }, 0)

  // Period entries
  const { data: periodEntries } = await supabase
    .from('financial_ledger_entries')
    .select('type, amount')
    .eq('agreement_id', agreementId)
    .gte('created_at', periodStartStr)
    .lte('created_at', periodEndStr)

  let total_charges = 0
  let total_payments = 0
  for (const e of periodEntries ?? []) {
    if (['charge', 'deposit'].includes(e.type)) total_charges += Number(e.amount)
    else total_payments += Number(e.amount)
  }

  const closing_balance = opening_balance + total_charges - total_payments

  await supabase.from('financial_statements').upsert(
    {
      agreement_id: agreementId,
      period_start: periodStartStr,
      period_end: periodEndStr,
      opening_balance,
      total_charges,
      total_payments,
      closing_balance,
      currency: agreement?.currency ?? 'usd',
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'agreement_id,period_start' }
  )
}

/** Format cents as readable currency string */
export function formatCents(cents: number, currency: Currency = 'usd'): string {
  const dollars = cents / 100
  if (currency === 'usd') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dollars)
  }
  // ZWL — no official locale, format manually
  return `ZWL ${dollars.toLocaleString('en-ZW', { minimumFractionDigits: 2 })}`
}
