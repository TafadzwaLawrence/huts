export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      area_guides: {
        Row: {
          avg_rent: number | null
          bounds_ne_lat: number | null
          bounds_ne_lng: number | null
          bounds_sw_lat: number | null
          bounds_sw_lng: number | null
          city: string
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          name: string
          neighborhood: string | null
          property_count: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          avg_rent?: number | null
          bounds_ne_lat?: number | null
          bounds_ne_lng?: number | null
          bounds_sw_lat?: number | null
          bounds_sw_lng?: number | null
          city: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          neighborhood?: string | null
          property_count?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          avg_rent?: number | null
          bounds_ne_lat?: number | null
          bounds_ne_lng?: number | null
          bounds_sw_lat?: number | null
          bounds_sw_lng?: number | null
          city?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          neighborhood?: string | null
          property_count?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          landlord_id: string
          last_message_at: string | null
          last_message_preview: string | null
          property_id: string | null
          renter_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landlord_id: string
          last_message_at?: string | null
          last_message_preview?: string | null
          property_id?: string | null
          renter_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landlord_id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          property_id?: string | null
          renter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string | null
          id: string
          message: string
          preferred_contact: string | null
          preferred_move_in: string | null
          property_id: string
          read_at: string | null
          recipient_id: string
          replied_at: string | null
          sender_id: string
          status: Database["public"]["Enums"]["inquiry_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          preferred_contact?: string | null
          preferred_move_in?: string | null
          property_id: string
          read_at?: string | null
          recipient_id: string
          replied_at?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["inquiry_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          preferred_contact?: string | null
          preferred_move_in?: string | null
          property_id?: string
          read_at?: string | null
          recipient_id?: string
          replied_at?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["inquiry_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          link: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          role: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: Json | null
          available_from: string | null
          baths: number
          beds: number
          city: string
          created_at: string | null
          deposit: number | null
          description: string | null
          furnished: boolean | null
          garage_spaces: number | null
          hoa_fee_monthly: number | null
          id: string
          lat: number | null
          lease_term: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lng: number | null
          lot_size_sqft: number | null
          meta_description: string | null
          nearby_universities: Json | null
          neighborhood: string | null
          parking_spaces: number | null
          price: number | null
          property_tax_annual: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string | null
          rejection_reason: string | null
          sale_price: number | null
          shared_rooms: boolean | null
          slug: string | null
          sqft: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          stories: number | null
          student_lease_terms: string | null
          title: string
          updated_at: string | null
          user_id: string
          utilities_included: boolean | null
          verification_status: string
          verification_token: string | null
          verified_at: string | null
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: Json | null
          available_from?: string | null
          baths: number
          beds: number
          city: string
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          furnished?: boolean | null
          garage_spaces?: number | null
          hoa_fee_monthly?: number | null
          id?: string
          lat?: number | null
          lease_term?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lng?: number | null
          lot_size_sqft?: number | null
          meta_description?: string | null
          nearby_universities?: Json | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number | null
          property_tax_annual?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          rejection_reason?: string | null
          sale_price?: number | null
          shared_rooms?: boolean | null
          slug?: string | null
          sqft?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          stories?: number | null
          student_lease_terms?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          utilities_included?: boolean | null
          verification_status?: string
          verification_token?: string | null
          verified_at?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: Json | null
          available_from?: string | null
          baths?: number
          beds?: number
          city?: string
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          furnished?: boolean | null
          garage_spaces?: number | null
          hoa_fee_monthly?: number | null
          id?: string
          lat?: number | null
          lease_term?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lng?: number | null
          lot_size_sqft?: number | null
          meta_description?: string | null
          nearby_universities?: Json | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number | null
          property_tax_annual?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          rejection_reason?: string | null
          sale_price?: number | null
          shared_rooms?: boolean | null
          slug?: string | null
          sqft?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          stories?: number | null
          student_lease_terms?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          utilities_included?: boolean | null
          verification_status?: string
          verification_token?: string | null
          verified_at?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          order: number | null
          property_id: string
          thumbnail_url: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          order?: number | null
          property_id: string
          thumbnail_url?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          order?: number | null
          property_id?: string
          thumbnail_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          id: string
          property_id: string
          referrer: string | null
          session_id: string | null
          source: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          property_id: string
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_rate_limits: {
        Row: {
          review_count: number | null
          review_date: string
          user_id: string
        }
        Insert: {
          review_count?: number | null
          review_date?: string
          user_id: string
        }
        Update: {
          review_count?: number | null
          review_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          landlord_id: string
          response: string
          review_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landlord_id: string
          response: string
          review_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landlord_id?: string
          response?: string
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_id: string
          comment: string
          created_at: string | null
          editable_until: string | null
          edited: boolean | null
          flagged_at: string | null
          flagged_reason: string | null
          id: string
          inquiry_id: string | null
          is_verified: boolean | null
          property_id: string
          rating: number
          status: Database["public"]["Enums"]["review_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string | null
          editable_until?: string | null
          edited?: boolean | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          inquiry_id?: string | null
          is_verified?: boolean | null
          property_id: string
          rating: number
          status?: Database["public"]["Enums"]["review_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string | null
          editable_until?: string | null
          edited?: boolean | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          inquiry_id?: string | null
          is_verified?: boolean | null
          property_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          notes: string | null
          property_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          notes?: string | null
          property_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          notes?: string | null
          property_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          is_typing: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          is_typing?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      market_stats: {
        Row: {
          avg_price: number | null
          avg_sqft: number | null
          city: string | null
          listing_type: Database["public"]["Enums"]["listing_type"] | null
          max_price: number | null
          median_price: number | null
          min_price: number | null
          neighborhood_count: number | null
          total_listings: number | null
        }
        Relationships: []
      }
      property_ratings: {
        Row: {
          average_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          one_star_count: number | null
          property_id: string | null
          review_count: number | null
          three_star_count: number | null
          two_star_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_sale_stats: {
        Row: {
          avg_lot_size: number | null
          avg_sale_price: number | null
          city: string | null
          max_sale_price: number | null
          min_sale_price: number | null
          total_for_sale: number | null
        }
        Relationships: []
      }
      public_properties: {
        Row: {
          address: string | null
          amenities: Json | null
          available_from: string | null
          baths: number | null
          beds: number | null
          city: string | null
          created_at: string | null
          deposit: number | null
          description: string | null
          garage_spaces: number | null
          hoa_fee_monthly: number | null
          id: string | null
          lat: number | null
          lease_term: string | null
          listing_type: Database["public"]["Enums"]["listing_type"] | null
          lng: number | null
          lot_size_sqft: number | null
          meta_description: string | null
          neighborhood: string | null
          parking_spaces: number | null
          price: number | null
          property_tax_annual: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          published_at: string | null
          rejection_reason: string | null
          sale_price: number | null
          slug: string | null
          sqft: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          stories: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          verification_token: string | null
          verified_at: string | null
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          available_from?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          garage_spaces?: number | null
          hoa_fee_monthly?: number | null
          id?: string | null
          lat?: number | null
          lease_term?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"] | null
          lng?: number | null
          lot_size_sqft?: number | null
          meta_description?: string | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number | null
          property_tax_annual?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          rejection_reason?: string | null
          sale_price?: number | null
          slug?: string | null
          sqft?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          stories?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verification_token?: string | null
          verified_at?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          available_from?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          created_at?: string | null
          deposit?: number | null
          description?: string | null
          garage_spaces?: number | null
          hoa_fee_monthly?: number | null
          id?: string | null
          lat?: number | null
          lease_term?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"] | null
          lng?: number | null
          lot_size_sqft?: number | null
          meta_description?: string | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number | null
          property_tax_annual?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          rejection_reason?: string | null
          sale_price?: number | null
          slug?: string | null
          sqft?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          stories?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verification_token?: string | null
          verified_at?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_monthly_payment: {
        Args: {
          p_down_payment_percent?: number
          p_interest_rate?: number
          p_sale_price: number
          p_term_years?: number
        }
        Returns: number
      }
      calculate_property_score: {
        Args: { p_property_id: string }
        Returns: {
          engagement_score: number
          overall_score: number
          quality_score: number
        }[]
      }
      create_notification: {
        Args: {
          p_description?: string
          p_link?: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      earth: { Args: never; Returns: number }
      get_notification_count: { Args: { p_user_id: string }; Returns: number }
      get_or_create_conversation: {
        Args: {
          p_landlord_id: string
          p_property_id: string
          p_renter_id: string
        }
        Returns: string
      }
      get_property_details: { Args: { property_id: string }; Returns: Json }
      get_property_engagement: {
        Args: { p_property_id: string }
        Returns: {
          inquiries_total: number
          inquiries_unread: number
          saves_total: number
          views_last_30_days: number
          views_last_7_days: number
          views_total: number
        }[]
      }
      get_property_view_stats: {
        Args: { p_property_id: string }
        Returns: {
          last30: number
          last7: number
          total: number
          unique_viewers: number
        }[]
      }
      get_unread_count: { Args: { p_user_id: string }; Returns: number }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      properties_within_radius: {
        Args: { center_lat: number; center_lng: number; radius_km: number }
        Returns: {
          address: string
          amenities: Json | null
          available_from: string | null
          baths: number
          beds: number
          city: string
          created_at: string | null
          deposit: number | null
          description: string | null
          garage_spaces: number | null
          hoa_fee_monthly: number | null
          id: string
          lat: number | null
          lease_term: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lng: number | null
          lot_size_sqft: number | null
          meta_description: string | null
          neighborhood: string | null
          parking_spaces: number | null
          price: number | null
          property_tax_annual: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string | null
          rejection_reason: string | null
          sale_price: number | null
          slug: string | null
          sqft: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          stories: number | null
          title: string
          updated_at: string | null
          user_id: string
          verification_status: string
          verification_token: string | null
          verified_at: string | null
          year_built: number | null
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "properties"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      refresh_market_stats: { Args: never; Returns: undefined }
      search_properties: {
        Args: { search_query: string }
        Returns: {
          address: string
          amenities: Json | null
          available_from: string | null
          baths: number
          beds: number
          city: string
          created_at: string | null
          deposit: number | null
          description: string | null
          garage_spaces: number | null
          hoa_fee_monthly: number | null
          id: string
          lat: number | null
          lease_term: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lng: number | null
          lot_size_sqft: number | null
          meta_description: string | null
          neighborhood: string | null
          parking_spaces: number | null
          price: number | null
          property_tax_annual: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string | null
          rejection_reason: string | null
          sale_price: number | null
          slug: string | null
          sqft: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          stories: number | null
          title: string
          updated_at: string | null
          user_id: string
          verification_status: string
          verification_token: string | null
          verified_at: string | null
          year_built: number | null
          zip_code: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "properties"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      track_property_view: {
        Args: {
          p_property_id: string
          p_session_id?: string
          p_source?: string
          p_viewer_id?: string
        }
        Returns: undefined
      }
      update_area_stats: { Args: never; Returns: undefined }
    }
    Enums: {
      inquiry_status: "unread" | "read" | "replied" | "archived"
      listing_type: "rent" | "sale"
      property_status: "draft" | "active" | "rented" | "inactive" | "sold"
      property_type:
        | "apartment"
        | "house"
        | "studio"
        | "room"
        | "townhouse"
        | "condo"
        | "student"
      review_status: "pending" | "published" | "flagged" | "hidden" | "deleted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      inquiry_status: ["unread", "read", "replied", "archived"],
      listing_type: ["rent", "sale"],
      property_status: ["draft", "active", "rented", "inactive", "sold"],
      property_type: [
        "apartment",
        "house",
        "studio",
        "room",
        "townhouse",
        "condo",
        "student",
      ],
      review_status: ["pending", "published", "flagged", "hidden", "deleted"],
    },
  },
} as const
