-- Add lead magnet tracking columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_magnet_source VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_sequence_stage VARCHAR(50) DEFAULT 'pending';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opted_in_at TIMESTAMPTZ;

-- Create index for efficient email sequence processing
CREATE INDEX IF NOT EXISTS idx_leads_email_sequence ON leads(email_sequence_stage, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_magnet_source ON leads(lead_magnet_source);
