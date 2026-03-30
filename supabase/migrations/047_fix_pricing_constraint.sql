-- Migration 047: Fix pricing constraint
-- Fixes the overly strict constraint from migration 046 that was preventing sale properties from being created
-- The issue: the old constraint required price > 0 for sale properties, which was incorrect

-- First, drop the bad constraint
ALTER TABLE properties
DROP CONSTRAINT chk_pricing_by_listing_type;

-- Add the corrected constraint that properly handles all three cases:
-- 1. Sale listings (no price requirement, sale_price is used instead)
-- 2. Monthly rentals (price must be set and > 0)
-- 3. Nightly rentals (nightly_price must be set and > 0)
ALTER TABLE properties
ADD CONSTRAINT chk_pricing_by_listing_type
CHECK (
  (listing_type = 'sale') OR
  (listing_type = 'rent' AND rental_period = 'monthly' AND price > 0) OR
  (listing_type = 'rent' AND rental_period = 'nightly' AND nightly_price > 0)
);
