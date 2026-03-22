/**
 * Transaction Workflow State Machine
 * Manages state transitions: offer → contract → closing
 */

export type TransactionState = 
  | 'active'
  | 'pending_offer'
  | 'under_contract'
  | 'closed'
  | 'cancelled'
  | 'expired'

export interface WorkflowStep {
  state: TransactionState
  label: string
  description: string
  icon: string
  color: string
  progress: number // 0-100
}

export interface StateTransition {
  fromState: TransactionState
  toState: TransactionState
  label: string
  action: string
  requiredFields: string[]
  requiresDocuments?: boolean
}

export const WORKFLOW_STEPS: Record<TransactionState, WorkflowStep> = {
  active: {
    state: 'active',
    label: 'Active',
    description: 'Property listed and open to offers',
    icon: 'Zap',
    color: 'blue',
    progress: 10,
  },
  pending_offer: {
    state: 'pending_offer',
    label: 'Pending Offer',
    description: 'Offer submitted, awaiting acceptance',
    icon: 'Clock',
    color: 'yellow',
    progress: 25,
  },
  under_contract: {
    state: 'under_contract',
    label: 'Under Contract',
    description: 'Offer accepted, pending closing',
    icon: 'FileText',
    color: 'purple',
    progress: 60,
  },
  closed: {
    state: 'closed',
    label: 'Closed',
    description: 'Transaction completed',
    icon: 'CheckCircle',
    color: 'green',
    progress: 100,
  },
  cancelled: {
    state: 'cancelled',
    label: 'Cancelled',
    description: 'Transaction cancelled',
    icon: 'XCircle',
    color: 'red',
    progress: 0,
  },
  expired: {
    state: 'expired',
    label: 'Expired',
    description: 'Offer expired without acceptance',
    icon: 'AlertCircle',
    color: 'gray',
    progress: 0,
  },
}

export const VALID_TRANSITIONS: Record<TransactionState, TransactionState[]> = {
  active: ['pending_offer', 'cancelled'],
  pending_offer: ['under_contract', 'cancelled', 'expired'],
  under_contract: ['closed', 'cancelled'],
  closed: [], // Terminal state
  cancelled: [], // Terminal state
  expired: [], // Terminal state
}

export const STATE_ACTIONS: StateTransition[] = [
  // Offer workflow
  {
    fromState: 'active',
    toState: 'pending_offer',
    label: 'Submit Offer',
    action: 'offer',
    requiredFields: ['offer_price', 'offer_date'],
    requiresDocuments: false,
  },
  // Contract workflow
  {
    fromState: 'pending_offer',
    toState: 'under_contract',
    label: 'Accept & Sign Contract',
    action: 'accept_offer',
    requiredFields: ['final_price', 'contract_date', 'financing_type'],
    requiresDocuments: true,
  },
  // Closing workflow
  {
    fromState: 'under_contract',
    toState: 'closed',
    label: 'Close Transaction',
    action: 'close',
    requiredFields: ['closing_date', 'final_price'],
    requiresDocuments: true,
  },
  // Cancellations
  {
    fromState: 'pending_offer',
    toState: 'cancelled',
    label: 'Cancel Offer',
    action: 'cancel',
    requiredFields: [],
  },
  {
    fromState: 'under_contract',
    toState: 'cancelled',
    label: 'Cancel Contract',
    action: 'cancel',
    requiredFields: [],
  },
  // Expiration
  {
    fromState: 'pending_offer',
    toState: 'expired',
    label: 'Mark Expired',
    action: 'expire',
    requiredFields: [],
  },
]

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  fromState: TransactionState,
  toState: TransactionState
): boolean {
  const validNextStates = VALID_TRANSITIONS[fromState] || []
  return validNextStates.includes(toState)
}

/**
 * Get available actions for a given state
 */
export function getAvailableActions(
  currentState: TransactionState
): StateTransition[] {
  return STATE_ACTIONS.filter(action => action.fromState === currentState)
}

/**
 * Get the next state from an action
 */
export function getNextStateFromAction(
  currentState: TransactionState,
  actionType: string
): TransactionState | null {
  const action = STATE_ACTIONS.find(
    a => a.fromState === currentState && a.action === actionType
  )
  return action?.toState || null
}

/**
 * Get all steps in workflow order
 */
export function getWorkflowProgressSteps(): WorkflowStep[] {
  return [
    WORKFLOW_STEPS.active,
    WORKFLOW_STEPS.pending_offer,
    WORKFLOW_STEPS.under_contract,
    WORKFLOW_STEPS.closed,
  ]
}

/**
 * Calculate progress percentage for current state
 */
export function getProgressPercentage(state: TransactionState): number {
  return WORKFLOW_STEPS[state]?.progress || 0
}

/**
 * Get state display info
 */
export function getStateInfo(state: TransactionState) {
  return WORKFLOW_STEPS[state] || WORKFLOW_STEPS.active
}

/**
 * Check if transaction is terminal state
 */
export function isTerminalState(state: TransactionState): boolean {
  return state === 'closed' || state === 'cancelled' || state === 'expired'
}

/**
 * Check if transaction is still in progress
 */
export function isActiveTransaction(state: TransactionState): boolean {
  return !isTerminalState(state)
}

/**
 * Validate required fields for state transition
 */
export function validateTransitionFields(
  fromState: TransactionState,
  toState: TransactionState,
  transactionData: Record<string, any>
): { valid: boolean; missingFields: string[] } {
  const transition = STATE_ACTIONS.find(
    a => a.fromState === fromState && a.toState === toState
  )

  if (!transition) {
    return { valid: false, missingFields: [] }
  }

  const missingFields = transition.requiredFields.filter(
    field => !transactionData[field]
  )

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Get workflow timeline for UI display
 */
export function getWorkflowTimeline(currentState: TransactionState) {
  const steps = getWorkflowProgressSteps()
  const currentIndex = steps.findIndex(s => s.state === currentState)

  return steps.map((step, index) => ({
    ...step,
    isCompleted: index < currentIndex,
    isCurrent: index === currentIndex,
    isUpcoming: index > currentIndex,
  }))
}

/**
 * Get estimated days for remaining workflow steps
 */
export function getEstimatedDaysRemaining(state: TransactionState): number {
  const estimates: Record<TransactionState, number> = {
    active: 30, // Avg 30 days to get offer
    pending_offer: 7, // Avg 7 days to accept
    under_contract: 21, // Avg 21 days to closing
    closed: 0,
    cancelled: 0,
    expired: 0,
  }
  return estimates[state] || 0
}
