import { Database } from './database'

export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type PropertyImage = Database['public']['Tables']['property_images']['Row']
export type PropertyImageInsert = Database['public']['Tables']['property_images']['Insert']

export type SavedProperty = Database['public']['Tables']['saved_properties']['Row']

export type PropertyWithImages = Property & {
  property_images: PropertyImage[]
  profiles: Pick<Profile, 'name' | 'avatar_url' | 'verified'>
}

// Type guards for listing types
export function isRentalProperty(property: Property | PropertyWithImages): boolean {
  return property.listing_type === 'rent' || property.listing_type === null // null defaults to rent
}

export function isSaleProperty(property: Property | PropertyWithImages): boolean {
  return property.listing_type === 'sale'
}

// Type guard for student properties
export function isStudentProperty(property: Property | PropertyWithImages): boolean {
  return property.property_type === 'student'
}

export type PropertyCardProps = {
  property: PropertyWithImages
}
