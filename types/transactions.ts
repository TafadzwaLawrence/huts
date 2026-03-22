// ============================================================================
// Transaction & Messaging System Types
// ============================================================================

export type TransactionType = 'sale' | 'rental' | 'lease';
export type TransactionStatus = 'active' | 'pending_offer' | 'under_contract' | 'closed' | 'cancelled' | 'expired';
export type FinancingType = 'cash' | 'conventional' | 'fha' | 'va' | 'other';
export type ParticipantRole = 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator';
export type DocumentType = 'contract' | 'disclosure' | 'addendum' | 'inspection_report' | 'appraisal' | 'closing_statement' | 'other';
export type MessageType = 'text' | 'image' | 'document' | 'system';
export type ContactMethod = 'email' | 'phone' | 'text' | 'app';
export type CommissionStatus = 'pending' | 'paid' | 'cancelled';

// ============================================================================
// Transaction Management
// ============================================================================

export interface Transaction {
  id: string;
  property_id: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  listing_price?: number;
  offer_price?: number;
  final_price?: number;
  commission_rate?: number;
  commission_amount?: number;
  offer_date?: string;
  contract_date?: string;
  closing_date?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  earnest_money?: number;
  down_payment?: number;
  financing_type?: FinancingType;
  appraisal_value?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionParticipant {
  id: string;
  transaction_id: string;
  profile_id: string;
  role: ParticipantRole;
  commission_split_pct?: number;
  commission_amount?: number;
  can_contact: boolean;
  preferred_contact_method: ContactMethod;
  created_at: string;
  updated_at: string;
}

export interface TransactionDocument {
  id: string;
  transaction_id: string;
  uploaded_by: string;
  document_type: DocumentType;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_size_bytes?: number;
  mime_type?: string;
  is_private: boolean;
  is_executed: boolean;
  executed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Messaging System
// ============================================================================

export interface MessageThread {
  id: string;
  transaction_id?: string;
  subject?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: MessageType;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size_bytes?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Commission Tracking
// ============================================================================

export interface Commission {
  id: string;
  transaction_id: string;
  agent_id: string;
  total_commission: number;
  agent_split_pct: number;
  agent_commission: number;
  brokerage_id?: string;
  brokerage_split_pct?: number;
  brokerage_commission?: number;
  status: CommissionStatus;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Analytics
// ============================================================================

export interface TransactionAnalytics {
  id: string;
  agent_id: string;
  transaction_id?: string;
  days_on_market?: number;
  offer_to_contract_days?: number;
  contract_to_close_days?: number;
  total_transaction_days?: number;
  price_vs_list?: number;
  commission_earned?: number;
  lead_source?: string;
  marketing_channel?: string;
  created_at: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateTransactionRequest {
  property_id: string;
  transaction_type: TransactionType;
  listing_price?: number;
  offer_price?: number;
  commission_rate?: number;
  notes?: string;
  participants: CreateTransactionParticipant[];
}

export interface CreateTransactionParticipant {
  profile_id: string;
  role: ParticipantRole;
  commission_split_pct?: number;
  preferred_contact_method?: ContactMethod;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus;
  offer_price?: number;
  final_price?: number;
  commission_amount?: number;
  offer_date?: string;
  contract_date?: string;
  closing_date?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  earnest_money?: number;
  down_payment?: number;
  financing_type?: FinancingType;
  appraisal_value?: number;
  notes?: string;
}

export interface CreateMessageThreadRequest {
  transaction_id?: string;
  subject?: string;
  recipient_id: string;
  initial_message: string;
}

export interface SendMessageRequest {
  thread_id: string;
  content: string;
  message_type?: MessageType;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size_bytes?: number;
}

export interface CreateCommissionRequest {
  transaction_id: string;
  agent_id: string;
  total_commission: number;
  agent_split_pct: number;
  brokerage_split_pct?: number;
  notes?: string;
}

export interface UpdateCommissionRequest {
  status?: CommissionStatus;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface TransactionWithParticipants extends Transaction {
  participants: TransactionParticipant[];
  property?: {
    id: string;
    title: string;
    address: string;
    price?: number;
    sale_price?: number;
  };
  documents: TransactionDocument[];
}

export interface MessageThreadWithMessages extends MessageThread {
  messages: Message[];
  participants: {
    id: string;
    full_name: string;
    avatar_url?: string;
  }[];
  transaction?: {
    id: string;
    property_title: string;
  };
}

export interface AgentCommissionSummary {
  agent_id: string;
  total_earned: number;
  pending_amount: number;
  paid_amount: number;
  transaction_count: number;
  average_commission: number;
}

export interface TransactionAnalyticsSummary {
  agent_id: string;
  total_transactions: number;
  average_days_on_market: number;
  average_sale_price: number;
  total_commission_earned: number;
  conversion_rate: number;
  top_lead_sources: {
    source: string;
    count: number;
    conversion_rate: number;
  }[];
}