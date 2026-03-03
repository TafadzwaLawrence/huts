-- DIAGNOSTIC: Show exactly what's in the database
-- Run this BEFORE running SUPER_NUCLEAR_FIX.sql

-- 1. Show ALL functions named refresh_property_ratings in ALL schemas
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  p.oid,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'refresh_property_ratings'
ORDER BY n.nspname;

-- 2. Show all triggers on reviews table
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  n.nspname as function_schema,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE t.tgrelid = 'reviews'::regclass
AND t.tgname NOT LIKE 'pg_%'
ORDER BY t.tgname;

-- 3. Check if there are any deferred or constraint triggers
SELECT 
  tgname,
  tgtype,
  tgenabled,
  tgdeferrable,
  tginitdeferred
FROM pg_trigger
WHERE tgrelid = 'reviews'::regclass
AND tgname LIKE '%refresh%';
