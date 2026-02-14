-- ============================================
-- PROPERTIES FOR SALE SYSTEM
-- ============================================

-- Create listing_type enum
CREATE TYPE listing_type AS ENUM ('rent', 'sale');

-- Add listing_type column (default to 'rent' for backward compatibility)
ALTER TABLE properties
ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'rent';

-- Add sale-specific pricing columns (in cents)
ALTER TABLE properties
ADD COLUMN sale_price INTEGER CHECK (sale_price IS NULL OR sale_price > 0),
ADD COLUMN property_tax_annual INTEGER CHECK (property_tax_annual IS NULL OR property_tax_annual >= 0),
ADD COLUMN hoa_fee_monthly INTEGER CHECK (hoa_fee_monthly IS NULL OR hoa_fee_monthly >= 0);

-- Add sale-specific property details
ALTER TABLE properties
ADD COLUMN year_built INTEGER CHECK (year_built IS NULL OR (year_built >= 1800 AND year_built <= 2100)),
ADD COLUMN lot_size_sqft INTEGER CHECK (lot_size_sqft IS NULL OR lot_size_sqft > 0),
ADD COLUMN parking_spaces INTEGER DEFAULT 0 CHECK (parking_spaces >= 0),
ADD COLUMN garage_spaces INTEGER DEFAULT 0 CHECK (garage_spaces >= 0),
ADD COLUMN stories INTEGER CHECK (stories IS NULL OR stories >= 1);

-- Make rental-specific fields nullable (not needed for sales)
ALTER TABLE properties 
ALTER COLUMN price DROP NOT NULL,
ALTER COLUMN available_from DROP NOT NULL,
ALTER COLUMN lease_term DROP NOT NULL;

-- Add constraint: either rent OR sale pricing must be present
ALTER TABLE properties 
ADD CONSTRAINT chk_pricing_by_listing_type CHECK (
  (listing_type = 'rent' AND price IS NOT NULL) OR
  (listing_type = 'sale' AND sale_price IS NOT NULL)
);

-- Add 'sold' status to property_status enum
ALTER TYPE property_status ADD VALUE IF NOT EXISTS 'sold';

-- Create indexes for performance
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_sale_price ON properties(sale_price) WHERE listing_type = 'sale';
CREATE INDEX idx_properties_combined_search ON properties(listing_type, status, city) WHERE status = 'active';
CREATE INDEX idx_properties_year_built ON properties(year_built) WHERE year_built IS NOT NULL;

-- Update RLS policies to work with both listing types (no changes needed - existing policies work)

-- Create view for sale property stats
CREATE OR REPLACE VIEW property_sale_stats AS
SELECT 
  city,
  COUNT(*) as total_for_sale,
  AVG(sale_price) as avg_sale_price,
  MIN(sale_price) as min_sale_price,
  MAX(sale_price) as max_sale_price,
  AVG(CASE WHEN lot_size_sqft IS NOT NULL THEN lot_size_sqft END) as avg_lot_size
FROM properties
WHERE listing_type = 'sale' AND status = 'active'
GROUP BY city;

-- Function to calculate estimated monthly payment
CREATE OR REPLACE FUNCTION calculate_monthly_payment(
  p_sale_price INTEGER,
  p_down_payment_percent NUMERIC DEFAULT 20,
  p_interest_rate NUMERIC DEFAULT 6.5,
  p_term_years INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  principal NUMERIC;
  monthly_rate NUMERIC;
  num_payments INTEGER;
  monthly_payment NUMERIC;
BEGIN
  -- Calculate principal (loan amount after down payment)
  principal := (p_sale_price / 100.0) * (1 - p_down_payment_percent / 100.0);
  
  -- Calculate monthly interest rate
  monthly_rate := p_interest_rate / 100.0 / 12.0;
  
  -- Calculate number of payments
  num_payments := p_term_years * 12;
  
  -- Calculate monthly payment using mortgage formula
  IF monthly_rate = 0 THEN
    monthly_payment := principal / num_payments;
  ELSE
    monthly_payment := principal * 
      (monthly_rate * POWER(1 + monthly_rate, num_payments)) / 
      (POWER(1 + monthly_rate, num_payments) - 1);
  END IF;
  
  -- Return as integer (cents)
  RETURN ROUND(monthly_payment * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comments for documentation
COMMENT ON COLUMN properties.listing_type IS 'Type of listing: rent (monthly rental) or sale (purchase)';
COMMENT ON COLUMN properties.sale_price IS 'Purchase price in cents (for sale listings only)';
COMMENT ON COLUMN properties.property_tax_annual IS 'Annual property tax in cents';
COMMENT ON COLUMN properties.hoa_fee_monthly IS 'Monthly HOA/condo fees in cents';
COMMENT ON COLUMN properties.year_built IS 'Year the property was built';
COMMENT ON COLUMN properties.lot_size_sqft IS 'Lot size in square feet';
COMMENT ON COLUMN properties.parking_spaces IS 'Total parking spaces (driveway, street, etc)';
COMMENT ON COLUMN properties.garage_spaces IS 'Number of garage spaces';
