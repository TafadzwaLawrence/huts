/**
 * Agent Metrics Utilities
 * Functions for calculating lead scores, agent fit scores, and distribution decisions
 */

import type {
  LeadScore,
  AgentFitScore,
  FinancingStatus,
  Agent,
} from '@/types/agent-system'

/**
 * Calculate lead score based on profile completeness and demographic factors
 * Scoring formula: profile_completeness (40%) + financing (35%) + timeline (25%)
 *
 * @param profileCompleteness 0-100% - how complete the lead's information is
 * @param financingStatus - whether Lead author has financing arranged
 * @param timeline - when lead hopes to move forward
 * @returns LeadScore object with breakdown and total score
 */
export function calculateLeadScore(
  profileCompleteness: number,
  financingStatus?: FinancingStatus | null,
  timeline?: string | null,
): LeadScore {
  // Normalize profile completeness to 0-1 range
  const profileNorm = Math.min(profileCompleteness / 100, 1)

  // Financing weight: pre_approved (1.0) > pre_qualified (0.7) > not_ready (0.3) > unknown (0)
  let financingWeight = 0
  switch (financingStatus) {
    case 'pre_approved':
      financingWeight = 1.0
      break
    case 'pre_qualified':
      financingWeight = 0.7
      break
    case 'not_ready':
      financingWeight = 0.3
      break
    case 'unknown':
    default:
      financingWeight = 0
  }

  // Timeline weight: asap (1.0) > 1_month (0.8) > 3_months (0.5) > 6_months (0.3)
  let timelineWeight = 0
  switch (timeline) {
    case 'asap':
    case 'ASAP':
      timelineWeight = 1.0
      break
    case '1_month':
    case '1-month':
      timelineWeight = 0.8
      break
    case '3_months':
    case '3-months':
      timelineWeight = 0.5
      break
    case '6_months':
    case '6-months':
      timelineWeight = 0.3
      break
    default:
      timelineWeight = 0.5 // Default to middle value if unknown
  }

  // Combined score: profile_completeness (40%) + financing (35%) + timeline (25%)
  const totalScore =
    profileNorm * 40 + financingWeight * 35 + timelineWeight * 25

  return {
    profileCompleteness: profileNorm,
    financingWeight,
    timelineWeight,
    totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimals
  }
}

/**
 * Calculate how well an agent fits a lead based on multiple factors
 *
 * @param agent - Agent to evaluate
 * @param leadServiceAreas - Preferred areas for the lead
 * @param leadSpecializations - Preferred specializations for this type of lead
 * @returns AgentFitScore with breakdown and total fit
 */
export function calculateAgentFitScore(
  agent: Agent,
  leadServiceAreas?: string[],
  leadSpecializations?: string[],
): AgentFitScore {
  let geographicMatch = 0
  let specialtyMatch = 0
  let responseRateBonus = 0
  let performanceWeight = 0
  let availabilityCheck = 1 // Default: available

  // Geographic match: % of agent's service areas that overlap with lead preference
  if (
    leadServiceAreas &&
    leadServiceAreas.length > 0 &&
    agent.office_city
  ) {
    const agentCities = [agent.office_city] // Could be extended to service_areas from DB
    const matches = agentCities.filter((city) =>
      leadServiceAreas.some((leadCity) =>
        leadCity.toLowerCase().includes(city.toLowerCase()),
      ),
    )
    geographicMatch = matches.length / Math.max(agentCities.length, 1)
  }

  // Specialty match: % of agent's specializations that match lead needs
  if (
    leadSpecializations &&
    leadSpecializations.length > 0 &&
    agent.specializations &&
    agent.specializations.length > 0
  ) {
    const matches = agent.specializations.filter((spec) =>
      leadSpecializations.some((leadSpec) =>
        spec.toLowerCase().includes(leadSpec.toLowerCase()),
      ),
    )
    specialtyMatch = matches.length / Math.max(agent.specializations.length, 1)
  }

  // Response rate bonus: agents with >90% response rate get bonus
  // In Phase 1, this will be updated when we have metrics
  responseRateBonus = agent.total_reviews && agent.total_reviews > 5 ? 0.5 : 0

  // Performance weight: higher-rated agents get priority
  // Scale agent rating to 0-1 range (if rating exists)
  performanceWeight = agent.avg_rating ? agent.avg_rating / 5 : 0.3

  // Availability check: placeholder for future implementation
  // Could factor in: open leads count, response time, etc.
  availabilityCheck = 1

  const totalFitScore =
    geographicMatch * 0.3 +
    specialtyMatch * 0.2 +
    responseRateBonus * 0.2 +
    performanceWeight * 0.15 +
    availabilityCheck * 0.15

  return {
    geographicMatch,
    specialtyMatch,
    responseRateBonus,
    performanceWeight,
    availabilityCheck,
    totalFitScore: Math.round(totalFitScore * 100) / 100,
  }
}

