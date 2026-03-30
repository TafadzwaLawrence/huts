-- Migration 045: Add nightly rental support
-- Adds rental_period enum to allow landlords to offer nightly rentals in addition to monthly
-- 
-- Changes:
-- 1. Add rental_period enum type with values: 'monthly' | 'nightly'
-- 2. Add rental_period column to properties table (defaults to 'monthly' for backward compatibility)
-- 3. Update existing data to ensure consistency
-- 4. Add index on rental_period for optimal query performance
-- 5. Add check constraint to ensure only rental properties can have non-null rental_period values

-- Create enum type for rental periods
CREATE TYPE rental_period_enum AS ENUM ('monthly', 'nightly');

-- Add rental_period column to properties table with default 'monthly'
-- Only rental properties (listing_type = 'rent') should have this set
ALTER TABLE properties
ADD COLUMN rental_period rental_period_enum;

-- Update existing data before applying constraints
-- Set all rent properties to 'monthly' (preserving backward compatibility)
UPDATE properties
SET rental_period = 'monthly'::rental_period_enum
WHERE listing_type = 'rent' AND rental_period IS NULL;

-- Sale properties keep rental_period as NULL (it's not applicable)
-- They already have NULL due to the column definition above

-- Add index for efficient querying of properties by rental period
CREATE INDEX idx_properties_rental_period ON properties(rental_period) WHERE listing_type = 'rent';

-- Add composite index for filtering by listing type and rental period (common query pattern)
CREATE INDEX idx_properties_listing_rental ON properties(listing_type, rental_period) WHERE listing_type = 'rent';

-- Add check constraint to ensure rental_period data integrity
-- This constraint ensures logical consistency:
-- - Rent properties MUST have rental_period set (monthly or nightly)
-- - Sale properties MUST have rental_period as NULL
ALTER TABLE properties
ADD CONSTRAINT check_rental_period_for_rent_only
CHECK (
  (listing_type = 'rent' AND rental_period IS NOT NULL) OR
  (listing_type = 'sale' AND rental_period IS NULL)
);

-- Comment for documentation
COMMENT ON COLUMN properties.rental_period IS 
'Rental period type for rent listings. Monthly rentals charge price per month. Nightly rentals charge price per night. Only valid for listing_type = ''rent''. Defaults to ''monthly'' for backward compatibility.';


COMMENT ON TYPE rental_period_enum IS
'Enum type for property rental periods. Monthly: traditional monthly lease. Nightly: short-term nightly bookings (e.g., Airbnb-style).';
         