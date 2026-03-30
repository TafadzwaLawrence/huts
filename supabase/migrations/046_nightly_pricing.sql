-- Migration 046: Add nightly pricing support
-- Adds nightly_price column to allow properties to specify distinct pricing for nightly rentals

-- Add nightly_price column to properties table (in cents like the monthly price)
ALTER TABLE properties
ADD COLUMN nightly_price INTEGER;

-- Add check constraint to ensure nightly_price is positive when set
ALTER TABLE properties
ADD CONSTRAINT check_nightly_price
CHECK (nightly_price IS NULL OR nightly_price > 0);

-- Add constraint to ensure nightly properties have nightly_price and monthly properties can optionally have it
-- For rental properties with nightly period, nightly_price must be set
-- For rental properties with monthly period, price must be set
ALTER TABLE properties
ADD CONSTRAINT check_price_by_rental_period
CHECK (
  (listing_type != 'rent') OR
  (rental_period = 'monthly' AND price > 0) OR
  (rental_period = 'nightly' AND nightly_price > 0)
);

-- Add index on nightly_price for filtering
CREATE INDEX idx_properties_nightly_price ON properties(nightly_price) WHERE rental_period = 'nightly';

-- Comment for documentation
COMMENT ON COLUMN properties.nightly_price IS
'Nightly rental price in cents. Used when rental_period = ''nightly''. For rental properties, either price (monthly) or nightly_price is required depending on rental_period.';
