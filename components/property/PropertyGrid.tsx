import { PropertyWithImages } from '@/types'
import { PropertyCard } from './PropertyCard'

interface PropertyGridProps {
  properties: PropertyWithImages[]
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No properties found</p>
      </div>
    )
  }

  return (
    <div className="grid-properties">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
