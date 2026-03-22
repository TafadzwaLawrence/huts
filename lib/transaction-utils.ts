/**
 * Transaction & Commission Utilities
 * Phase 2: Transactions, commissions, and transaction workflows
 */

import type {
  Transaction,
  TransactionParticipant,
  Commission,
  TransactionAnalytics,
  FinancingType,
} from '@/types/agent-system'

/**
 * Commission Calculations
 */

export interface CommissionSplitResult {
  totalCommission: number
  agentSplit: number
  brokerageSplit: number
}

/**
 * Calculate commission split between agent and brokerage
 * @param transactionAmount The transaction price (selling price or total rent)
 * @param commissionRate Commission percentage (e.g., 3 = 3%)
 * @param agentSplitPct Agent's percentage of total commission (e.g., 50)
 * @param brokerageSplitPct Brokerage's percentage of total commission (remainder)
 */
export function calculateCommissionSplit(
  transactionAmount: number,
  commissionRate: number,
  agentSplitPct: number,
  brokerageSplitPct?: number
): CommissionSplitResult {
  const totalCommission = (transactionAmount * commissionRate) / 100
  const agentSplit = (totalCommission * agentSplitPct) / 100
  const brokerageRemaining = 100 - agentSplitPct
  const brokerageSplit = (totalCommission * brokerageRemaining) / 100

  return {
    totalCommission,
    agentSplit,
    brokerageSplit,
  }
}

/**
 * Calculate total monthly cost of ownership for a transaction
 * @param purchasePrice Sale price of property
 * @param downPaymentAmount Down payment amount
 * @param interestRate Annual interest rate (e.g., 6.5)
 * @param loanTermYears Loan term in years (typically 30)
 * @param propertyTaxAnnual Annual property tax
 * @param hoaMonthly Monthly HOA fee
 */
