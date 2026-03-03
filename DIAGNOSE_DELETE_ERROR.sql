-- DIAGNOSTIC: Check what's causing the delete error
-- Run this in Supabase SQL Editor to see the actual state

-- 1. Check the actual function definition in the database
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'refresh_property_ratings';

-- 2. Check all triggers on the reviews table
SELECT 
  tgname as trigger_name,
  tgtype,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'reviews'::regclass;

-- 3. Check for any active connections that might have cached plans
SELECT 
  pid,
  usename,
  application_name,
  state,
  query_start,
  LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND state = 'active'
ORDER BY query_start DESC;

-- 4. Check if materialized view has the required unique index
SELECT 
  schemaname,
  matviewname,
  ispopulated
FROM pg_matviews
WHERE matviewname = 'property_ratings';

SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'property_ratings';
