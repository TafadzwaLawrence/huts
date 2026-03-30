-- Migration 045: Add nightly rental support
-- Adds rental_period enum to allow landlords to offer nightly rentals in addition to monthly
-- 
-- Changes:
-- 1. Add rental_period enum type with values: 'monthly' | 'nightly'
-- 2. Add rental_period column to properties table (defaults to 'monthly' for backward compatibility)
-- 3. Add index on rental_period for optimal query performance
-- 4. Add check constraint to ensure only rental properties can have non-null rental_period values

-- Create enum type for rental periods
CREATE TYPE rental_period_enum AS ENUM ('monthly', 'nightly');

-- Add rental_period column to properties table with default 'monthly'
-- Only rental properties (listing_type = 'rent') should have this set
ALTER TABLE properties
ADD COLUMN rental_period rental_period_enum DEFAULT 'monthly'::rental_period_enum;

-- Add index for efficient querying of properties by rental period
CREATE INDEX idx_properties_rental_period ON properties(rental_period) WHERE listing_type = 'rent';

-- Add composite index for filtering by listing type and rental period (common query pattern)
CREATE INDEX idx_properties_listing_rental ON properties(listing_type, rental_period) WHERE listing_type = 'rent';

-- Add check constraint to ensure rental_period data integrity
-- Note: PostgreSQL allows NULL values, which is fine for sale properties
-- For rent properties, rental_period will always be set (defaults to 'monthly')
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
