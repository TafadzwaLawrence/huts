# Properties for Sale System - Implementation Guide

## ✅ Core Implementation Complete

The foundational system for properties for sale has been implemented. Here's what's ready:

### 📁 Files Created (7 files)

**Database Migration (1 file)**
- [supabase/migrations/011_sale_properties.sql](supabase/migrations/011_sale_properties.sql) - 155 lines
  - Added `listing_type` enum ('rent', 'sale')
  - Extended `properties` table with 8 new columns
  - Sale-specific fields: `sale_price`, `property_tax_annual`, `hoa_fee_monthly`, `year_built`, `lot_size_sqft`, `parking_spaces`, `garage_spaces`, `stories`
  - Made rental fields nullable
  - Added `sold` status to `property_status` enum
  - Created 4 indexes for performance
  - Added helper function `calculate_monthly_payment()`
  - Created `property_sale_stats` view

**TypeScript Types (1 file update)**
- [types/index.ts](types/index.ts) - Updated
  - Added discriminated union types: `RentalProperty` and `SaleProperty`
  - Created type guard functions: `isRentalProperty()` and `isSaleProperty()`
  - Added `PropertyListing` union type

**Utility Functions (1 file update)**
- [lib/utils.ts](lib/utils.ts) - Updated
  - `formatSalePrice()` - Format large numbers ($300K, $1.5M)
  - `calculateMonthlyMortgage()` - Mortgage payment calculator
  - `calculateTotalMonthlyCost()` - Include taxes, HOA, insurance

**Components (4 new files)**
- [components/property/PropertyTypeToggle.tsx](components/property/PropertyTypeToggle.tsx) - Toggle between All/Rent/Sale
- [components/property/MortgageCalculator.tsx](components/property/MortgageCalculator.tsx) - Interactive calculator with sliders
- [components/property/SalePropertyDetails.tsx](components/property/SalePropertyDetails.tsx) - Display sale-specific info
- [components/property/PropertyCard.tsx](components/property/PropertyCard.tsx) - Updated to handle both types

---

## 🎯 Features Implemented

### Database Layer
✅ Dual listing type system (rent/sale)  
✅ Sale-specific fields (price, taxes, HOA, year built, lot size, parking)  
✅ Backward compatibility (existing properties default to 'rent')  
✅ Database constraints ensure data integrity  
✅ Performance indexes for filtering by listing type  
✅ PostgreSQL function for mortgage calculations  

### Type Safety
✅ Discriminated unions for compile-time type safety  
✅ Type guards to safely check listing type  
✅ All new fields properly typed  

### UI Components
✅ PropertyCard shows rent/sale badges dynamically  
✅ Sale properties show parking instead of lease terms  
✅ PropertyTypeToggle for switching views  
✅ MortgageCalculator with interactive sliders  
✅ SalePropertyDetails component with all sale info  
✅ B&W design system maintained  

### Utilities
✅ Price formatting for large numbers ($300K format)  
✅ Mortgage calculation with customizable terms  
✅ Total monthly cost including all fees  

---

## 🚀 Deployment Steps

### 1. Apply Database Migration

**Option A: Supabase Dashboard**
1. Go to https://idhcvldxyhfjzytswomo.supabase.co/project/_/sql/new
2. Copy contents of `supabase/migrations/011_sale_properties.sql`
3. Paste and click "Run"

**Option B: Supabase CLI** (if configured)
```bash
npx supabase db push
```

### 2. Verify Migration
Run this query to confirm:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('listing_type', 'sale_price', 'parking_spaces');
```

### 3. Update Database Types (Recommended)
```bash
npx supabase gen types typescript --project-id idhcvldxyhfjzytswomo > types/database.ts
```

### 4. Test with Sample Data
```sql
-- Create a test sale property
INSERT INTO properties (
  title,
  slug,
  description,
  listing_type,
  sale_price,
  property_tax_annual,
  hoa_fee_monthly,
  year_built,
  lot_size_sqft,
  parking_spaces,
  garage_spaces,
  beds,
  baths,
  sqft,
  city,
  state,
  zip_code,
  lat,
  lng,
  property_type,
  status,
  user_id
) VALUES (
  'Beautiful Family Home',
  'beautiful-family-home-12345',
  'Spacious 4-bedroom home with modern amenities',
  'sale',
  45000000, -- $450,000
  500000, -- $5,000/year tax
  25000, -- $250/month HOA
  2015,
  650000, -- 6,500 sqft lot
  2,
  2,
  4,
  3,
  2400,
  'Phoenix',
  'AZ',
  '85001',
  33.4484,
  -112.0740,
  'house',
  'active',
  (SELECT id FROM profiles LIMIT 1)
);
```

---

## 📋 Remaining Implementation Tasks

### High Priority (Week 1-2)

#### 1. Update Homepage ([app/page.tsx](app/page.tsx))
**Current state:** Fetches only `properties` variable  
**Required changes:**
```typescript
// Replace single query with two queries:
const { data: rentalProperties } = await supabase
  .from('properties')
  .select('...')
  .eq('listing_type', 'rent')
  .limit(6)

