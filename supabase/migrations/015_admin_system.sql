-- Migration: Add is_admin flag to profiles and create admin_activity_logs table
-- This migration adds admin permission tracking and activity logging

-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Create admin_activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'property_approved',
    'property_rejected',
    'property_edited',
    'property_deleted',
    'user_edited',
    'user_suspended',
    'user_unsuspended',
    'user_deleted',
    'bulk_approve',
    'bulk_reject',
    'bulk_delete',
    'review_deleted',
    'other'
  )),
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'property',
    'user',
    'review',
    'message',
    'other'
  )),
  resource_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_resource ON admin_activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- Add comment to document the table
COMMENT ON TABLE admin_activity_logs IS 'Audit trail of all admin actions for security and compliance';

-- Enable Row Level Security (RLS) on admin_activity_logs
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view activity logs
CREATE POLICY admin_activity_logs_select_policy ON admin_activity_logs
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Policy: Only admins can insert activity logs (via service role in practice)
CREATE POLICY admin_activity_logs_insert_policy ON admin_activity_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Grant necessary permissions
GRANT SELECT ON admin_activity_logs TO authenticated;
GRANT INSERT ON admin_activity_logs TO authenticated;
