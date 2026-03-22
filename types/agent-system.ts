/**
 * Agent System Type Exports
 * Includes all new types for Phase 1 (agents, leads, clients, appointments, etc.)
 */

// Import database-generated types (regenerated after migration)
import type { Database } from './database'

type Agent = Database['public']['Tables']['agents']['Row']
type Brokerage = Database['public']['Tables']['brokerages']['Row']
type AgentTeam = Database['public']['Tables']['agent_teams']['Row']
type TeamMember = Database['public']['Tables']['team_members']['Row']
type AgentServiceArea = Database['public']['Tables']['agent_service_areas']['Row']
type Lead = Database['public']['Tables']['leads']['Row']
type Client = Database['public']['Tables']['clients']['Row']
type ClientNote = Database['public']['Tables']['client_notes']['Row']
type LeadDistributionHistory = Database['public']['Tables']['lead_distribution_history']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentAttendee = Database['public']['Tables']['appointment_attendees']['Row']

// Enums & Constants
export enum AgentType {
  RealEstateAgent = 'real_estate_agent',
  PropertyManager = 'property_manager',
  HomeBuilder = 'home_builder',
  Photographer = 'photographer',
  Other = 'other',
}

export enum LeadStatus {
  New = 'new',
  Assigned = 'assigned',
  Claimed = 'claimed',
  Contacted = 'contacted',
  InProgress = 'in_progress',
  Converted = 'converted',
  Closed = 'closed',
  Lost = 'lost',
  Spam = 'spam',
}

export enum LeadType {
  BuyerLead = 'buyer_lead',
  SellerLead = 'seller_lead',
  RentalLead = 'rental_lead',
  PropertyValuation = 'property_valuation',
  GeneralInquiry = 'general_inquiry',
}

export enum FinancingStatus {
  Unknown = 'unknown',
  NotReady = 'not_ready',
  PreApproved = 'pre_approved',
  PreQualified = 'pre_qualified',
}

export enum AssignmentMode {
  RoundRobin = 'round_robin',
  PerformanceBased = 'performance_based',
  Geographic = 'geographic',
  Specialty = 'specialty',
}

export enum ClientType {
  Buyer = 'buyer',
  Seller = 'seller',
  Renter = 'renter',
  Landlord = 'landlord',
  Mixed = 'mixed',
}

export enum AppointmentType {
  Tour = 'tour',
  OpenHouse = 'open_house',
  Consultation = 'consultation',
  Meeting = 'meeting',
  Inspection = 'inspection',
  Appraisal = 'appraisal',
}

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

// Types with insertions and updates
export type AgentInsert = Omit<Agent, 'id' | 'created_at' | 'updated_at'>
export type AgentUpdate = Partial<AgentInsert>
export type BrokerageInsert = Omit<Brokerage, 'id' | 'created_at' | 'updated_at'>
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>
export type LeadUpdate = Partial<LeadInsert>
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type ClientUpdate = Partial<ClientInsert>
export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
export type AppointmentUpdate = Partial<AppointmentInsert>

// Composed types for API responses
export interface AgentWithTeams extends Agent {
  teams?: AgentTeam[]
  serviceAreas?: AgentServiceArea[]
  brokerage?: Brokerage | null
}

export interface LeadWithDistribution extends Lead {
  distributionHistory?: LeadDistributionHistory[]
  assignedAgent?: Agent | null
  assignedTeam?: AgentTeam | null
}

export interface ClientWithNotes extends Omit<Client, 'notes'> {
  notes?: ClientNote[]
  agent?: Agent
}

export interface AppointmentWithAttendees extends Appointment {
  attendees?: AppointmentAttendee[]
  agent?: Agent
  client?: Client | null
}

// Scores and rankings
export interface LeadScore {
  profileCompleteness: number // 0-100
  financingWeight: number // 0-1
  timelineWeight: number // 0-1
  totalScore: number // 0-100
}

export interface AgentFitScore {
  geographicMatch: number // 0-1
  specialtyMatch: number // 0-1
  responseRateBonus: number // 0-1
  performanceWeight: number // 0-1
  availabilityCheck: number // 0-1
  totalFitScore: number // 0-1
}