const { data: saleProperties } = await supabase
  .from('properties')
  .select('...')
  .eq('listing_type', 'sale')
  .limit(6)

// Update JSX to show both sections:
<section>
  <h2>Featured Rentals</h2>
  {rentalProperties?.map(...)}
</section>

<section>
  <h2>Homes for Sale</h2>
  {saleProperties?.map(...)}
</section>
```

#### 2. Update Search Page ([app/search/page.tsx](app/search/page.tsx))
- Add PropertyTypeToggle component at top
- Add state: `const [listingType, setListingType] = useState<'all' | 'rent' | 'sale'>('all')`
- Update Supabase query to filter by listing_type
- Add URL param support: `/search?type=sale`
- Show conditional filters (rental price vs sale price)

#### 3. Create/Update Property Detail Page
**If exists:** [app/property/[slug]/page.tsx](app/property/[slug]/page.tsx)  
**Add:**
```tsx
import { isRentalProperty, isSaleProperty } from '@/types'
import { SalePropertyDetails } from '@/components/property/SalePropertyDetails'

// In page component:
{isSaleProperty(property) ? (
  <SalePropertyDetails property={property} />
) : (
  // Existing rental details
)}
```

#### 4. Update Property Creation Form ([app/dashboard/new-property/page.tsx](app/dashboard/new-property/page.tsx))
**Add:**
- Listing type selection (radio buttons or toggle)
- Conditional form fields based on selection
- Validation for required fields per type

**Example structure:**
```tsx
const [listingType, setListingType] = useState<'rent' | 'sale'>('rent')

<div className="mb-6">
  <label>Listing Type</label>
  <PropertyTypeToggle 
    value={listingType} 
    onChange={setListingType}
  />
</div>

{listingType === 'rent' ? (
  <>
    <Input label="Monthly Rent" name="price" type="number" />
    <Input label="Security Deposit" name="deposit" type="number" />
    <Select label="Lease Term" name="leaseTerm" />
    <DateInput label="Available From" name="availableFrom" />
  </>
) : (
  <>
    <Input label="Sale Price" name="salePrice" type="number" />
    <Input label="Property Tax (annual)" name="propertyTaxAnnual" type="number" />
    <Input label="HOA Fee (monthly)" name="hoaFeeMonthly" type="number" />
    <Input label="Year Built" name="yearBuilt" type="number" />
    <Input label="Lot Size (sqft)" name="lotSizeSqft" type="number" />
    <Input label="Parking Spaces" name="parkingSpaces" type="number" />
    <Input label="Garage Spaces" name="garageSpaces" type="number" />
  </>
)}
```

#### 5. Create API Routes
**Create:** [app/api/properties/route.ts](app/api/properties/route.ts)
```typescript
// GET /api/properties?listing_type=rent|sale&minPrice=&maxPrice=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listingType = searchParams.get('listing_type')
  
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
  
  if (listingType && listingType !== 'all') {
    query = query.eq('listing_type', listingType)
  }
  
  // Add more filters...
  const { data } = await query
  return NextResponse.json({ properties: data })
}
```

### Medium Priority (Week 2-3)

#### 6. Update Dashboard Overview ([app/dashboard/overview/page.tsx](app/dashboard/overview/page.tsx))
- Show separate counts for rentals vs sales
- Add stats cards for each type
- Filter properties list by listing type

#### 7. Create Price Filters
**Create:** [components/filters/SalePriceFilter.tsx](components/filters/SalePriceFilter.tsx)
```tsx
<div className="space-y-2">
  <label>Sale Price Range</label>
  <div className="flex gap-2">
    <Input placeholder="Min ($)" />
    <Input placeholder="Max ($)" />
  </div>
  <div className="flex flex-wrap gap-2 mt-2">
    <button>Under $200K</button>
    <button>$200K-$400K</button>
    <button>$400K-$600K</button>
    <button>$600K+</button>
  </div>
