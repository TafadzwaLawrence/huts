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

// Discriminated unions for rental vs sale properties
export type RentalProperty = Property & {
  listing_type: 'rent'
  price: number
  deposit: number | null
  available_from: string | null
  lease_term: string | null
  sale_price: null
}

export type SaleProperty = Property & {
  listing_type: 'sale'
  sale_price: number
  property_tax_annual: number | null
  hoa_fee_monthly: number | null
  year_built: number | null
  lot_size_sqft: number | null
  parking_spaces: number
  garage_spaces: number
  stories: number | null
  price: null
}

export type PropertyListing = RentalProperty | SaleProperty

// Type guards
export function isRentalProperty(property: Property): property is RentalProperty {
  return property.listing_type === 'rent'
}

export function isSaleProperty(property: Property): property is SaleProperty {
  return property.listing_type === 'sale'
}

export type PropertyCardProps = {
  property: PropertyWithImages
}