export function calculateMonthlyOwnershipCost(
  purchasePrice: number,
  downPaymentAmount: number,
  interestRate: number,
  loanTermYears: number,
  propertyTaxAnnual: number,
  hoaMonthly: number = 0
): number {
  const loanAmount = purchasePrice - downPaymentAmount
  const monthlyRate = interestRate / 100 / 12
  const loanTermMonths = loanTermYears * 12

  // Calculate monthly mortgage payment (P&I)
  const monthlyPayment =
    (loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
    (Math.pow(1 + monthlyRate, loanTermMonths) - 1)

  const monthlyPropertyTax = propertyTaxAnnual / 12

  return monthlyPayment + monthlyPropertyTax + hoaMonthly
}

/**
 * Transaction Timeline Calculations
 */

/**
 * Calculate days on market from offer date to contract date
 */
export function calculateDaysToContract(
  offerDate: Date | string | null,
  contractDate: Date | string | null
): number | null {
  if (!offerDate || !contractDate) return null
  const offer = new Date(offerDate).getTime()
  const contract = new Date(contractDate).getTime()
  return Math.ceil((contract - offer) / (1000 * 60 * 60 * 24))
}

/**
 * Calculate days from contract to closing
 */
export function calculateDaysToClosing(
  contractDate: Date | string | null,
  closingDate: Date | string | null
): number | null {
  if (!contractDate || !closingDate) return null
  const contract = new Date(contractDate).getTime()
  const closing = new Date(closingDate).getTime()
  return Math.ceil((closing - contract) / (1000 * 60 * 60 * 24))
}

/**
 * Calculate total days from offer to closing
 */
export function calculateTotalTransactionDays(
  offerDate: Date | string | null,
  closingDate: Date | string | null
): number | null {
  if (!offerDate || !closingDate) return null
  const offer = new Date(offerDate).getTime()
  const closing = new Date(closingDate).getTime()
  return Math.ceil((closing - offer) / (1000 * 60 * 60 * 24))
}

/**
 * Calculate days on market for a property listing
 */
export function calculateDaysOnMarket(
  listingDate: Date | string,
  soldDate?: Date | string | null
): number {
  const listing = new Date(listingDate).getTime()
  const sold = soldDate ? new Date(soldDate).getTime() : Date.now()
  return Math.ceil((sold - listing) / (1000 * 60 * 60 * 24))
}

/**
 * Transaction Status Workflows
 */

export type ValidTransactionStatusTransition = {
  from: string
  to: string
  reason?: string
}

/**
 * Check if a transaction status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string,
  transactionType: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    active: ['pending_offer', 'cancelled'],
    pending_offer: ['under_contract', 'cancelled', 'expired'],
    under_contract: ['closed', 'cancelled', 'expired'],
    closed: [], // Terminal state
    cancelled: [], // Terminal state
    expired: [], // Terminal state
  }

  const allowed = validTransitions[currentStatus] || []
  return allowed.includes(newStatus)
}

/**
 * Get the next recommended status for a transaction workflow
 */
export function getNextTransactionStatus(
  currentStatus: string,
  transactionType: string
): string[] {
  const nextStates: Record<string, string[]> = {
    active: ['pending_offer', 'cancelled'],
    pending_offer: ['under_contract', 'rejected', 'cancelled'],
    under_contract: ['closed', 'contingent_inspection', 'contingent_appraisal'],
    closed: [],
    cancelled: [],
    expired: [],
  }

  return nextStates[currentStatus] || []
}

/**
 * Document Access Control
 */

/**
 * Check if a user can view a transaction document
 * Rules:
 * - Transaction participants (agents, buyers, sellers) can view
 * - Admin can view all
 * - Private documents only for direct participants
 */
export function canAccessDocument(
  userId: string,
  participantIds: string[],
  isPrivate: boolean,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true
  if (!isPrivate) return true
  return participantIds.includes(userId)
}

/**
 * Financing Type Display
 */

export function getFinancingTypeLabel(financingType: FinancingType | null | undefined): string {
  if (!financingType) return 'Not specified'

  const labels: Record<string, string> = {
    cash: 'Cash',
    conventional: 'Conventional Loan',
    fha: 'FHA Loan',
    va: 'VA Loan',
    other: 'Other',
  }

  return labels[financingType] || 'Unknown'
}

/**
 * Transaction Price Formatting
 */

/**
 * Format transaction price for display
 */
export function formatTransactionPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'N/A'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Calculate price vs list percentage
 * @param listPrice Original listing price
 * @param salePrice Final sale price
 * @returns Percentage (e.g., 98.5 for 98.5%)
 */
export function calculatePriceVsList(
  listPrice: number | null | undefined,
  salePrice: number | null | undefined
): number | null {
  if (!listPrice || !salePrice) return null
  return (salePrice / listPrice) * 100
}

/**
 * Lease-specific calculations
 */

/**
 * Calculate total lease value
 */
export function calculateTotalLeaseValue(
  monthlyRent: number,
  leaseStartDate: Date | string,
  leaseEndDate: Date | string
): number {
  const start = new Date(leaseStartDate).getTime()
  const end = new Date(leaseEndDate).getTime()
  const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30.44))
  return monthlyRent * months
}

/**
 * Analytics Helpers
 */

/**
 * Get analytics summary for a transaction
 */
export interface TransactionAnalyticsSummary {
  daysOnMarket: number | null
  daysToContract: number | null
  daysToClosing: number | null
  priceVsList: number | null
  commissionEarned: number | null
  status: string
}

export function getAnalyticsSummary(
  transaction: Transaction,
  commission: Commission | null,
  analytics: TransactionAnalytics | null
): TransactionAnalyticsSummary {
  return {
    daysOnMarket: analytics?.days_on_market || null,
    daysToContract: analytics?.offer_to_contract_days || null,
    daysToClosing: analytics?.contract_to_close_days || null,
    priceVsList: analytics?.price_vs_list || null,
    commissionEarned: analytics?.commission_earned || null,
    status: transaction.status,
  }
}

/**
 * Participant Management
 */

/**
 * Validate participant roles for a transaction type
 */
export function getValidParticipantRoles(transactionType: string): string[] {
  const roles: Record<string, string[]> = {
    sale: [
      'listing_agent',
      'selling_agent',
      'buyer_agent',
      'buyer',
      'seller',
      'coordinator',
    ],
    rental: ['listing_agent', 'landlord', 'tenant', 'coordinator'],
    lease: ['listing_agent', 'landlord', 'tenant', 'coordinator'],
  }

  return roles[transactionType] || []
}

/**
 * Check if participant role is valid for transaction type
 */
export function isValidParticipantRole(
  role: string,
  transactionType: string
): boolean {
  return getValidParticipantRoles(transactionType).includes(role)
}