</div>
```

#### 8. Update AI Search Assistant
**Update:** [app/search/AISearchAssistant.tsx](app/search/AISearchAssistant.tsx)
- Recognize "for sale" vs "for rent" in natural language
- Parse sale price ranges ("under 300k", "between 200k and 400k")
- Extract sale-specific features (parking, year built, lot size)

**Example queries to handle:**
- "3 bedroom house for sale under $300k in Avondale"
- "Show me homes for sale with 2 car garage"
- "Houses built after 2010 for sale"

### Low Priority (Week 3-4)

#### 9. Update Area Guides
- Show both rentals and sales in area pages
- Add market stats for sale properties
- Show average sale prices by neighborhood

#### 10. Email Notifications
- Create [emails/NewSaleInquiryEmail.tsx](emails/NewSaleInquiryEmail.tsx)
- Customize for sale properties (different CTAs like "Schedule Tour", "Make Offer")

#### 11. SEO Enhancements
- Update meta tags to differentiate rentals vs sales
- Add structured data (schema.org) for both property types
- Create separate sitemaps if needed

---

## 🧪 Testing Checklist

### Database
- [ ] Migration runs successfully
- [ ] All columns added to properties table
- [ ] Existing rental properties still work
- [ ] Can create sale properties
- [ ] Constraints prevent invalid data (rent without price, sale without sale_price)
- [ ] Indexes improve query performance

### Components
- [ ] PropertyCard shows rent/sale badges correctly
- [ ] PropertyTypeToggle switches between views
- [ ] MortgageCalculator computes payments accurately
- [ ] SalePropertyDetails displays all sale info
- [ ] Responsive on mobile (44px min touch targets)

### Type Safety
- [ ] TypeScript compilation succeeds
- [ ] Type guards work correctly
- [ ] No `any` types in critical paths

### User Flows
- [ ] Can view rental properties
- [ ] Can view sale properties
- [ ] Can toggle between All/Rent/Sale
- [ ] Mortgage calculator interactive and accurate
- [ ] Property cards show correct pricing
- [ ] Search filters work for both types

---

## 📊 Database Schema Reference

### New Columns in `properties` Table

| Column | Type | Description | Required For |
|--------|------|-------------|--------------|
| `listing_type` | enum | 'rent' or 'sale' | Both |
| `sale_price` | integer | Purchase price in cents | Sale only |
| `property_tax_annual` | integer | Annual tax in cents | Sale (optional) |
| `hoa_fee_monthly` | integer | Monthly HOA in cents | Sale (optional) |
| `year_built` | integer | Year constructed | Sale (optional) |
| `lot_size_sqft` | integer | Lot size in sqft | Sale (optional) |
| `parking_spaces` | integer | Total parking | Sale (optional) |
| `garage_spaces` | integer | Garage bays | Sale (optional) |
| `stories` | integer | Number of floors | Sale (optional) |

### Constraints

- Either `price` OR `sale_price` must be set (based on listing_type)
- `sale_price` must be > 0 if present
- `year_built` must be >= 1800 and <= 2100
- `parking_spaces` and `garage_spaces` must be >= 0

---

## 🎨 Design System Compliance

All new components follow B&W design:
- **PropertyTypeToggle:** Black background for active, white for inactive
- **MortgageCalculator:** Grayscale sliders, black accents
- **Sale badge:** White background with "FOR SALE" text
- **Price formatting:** Consistent with existing ($300K format)
- **Touch targets:** 44×44px minimum on mobile
- **Hover states:** Border thickening, subtle lifts

---

## 🔐 Security Notes

1. **RLS Policies:** Existing policies work for both listing types
2. **Validation:** Database constraints prevent invalid data
3. **Input sanitization:** Use prepared statements in all queries
4. **User permissions:** Only property owners can edit their listings

---

## 📞 Integration Examples

### Using MortgageCalculator
```tsx
import { MortgageCalculator } from '@/components/property/MortgageCalculator'

<MortgageCalculator
  salePrice={property.sale_price}
  propertyTaxAnnual={property.property_tax_annual}
  hoaFeeMonthly={property.hoa_fee_monthly}
/>
```

### Using PropertyTypeToggle
```tsx
import { PropertyTypeToggle } from '@/components/property/PropertyTypeToggle'

const [listingType, setListingType] = useState<'all' | 'rent' | 'sale'>('all')

<PropertyTypeToggle value={listingType} onChange={setListingType} />
```

### Using Type Guards
```tsx
import { isRentalProperty, isSaleProperty } from '@/types'

{isRentalProperty(property) && (
  <div>Monthly Rent: {formatPrice(property.price)}</div>
)}

{isSaleProperty(property) && (
  <div>Purchase Price: {formatSalePrice(property.sale_price)}</div>
)}
```

---

## 🎉 Summary

**Core system complete!** 7 files created, 2,470+ lines of review system code already in place, and now a robust foundation for properties for sale.

**Next milestone:** Apply database migration and test with sample data, then proceed with homepage/search page updates.

All code follows the established patterns and B&W design system. Ready for production deployment after remaining integrations.
