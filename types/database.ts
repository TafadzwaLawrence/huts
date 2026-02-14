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
          property_type: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo'
          status: 'draft' | 'active' | 'rented' | 'inactive'
          price: number
          deposit: number | null
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
          property_type?: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo'
          status?: 'draft' | 'active' | 'rented' | 'inactive'
          price: number
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
          slug?: string
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          property_type?: 'apartment' | 'house' | 'studio' | 'room' | 'townhouse' | 'condo'
          status?: 'draft' | 'active' | 'rented' | 'inactive'
          price?: number
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
          slug?: string
          meta_description?: string | null
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
    }
  }
}