/**
 * Combined assignment score for lead distribution
 * Used in performance-based assignment mode
 *
 * @param leadScore - The lead's inherent quality/urgency
 * @param agentFitScore - How well the agent matches this lead
 * @returns Final assignment score (0-100)
 */
export function calculateAssignmentScore(
  leadScore: LeadScore,
  agentFitScore: AgentFitScore,
): number {
  // Lead score carries more weight (it may affect conversion likelihood)
  // Agent fit score ensures right person gets the lead when possible
  const combined = leadScore.totalScore * 0.5 + agentFitScore.totalFitScore * 100 * 0.5
  return Math.round(combined * 100) / 100
}

/**
 * Determine if a lead has sufficient profile completeness
 * Checks: name, email or phone, message/inquiry text
 *
 * @param contactName - Lead's name
 * @param contactEmail - Lead's email
 * @param contactPhone - Lead's phone
 * @param message - Inquiry message
 * @returns Completeness percentage (0-100)
 */
export function calculateProfileCompleteness(
  contactName?: string,
  contactEmail?: string,
  contactPhone?: string,
  message?: string,
): number {
  let completeness = 0
  const maxPoints = 4

  if (contactName && contactName.trim()) completeness += 1
  if (contactEmail && contactEmail.includes('@')) completeness += 1
  if (contactPhone && contactPhone.length >= 10) completeness += 1
  if (message && message.trim().length >= 10) completeness += 1

  return Math.round((completeness / maxPoints) * 100)
}

/**
 * Calculate minutes elapsed from start to end timestamp
 * Useful for response time and aging calculations
 *
 * @param startTime - Start timestamp (ISO string or Date)
 * @param endTime - End timestamp (ISO string or Date, defaults to now)
 * @returns Minutes elapsed (rounded)
 */
export function calculateMinutesElapsed(
  startTime: string | Date,
  endTime?: string | Date,
): number {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime
  const end = endTime
    ? typeof endTime === 'string'
      ? new Date(endTime)
      : endTime
    : new Date()

  const diff = end.getTime() - start.getTime()
  return Math.round(diff / (1000 * 60)) // Convert ms to minutes
}

/**
 * Score lead urgency based on how old it is
 * Newer leads get higher urgency; older leads decay in value
 *
 * @param createdAt - When the lead was created
 * @returns Urgency score (0-1, where 1 = fresh and 0 = very old)
 */
export function calculateLeadUrgencyBonus(createdAt: string | Date): number {
  const leadAge = calculateMinutesElapsed(createdAt)
  const maxAgeMinutes = 24 * 60 // 24 hours

  // Linear decay: fresh leads = 1.0, 24-hour-old leads = 0
  const urgency = Math.max(1 - leadAge / maxAgeMinutes, 0)
  return Math.round(urgency * 100) / 100
}

/**
 * Determine if a lead has expired/should be reassigned
 *
 * @param expiresAt - Expiration timestamp
 * @returns true if lead has expired
 */
export function isLeadExpired(expiresAt: string | Date): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return new Date() > expiry
}

/**
 * Check if lead is still within the claiming window
 * Default window is 5 minutes
 *
 * @param assignedAt - When lead was assigned
 * @param claimDeadlineAt - Deadline to claim
 * @returns true if still within claiming window
 */
export function isClaimWindowOpen(
  assignedAt: string | Date,
  claimDeadlineAt?: string | Date,
): boolean {
  if (!claimDeadlineAt) {
    // Calculate default 5-minute window
    const deadline = new Date(
      typeof assignedAt === 'string'
        ? new Date(assignedAt).getTime() + 5 * 60 * 1000
        : assignedAt.getTime() + 5 * 60 * 1000,
    )
    return new Date() < deadline
  }

  const deadline =
    typeof claimDeadlineAt === 'string'
      ? new Date(claimDeadlineAt)
      : claimDeadlineAt
  return new Date() < deadline
}

/**
 * Calculate time remaining in claiming window (in seconds)
 *
 * @param claimDeadlineAt - Claim deadline
 * @returns Seconds remaining (0 if deadline passed)
 */
export function getClaimWindowSecondsRemaining(
  claimDeadlineAt: string | Date,
): number {
  const deadline =
    typeof claimDeadlineAt === 'string'
      ? new Date(claimDeadlineAt)
      : claimDeadlineAt
  const remaining = deadline.getTime() - new Date().getTime()
  return Math.max(Math.round(remaining / 1000), 0)
}
