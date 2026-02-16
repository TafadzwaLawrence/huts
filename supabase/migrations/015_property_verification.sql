-- Migration: Property Verification System
-- Adds admin verification workflow for new property listings

-- Add verification_status column to properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'approved', 'rejected'));

-- Add verification metadata
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS verification_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for filtering by verification status (frequently queried)
CREATE INDEX IF NOT EXISTS idx_properties_verification_status 
ON properties(verification_status);

-- Update existing properties to 'approved' (they were already live)
UPDATE properties SET verification_status = 'approved' WHERE verification_status = 'pending';

-- Create a view that only shows approved + active properties (used by public queries)
CREATE OR REPLACE VIEW public_properties AS
SELECT * FROM properties 
WHERE status = 'active' AND verification_status = 'approved';
