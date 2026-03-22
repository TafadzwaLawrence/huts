/**
 * AUTO-GENERATED Database Types
 * Includes all Supabase tables (Phases 0-2)
 * 
 * To regenerate: npx supabase gen types typescript --project-id idhcvldxyhfjzytswomo > types/database.ts
 * (Requires Supabase CLI auth)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ============================================================================
      // PHASE 0: Core Tables (profiles, properties, reviews, messages, etc.)
      // ============================================================================

      profiles: {
        Row: {
          id: string
          role: 'landlord' | 'renter' | 'admin' | 'agent'
          full_name: string | null
          avatar_url: string | null
          email: string
          phone: string | null
          city: string | null
          area: string | null
          bio: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'landlord' | 'renter' | 'admin' | 'agent'
          full_name?: string | null
          avatar_url?: string | null
          email: string
          phone?: string | null
          city?: string | null
          area?: string | null
          bio?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'landlord' | 'renter' | 'admin' | 'agent'
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          phone?: string | null
          city?: string | null
          area?: string | null
          bio?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      properties: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          address: string
          city: string
          area: string | null
          latitude: number | null
          longitude: number | null
          listing_type: 'rent' | 'sale'
          status: string
          price: number | null
          sale_price: number | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          property_type: string | null
          amenities: string[] | null
          created_at: string
          updated_at: string
          property_tax_annual: number | null
          hoa_fee_monthly: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          address: string
          city: string
          area?: string | null
          latitude?: number | null
          longitude?: number | null
          listing_type: 'rent' | 'sale'
          status?: string
          price?: number | null
          sale_price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          property_type?: string | null
          amenities?: string[] | null
          created_at?: string
          updated_at?: string
          property_tax_annual?: number | null
          hoa_fee_monthly?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          address?: string
          city?: string
          area?: string | null
          latitude?: number | null
          longitude?: number | null
          listing_type?: 'rent' | 'sale'
          status?: string
          price?: number | null
          sale_price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          property_type?: string | null
          amenities?: string[] | null
          created_at?: string
          updated_at?: string
          property_tax_annual?: number | null
          hoa_fee_monthly?: number | null
        }
      }

      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          image_url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          image_url?: string
          is_primary?: boolean
          created_at?: string
        }
      }

      reviews: {
        Row: {
          id: string
          property_id: string
          author_id: string
          rating: number
          comment_text: string
          is_verified: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          author_id: string
          rating: number
          comment_text: string
          is_verified?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          author_id?: string
          rating?: number
          comment_text?: string
          is_verified?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }

      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }

      conversations: {
        Row: {
          id: string
          property_id: string
          renter_id: string | null
          landlord_id: string
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          renter_id?: string | null
          landlord_id: string
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          renter_id?: string | null
          landlord_id?: string
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ============================================================================
      // PHASE 1: Agent System Tables
      // ============================================================================

      agents: {
        Row: {
          id: string
          profile_id: string
          brokerage_id: string | null
          agent_type: string
          license_number: string | null
          license_expiry: string | null
          specializations: string[] | null
          service_areas: string[] | null
          bio: string | null
          profile_completion_pct: number
          total_leads_assigned: number
          total_leads_claimed: number
          total_leads_converted: number
          response_rate_24h: number | null
          is_premier: boolean
          premier_since: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          brokerage_id?: string | null
          agent_type: string
          license_number?: string | null
          license_expiry?: string | null
          specializations?: string[] | null
          service_areas?: string[] | null
          bio?: string | null
          profile_completion_pct?: number
          total_leads_assigned?: number
          total_leads_claimed?: number
          total_leads_converted?: number
          response_rate_24h?: number | null
          is_premier?: boolean
          premier_since?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          brokerage_id?: string | null
          agent_type?: string
          license_number?: string | null
          license_expiry?: string | null
          specializations?: string[] | null
          service_areas?: string[] | null
          bio?: string | null
          profile_completion_pct?: number
          total_leads_assigned?: number
          total_leads_claimed?: number
          total_leads_converted?: number
          response_rate_24h?: number | null
          is_premier?: boolean
          premier_since?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      brokerages: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      agent_teams: {
        Row: {
          id: string
          brokerage_id: string
          name: string
          leader_id: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brokerage_id: string
          name: string
          leader_id: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brokerage_id?: string
          name?: string
          leader_id?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      team_members: {
        Row: {
          id: string
          team_id: string
          agent_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          agent_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          agent_id?: string
          role?: string
          joined_at?: string
        }
      }

      agent_service_areas: {
        Row: {
          id: string
          agent_id: string
          city: string
          area: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          city: string
          area?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          city?: string
          area?: string | null
          created_at?: string
        }
      }

      leads: {
        Row: {
          id: string
          lead_type: string
          status: string
          contact_name: string
          contact_email: string | null
          contact_phone: string | null
          message: string | null
          property_id: string | null
          budget_min: number | null
          budget_max: number | null
          preferred_areas: string[] | null
          specializations_needed: string[] | null
          timeline: string | null
          financing_status: string | null
          assigned_agent_id: string | null
          assigned_team_id: string | null
          assignment_mode: string | null
          claim_deadline_at: string | null
          expires_at: string | null
          lead_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_type: string
          status?: string
          contact_name: string
          contact_email?: string | null
          contact_phone?: string | null
          message?: string | null
          property_id?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_areas?: string[] | null
          specializations_needed?: string[] | null
          timeline?: string | null
          financing_status?: string | null
          assigned_agent_id?: string | null
          assigned_team_id?: string | null
          assignment_mode?: string | null
          claim_deadline_at?: string | null
          expires_at?: string | null
          lead_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_type?: string
          status?: string
          contact_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          message?: string | null
          property_id?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_areas?: string[] | null
          specializations_needed?: string[] | null
          timeline?: string | null
          financing_status?: string | null
          assigned_agent_id?: string | null
          assigned_team_id?: string | null
          assignment_mode?: string | null
          claim_deadline_at?: string | null
          expires_at?: string | null
          lead_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      clients: {
        Row: {
          id: string
          agent_id: string
          name: string
          email: string
          phone: string | null
          client_type: string
          budget_min: number | null
          budget_max: number | null
          preferred_locations: string[] | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          name: string
          email: string
          phone?: string | null
          client_type: string
          budget_min?: number | null
          budget_max?: number | null
          preferred_locations?: string[] | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          name?: string
          email?: string
          phone?: string | null
          client_type?: string
          budget_min?: number | null
          budget_max?: number | null
          preferred_locations?: string[] | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      client_notes: {
        Row: {
          id: string
          client_id: string
          agent_id: string
          note_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          agent_id: string
          note_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          agent_id?: string
          note_text?: string
          created_at?: string
          updated_at?: string
        }
      }

      lead_distribution_history: {
        Row: {
          id: string
          lead_id: string
          assigned_agent_id: string | null
          assigned_team_id: string | null
          assignment_mode: string
          assignment_reason: string | null
          claim_deadline_at: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          assigned_agent_id?: string | null
          assigned_team_id?: string | null
          assignment_mode: string
          assignment_reason?: string | null
          claim_deadline_at: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          assigned_agent_id?: string | null
          assigned_team_id?: string | null
          assignment_mode?: string
          assignment_reason?: string | null
          claim_deadline_at?: string
          expires_at?: string
          created_at?: string
        }
      }

      appointments: {
        Row: {
          id: string
          agent_id: string
          client_id: string | null
          property_id: string | null
          appointment_type: string
          status: string
          scheduled_at: string
          duration_minutes: number | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          client_id?: string | null
          property_id?: string | null
          appointment_type: string
          status?: string
          scheduled_at: string
          duration_minutes?: number | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          client_id?: string | null
          property_id?: string | null
          appointment_type?: string
          status?: string
          scheduled_at?: string
          duration_minutes?: number | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      appointment_attendees: {
        Row: {
          id: string
          appointment_id: string
          attendee_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          attendee_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          attendee_id?: string
          status?: string
          created_at?: string
        }
      }

      // ============================================================================
      // PHASE 2: Transactions & Messaging Tables
      // ============================================================================

      transactions: {
        Row: {
          id: string
          property_id: string
          transaction_type: 'sale' | 'rental' | 'lease'
          status: 'active' | 'pending_offer' | 'under_contract' | 'closed' | 'cancelled' | 'expired'
          listing_price: number | null
          offer_price: number | null
          final_price: number | null
          commission_rate: number | null
          commission_amount: number | null
          offer_date: string | null
          contract_date: string | null
          closing_date: string | null
          lease_start_date: string | null
          lease_end_date: string | null
          earnest_money: number | null
          down_payment: number | null
          financing_type: 'cash' | 'conventional' | 'fha' | 'va' | 'other' | null
          appraisal_value: number | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          transaction_type: 'sale' | 'rental' | 'lease'
          status?: 'active' | 'pending_offer' | 'under_contract' | 'closed' | 'cancelled' | 'expired'
          listing_price?: number | null
          offer_price?: number | null
          final_price?: number | null
          commission_rate?: number | null
          commission_amount?: number | null
          offer_date?: string | null
          contract_date?: string | null
          closing_date?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          earnest_money?: number | null
          down_payment?: number | null
          financing_type?: 'cash' | 'conventional' | 'fha' | 'va' | 'other' | null
          appraisal_value?: number | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          transaction_type?: 'sale' | 'rental' | 'lease'
          status?: 'active' | 'pending_offer' | 'under_contract' | 'closed' | 'cancelled' | 'expired'
          listing_price?: number | null
          offer_price?: number | null
          final_price?: number | null
          commission_rate?: number | null
          commission_amount?: number | null
          offer_date?: string | null
          contract_date?: string | null
          closing_date?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          earnest_money?: number | null
          down_payment?: number | null
          financing_type?: 'cash' | 'conventional' | 'fha' | 'va' | 'other' | null
          appraisal_value?: number | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      transaction_participants: {
        Row: {
          id: string
          transaction_id: string
          profile_id: string
          role: 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator'
          commission_split_pct: number | null
          commission_amount: number | null
          can_contact: boolean
          preferred_contact_method: 'email' | 'phone' | 'text' | 'app'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          profile_id: string
          role: 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator'
          commission_split_pct?: number | null
          commission_amount?: number | null
          can_contact?: boolean
          preferred_contact_method?: 'email' | 'phone' | 'text' | 'app'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          profile_id?: string
          role?: 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator'
          commission_split_pct?: number | null
          commission_amount?: number | null
          can_contact?: boolean
          preferred_contact_method?: 'email' | 'phone' | 'text' | 'app'
          created_at?: string
          updated_at?: string
        }
      }

      transaction_documents: {
        Row: {
          id: string
          transaction_id: string
          uploaded_by: string
          document_type: 'contract' | 'disclosure' | 'addendum' | 'inspection_report' | 'appraisal' | 'closing_statement' | 'other'
          title: string
          description: string | null
          file_path: string
          file_name: string
          file_size_bytes: number | null
          mime_type: string | null
          is_private: boolean
          is_executed: boolean
          executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          uploaded_by: string
          document_type: 'contract' | 'disclosure' | 'addendum' | 'inspection_report' | 'appraisal' | 'closing_statement' | 'other'
          title: string
          description?: string | null
          file_path: string
          file_name: string
          file_size_bytes?: number | null
          mime_type?: string | null
          is_private?: boolean
          is_executed?: boolean
          executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          uploaded_by?: string
          document_type?: 'contract' | 'disclosure' | 'addendum' | 'inspection_report' | 'appraisal' | 'closing_statement' | 'other'
          title?: string
          description?: string | null
          file_path?: string
          file_name?: string
          file_size_bytes?: number | null
          mime_type?: string | null
          is_private?: boolean
          is_executed?: boolean
          executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      transaction_message_threads: {
        Row: {
          id: string
          transaction_id: string
          created_by: string
          created_at: string
          updated_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          created_by: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
        }
      }

      commissions: {
        Row: {
          id: string
          transaction_id: string
          agent_id: string
          total_commission: number
          agent_split_pct: number
          agent_commission: number
          brokerage_id: string | null
          brokerage_split_pct: number | null
          brokerage_commission: number | null
          status: 'pending' | 'paid' | 'cancelled'
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          agent_id: string
          total_commission: number
          agent_split_pct: number
          agent_commission: number
          brokerage_id?: string | null
          brokerage_split_pct?: number | null
          brokerage_commission?: number | null
          status?: 'pending' | 'paid' | 'cancelled'
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          agent_id?: string
          total_commission?: number
          agent_split_pct?: number
          agent_commission?: number
          brokerage_id?: string | null
          brokerage_split_pct?: number | null
          brokerage_commission?: number | null
          status?: 'pending' | 'paid' | 'cancelled'
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      transaction_analytics: {
        Row: {
          id: string
          agent_id: string
          transaction_id: string | null
          days_on_market: number | null
          offer_to_contract_days: number | null
          contract_to_close_days: number | null
          total_transaction_days: number | null
          price_vs_list: number | null
          commission_earned: number | null
          lead_source: string | null
          marketing_channel: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          transaction_id?: string | null
          days_on_market?: number | null
          offer_to_contract_days?: number | null
          contract_to_close_days?: number | null
          total_transaction_days?: number | null
          price_vs_list?: number | null
          commission_earned?: number | null
          lead_source?: string | null
          marketing_channel?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          transaction_id?: string | null
          days_on_market?: number | null
          offer_to_contract_days?: number | null
          contract_to_close_days?: number | null
          total_transaction_days?: number | null
          price_vs_list?: number | null
          commission_earned?: number | null
          lead_source?: string | null
          marketing_channel?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      get_or_create_conversation: {
        Args: {
          p_property_id: string
          p_renter_id: string
          p_landlord_id: string
        }
        Returns: string
      }
    }
    Enums: {
      // Phase 2: Transaction System Enums
      transaction_type: 'sale' | 'rental' | 'lease'
      transaction_status: 'active' | 'pending_offer' | 'under_contract' | 'closed' | 'cancelled' | 'expired'
      transaction_participant_role: 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator'
      document_type: 'contract' | 'disclosure' | 'addendum' | 'inspection_report' | 'appraisal' | 'closing_statement' | 'other'
      commission_status: 'pending' | 'paid' | 'cancelled'
      financing_type: 'cash' | 'conventional' | 'fha' | 'va' | 'other'
    }
  }
}