export interface LeadDistributionResult {
  leadId: string
  assignedAgentId: string | null
  assignedTeamId: string | null
  assignmentMode: AssignmentMode
  assignmentReason: string
  claimDeadlineAt: string
  expiresAt: string
}

// API Request/Response types
export interface CreateLeadRequest {
  leadType: LeadType
  contactName: string
  contactEmail?: string
  contactPhone?: string
  message?: string
  propertyId?: string
  budgetMin?: number
  budgetMax?: number
  preferredAreas?: string[]
  specializations?: string[]
  timeline?: string
  financingStatus?: FinancingStatus
  brokerageId?: string
}

export interface CreateLeadResponse extends LeadDistributionResult {
  lead: LeadWithDistribution
}

export interface ClaimLeadRequest {
  leadId: string
}

export interface ClaimLeadResponse {
  success: boolean
  lead: LeadWithDistribution
  message: string
}

export interface ListLeadsRequest {
  status?: LeadStatus[]
  leadType?: LeadType[]
  sortBy?: 'score' | 'date' | 'urgency'
  limit?: number
  offset?: number
}

export interface ListLeadsResponse {
  leads: LeadWithDistribution[]
  total: number
  hasMore: boolean
}

// ============================================================================
// PHASE 2: Transactions & Messaging Enums
// ============================================================================

export enum TransactionType {
  Sale = 'sale',
  Rental = 'rental',
  Lease = 'lease',
}

export enum TransactionStatus {
  Active = 'active',
  PendingOffer = 'pending_offer',
  UnderContract = 'under_contract',
  Closed = 'closed',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export enum TransactionParticipantRole {
  ListingAgent = 'listing_agent',
  SellingAgent = 'selling_agent',
  BuyerAgent = 'buyer_agent',
  Buyer = 'buyer',
  Seller = 'seller',
  Landlord = 'landlord',
  Tenant = 'tenant',
  Coordinator = 'coordinator',
}

export enum DocumentType {
  Contract = 'contract',
  Disclosure = 'disclosure',
  Addendum = 'addendum',
  InspectionReport = 'inspection_report',
  Appraisal = 'appraisal',
  ClosingStatement = 'closing_statement',
  Other = 'other',
}

export enum CommissionStatus {
  Pending = 'pending',
  Paid = 'paid',
  Cancelled = 'cancelled',
}

export enum FinancingType {
  Cash = 'cash',
  Conventional = 'conventional',
  FHA = 'fha',
  VA = 'va',
  Other = 'other',
}

// Phase 2 Type Exports from database
type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionParticipant = Database['public']['Tables']['transaction_participants']['Row']
type TransactionDocument = Database['public']['Tables']['transaction_documents']['Row']
type TransactionMessageThread = Database['public']['Tables']['transaction_message_threads']['Row']
type Commission = Database['public']['Tables']['commissions']['Row']
type TransactionAnalytics = Database['public']['Tables']['transaction_analytics']['Row']

// Phase 2 Insert/Update types
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type TransactionParticipantInsert = Database['public']['Tables']['transaction_participants']['Insert']
export type TransactionParticipantUpdate = Database['public']['Tables']['transaction_participants']['Update']
export type TransactionDocumentInsert = Database['public']['Tables']['transaction_documents']['Insert']
export type TransactionDocumentUpdate = Database['public']['Tables']['transaction_documents']['Update']
export type CommissionInsert = Database['public']['Tables']['commissions']['Insert']
export type CommissionUpdate = Database['public']['Tables']['commissions']['Update']

// Phase 2 Composed types
export interface TransactionWithParticipants extends Transaction {
  participants?: TransactionParticipant[]
  documents?: TransactionDocument[]
  commissions?: Commission[]
  analytics?: TransactionAnalytics | null
}

export interface CommissionWithDetails extends Commission {
  transaction?: Transaction
  agent?: Agent
  brokerage?: Brokerage
}

// Export re-exported types
export type {
  Agent,
  Brokerage,
  AgentTeam,
  TeamMember,
  AgentServiceArea,
  Lead,
  Client,
  ClientNote,
  LeadDistributionHistory,
  Appointment,
  AppointmentAttendee,
  Transaction,
  TransactionParticipant,
  TransactionDocument,
  TransactionMessageThread,
  Commission,
  TransactionAnalytics,
}
