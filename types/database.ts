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
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'landlord' | 'renter' | 'admin'
          bio: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'landlord' | 'renter' | 'admin'
          bio?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'landlord' | 'renter' | 'admin'
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
          property_type: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student'
          status: 'draft' | 'active' | 'rented' | 'inactive' | 'sold'
          listing_type: 'rent' | 'sale' | null
          price: number | null
          sale_price: number | null
          deposit: number | null
          furnished: boolean | null
          shared_rooms: boolean | null
          utilities_included: boolean | null
          nearby_universities: Json | null
          student_lease_terms: string | null
          beds: number
          baths: number
          sqft: number | null
          address: string
          city: string
          state: string | null
          zip_code: string | null
          neighborhood: string | null
          lat: number | null
          lng: number | null
          amenities: Json
          available_from: string | null
          lease_term: string | null
          property_tax_annual: number | null
          hoa_fee_monthly: number | null
          year_built: number | null
          lot_size_sqft: number | null
          parking_spaces: number | null
          garage_spaces: number | null
          stories: number | null
          slug: string
          meta_description: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          property_type: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student'
          status?: 'draft' | 'active' | 'rented' | 'inactive' | 'sold'
          listing_type?: 'rent' | 'sale' | null
          price?: number | null
          sale_price?: number | null
          deposit?: number | null
          beds: number
          baths: number
          sqft?: number | null
          address: string
          city: string
          state?: string | null
          zip_code?: string | null
          neighborhood?: string | null
          lat?: number | null
          lng?: number | null
          amenities?: Json
          available_from?: string | null
          lease_term?: string | null
          property_tax_annual?: number | null
          hoa_fee_monthly?: number | null
          year_built?: number | null
          lot_size_sqft?: number | null
          parking_spaces?: number | null
          garage_spaces?: number | null
          stories?: number | null
          slug?: string
          meta_description?: string | null
          furnished?: boolean | null
          shared_rooms?: boolean | null
          utilities_included?: boolean | null
          nearby_universities?: Json | null
          student_lease_terms?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          property_type?: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo' | 'student'
          status?: 'draft' | 'active' | 'rented' | 'inactive' | 'sold'
          listing_type?: 'rent' | 'sale' | null
          price?: number | null
          sale_price?: number | null
          deposit?: number | null
          beds?: number
          baths?: number
          sqft?: number | null
          address?: string
          city?: string
          state?: string | null
          zip_code?: string | null
          neighborhood?: string | null
          lat?: number | null
          lng?: number | null
          amenities?: Json
          available_from?: string | null
          lease_term?: string | null
          property_tax_annual?: number | null
          hoa_fee_monthly?: number | null
          year_built?: number | null
          lot_size_sqft?: number | null
          parking_spaces?: number | null
          garage_spaces?: number | null
          stories?: number | null
          slug?: string
          meta_description?: string | null
          furnished?: boolean | null
          shared_rooms?: boolean | null
          utilities_included?: boolean | null
          nearby_universities?: Json | null
          student_lease_terms?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          thumbnail_url: string | null
          alt_text: string | null
          order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          thumbnail_url?: string | null
          alt_text?: string | null
          order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          thumbnail_url?: string | null
          alt_text?: string | null
          order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      saved_properties: {
        Row: {
          user_id: string
          property_id: string
          saved_at: string
          notes: string | null
        }
        Insert: {
          user_id: string
          property_id: string
          saved_at?: string
          notes?: string | null
        }
        Update: {
          user_id?: string
          property_id?: string
          saved_at?: string
          notes?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          author_id: string
          rating: number
          title: string
          comment: string
          is_verified: boolean
          inquiry_id: string | null
          status: 'pending' | 'published' | 'flagged' | 'hidden' | 'deleted'
          flagged_reason: string | null
          flagged_at: string | null
          editable_until: string | null
          edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          author_id: string
          rating: number
          title: string
          comment: string
          is_verified?: boolean
          inquiry_id?: string | null
          status?: 'pending' | 'published' | 'flagged' | 'hidden' | 'deleted'
          flagged_reason?: string | null
          flagged_at?: string | null
          editable_until?: string | null
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          author_id?: string
          rating?: number
          title?: string
          comment?: string
          is_verified?: boolean
          inquiry_id?: string | null
          status?: 'pending' | 'published' | 'flagged' | 'hidden' | 'deleted'
          flagged_reason?: string | null
          flagged_at?: string | null
          editable_until?: string | null
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      review_responses: {
        Row: {
          id: string
          review_id: string
          landlord_id: string
          response: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          landlord_id: string
          response: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          landlord_id?: string
          response?: string
          created_at?: string
          updated_at?: string
        }
      }
      review_votes: {
        Row: {
          review_id: string
          user_id: string
          helpful: boolean
          created_at: string
        }
        Insert: {
          review_id: string
          user_id: string
          helpful: boolean
          created_at?: string
        }
        Update: {
          review_id?: string
          user_id?: string
          helpful?: boolean
          created_at?: string
        }
      }
      brokerages: {
        Row: {
          id: string
          name: string
          city: string
          phone: string | null
          address: string | null
          website_url: string | null
          assignment_mode: 'round_robin' | 'performance_based' | 'geographic' | 'specialty'
          default_commission_split_pct: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          phone?: string | null
          address?: string | null
          website_url?: string | null
          assignment_mode?: 'round_robin' | 'performance_based' | 'geographic' | 'specialty'
          default_commission_split_pct?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          phone?: string | null
          address?: string | null
          website_url?: string | null
          assignment_mode?: 'round_robin' | 'performance_based' | 'geographic' | 'specialty'
          default_commission_split_pct?: number
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          user_id: string
          brokerage_id: string | null
          agent_type: 'real_estate_agent' | 'property_manager' | 'home_builder' | 'photographer' | 'other'
          business_name: string | null
          license_number: string | null
          license_state: string | null
          license_expiry_date: string | null
          years_experience: number | null
          phone: string | null
          whatsapp: string | null
          office_address: string | null
          office_city: string | null
          bio: string | null
          specializations: string[] | null
          languages: string[] | null
          certifications: string[] | null
          profile_image_url: string | null
          cover_image_url: string | null
          video_url: string | null
          properties_listed: number
          properties_sold: number
          avg_rating: number | null
          total_reviews: number
          verified: boolean
          verification_date: string | null
          is_active: boolean
          is_featured: boolean
          is_premier: boolean
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brokerage_id?: string | null
          agent_type: 'real_estate_agent' | 'property_manager' | 'home_builder' | 'photographer' | 'other'
          business_name?: string | null
          license_number?: string | null
          license_state?: string | null
          license_expiry_date?: string | null
          years_experience?: number | null
          phone?: string | null
          whatsapp?: string | null
          office_address?: string | null
          office_city?: string | null
          bio?: string | null
          specializations?: string[] | null
          languages?: string[] | null
          certifications?: string[] | null
          profile_image_url?: string | null
          cover_image_url?: string | null
          video_url?: string | null
          properties_listed?: number
          properties_sold?: number
          avg_rating?: number | null
          total_reviews?: number
          verified?: boolean
          verification_date?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_premier?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brokerage_id?: string | null
          agent_type?: 'real_estate_agent' | 'property_manager' | 'home_builder' | 'photographer' | 'other'
          business_name?: string | null
          license_number?: string | null
          license_state?: string | null
          license_expiry_date?: string | null
          years_experience?: number | null
          phone?: string | null
          whatsapp?: string | null
          office_address?: string | null
          office_city?: string | null
          bio?: string | null
          specializations?: string[] | null
          languages?: string[] | null
          certifications?: string[] | null
          profile_image_url?: string | null
          cover_image_url?: string | null
          video_url?: string | null
          properties_listed?: number
          properties_sold?: number
          avg_rating?: number | null
          total_reviews?: number
          verified?: boolean
          verification_date?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_premier?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_teams: {
        Row: {
          id: string
          brokerage_id: string | null
          team_lead_id: string
          team_name: string
          description: string | null
          logo_url: string | null
          commission_split_pct: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brokerage_id?: string | null
          team_lead_id: string
          team_name: string
          description?: string | null
          logo_url?: string | null
          commission_split_pct?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brokerage_id?: string | null
          team_lead_id?: string
          team_name?: string
          description?: string | null
          logo_url?: string | null
          commission_split_pct?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          agent_id: string
          role: 'lead' | 'member' | 'coordinator'
          commission_split_pct: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          agent_id: string
          role?: 'lead' | 'member' | 'coordinator'
          commission_split_pct?: number | null
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          agent_id?: string
          role?: 'lead' | 'member' | 'coordinator'
          commission_split_pct?: number | null
          joined_at?: string
        }
      }
      agent_service_areas: {
        Row: {
          id: string
          agent_id: string
          city: string
          neighborhood: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          city: string
          neighborhood?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          city?: string
          neighborhood?: string | null
          is_primary?: boolean
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          agent_id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          client_type: 'buyer' | 'seller' | 'renter' | 'landlord' | 'mixed'
          source_lead_id: string | null
          preferred_areas: string[] | null
          budget_min: number | null
          budget_max: number | null
          timeline: string | null
          special_requirements: string | null
          is_active: boolean
          last_contacted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          client_type: 'buyer' | 'seller' | 'renter' | 'landlord' | 'mixed'
          source_lead_id?: string | null
          preferred_areas?: string[] | null
          budget_min?: number | null
          budget_max?: number | null
          timeline?: string | null
          special_requirements?: string | null
          is_active?: boolean
          last_contacted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          client_type?: 'buyer' | 'seller' | 'renter' | 'landlord' | 'mixed'
          source_lead_id?: string | null
          preferred_areas?: string[] | null
          budget_min?: number | null
          budget_max?: number | null
          timeline?: string | null
          special_requirements?: string | null
          is_active?: boolean
          last_contacted_at?: string | null
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
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          agent_id: string
          note_text: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          agent_id?: string
          note_text?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          assigned_to: string | null
          team_id: string | null
          source: 'inquiry' | 'property_listing' | 'search' | 'advertisement' | 'direct'
          lead_type: 'buyer_lead' | 'seller_lead' | 'rental_lead' | 'property_valuation' | 'general_inquiry'
          contact_name: string
          contact_email: string | null
          contact_phone: string | null
          message: string | null
          property_id: string | null
          budget_min: number | null
          budget_max: number | null
          preferred_areas: string[] | null
          timeline: string | null
          lead_score: number
          profile_completeness_pct: number
          financing_status: 'unknown' | 'not_ready' | 'pre_approved' | 'pre_qualified' | null
          status: 'new' | 'assigned' | 'claimed' | 'contacted' | 'in_progress' | 'converted' | 'closed' | 'lost' | 'spam'
          auto_assigned_at: string | null
          claim_deadline_at: string | null
          claimed_at: string | null
          expires_at: string | null
          agent_notes: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assigned_to?: string | null
          team_id?: string | null
          source?: 'inquiry' | 'property_listing' | 'search' | 'advertisement' | 'direct'
          lead_type: 'buyer_lead' | 'seller_lead' | 'rental_lead' | 'property_valuation' | 'general_inquiry'
          contact_name: string
          contact_email?: string | null
          contact_phone?: string | null
          message?: string | null
          property_id?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_areas?: string[] | null
          timeline?: string | null
          lead_score?: number
          profile_completeness_pct?: number
          financing_status?: 'unknown' | 'not_ready' | 'pre_approved' | 'pre_qualified' | null
          status?: 'new' | 'assigned' | 'claimed' | 'contacted' | 'in_progress' | 'converted' | 'closed' | 'lost' | 'spam'
          auto_assigned_at?: string | null
          claim_deadline_at?: string | null
          claimed_at?: string | null
          expires_at?: string | null
          agent_notes?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assigned_to?: string | null
          team_id?: string | null
          source?: 'inquiry' | 'property_listing' | 'search' | 'advertisement' | 'direct'
          lead_type?: 'buyer_lead' | 'seller_lead' | 'rental_lead' | 'property_valuation' | 'general_inquiry'
          contact_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          message?: string | null
          property_id?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_areas?: string[] | null
          timeline?: string | null
          lead_score?: number
          profile_completeness_pct?: number
          financing_status?: 'unknown' | 'not_ready' | 'pre_approved' | 'pre_qualified' | null
          status?: 'new' | 'assigned' | 'claimed' | 'contacted' | 'in_progress' | 'converted' | 'closed' | 'lost' | 'spam'
          auto_assigned_at?: string | null
          claim_deadline_at?: string | null
          claimed_at?: string | null
          expires_at?: string | null
          agent_notes?: string | null
          user_agent?: string | null
          ip_address?: string | null
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
          assignment_status: 'assigned' | 'claimed' | 'abandoned' | 'reassigned'
          assigned_at: string
          response_at: string | null
          response_time_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          assigned_agent_id?: string | null
          assigned_team_id?: string | null
          assignment_mode: string
          assignment_reason?: string | null
          assignment_status?: 'assigned' | 'claimed' | 'abandoned' | 'reassigned'
          assigned_at?: string
          response_at?: string | null
          response_time_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          assigned_agent_id?: string | null
          assigned_team_id?: string | null
          assignment_mode?: string
          assignment_reason?: string | null
          assignment_status?: 'assigned' | 'claimed' | 'abandoned' | 'reassigned'
          assigned_at?: string
          response_at?: string | null
          response_time_minutes?: number | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          agent_id: string
          property_id: string | null
          client_id: string | null
          appointment_type: 'tour' | 'open_house' | 'consultation' | 'meeting' | 'inspection' | 'appraisal'
          title: string
          description: string | null
          scheduled_at: string
          duration_minutes: number
          location: string | null
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          client_feedback: string | null
          agent_notes: string | null
          follow_up_required: boolean
          google_calendar_event_id: string | null
          reminder_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          property_id?: string | null
          client_id?: string | null
          appointment_type: 'tour' | 'open_house' | 'consultation' | 'meeting' | 'inspection' | 'appraisal'
          title: string
          description?: string | null
          scheduled_at: string
          duration_minutes?: number
          location?: string | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          client_feedback?: string | null
          agent_notes?: string | null
          follow_up_required?: boolean
          google_calendar_event_id?: string | null
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          property_id?: string | null
          client_id?: string | null
          appointment_type?: 'tour' | 'open_house' | 'consultation' | 'meeting' | 'inspection' | 'appraisal'
          title?: string
          description?: string | null
          scheduled_at?: string
          duration_minutes?: number
          location?: string | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          client_feedback?: string | null
          agent_notes?: string | null
          follow_up_required?: boolean
          google_calendar_event_id?: string | null
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_attendees: {
        Row: {
          id: string
          appointment_id: string
          attendee_user_id: string | null
          attendee_client_id: string | null
          attendance_status: 'invited' | 'confirmed' | 'attended' | 'absent' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          attendee_user_id?: string | null
          attendee_client_id?: string | null
          attendance_status?: 'invited' | 'confirmed' | 'attended' | 'absent' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          attendee_user_id?: string | null
          attendee_client_id?: string | null
          attendance_status?: 'invited' | 'confirmed' | 'attended' | 'absent' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
