-- ============================================================================
-- MIGRATION 043: Fix agents.user_id FK to reference public.profiles instead
--                of auth.users
--
-- Problem: agents.user_id was referencing auth.users(id) which is in the
-- auth schema. PostgREST only introspects the public schema for FK
-- relationships, so it could not auto-resolve the nested
-- listing_agent:agent_id(id, slug, profiles(full_name, avatar_url)) join.
-- This caused a PGRST200 error on every property page query, returning 404
-- for ALL properties.
--
-- Fix: Re-point the FK to public.profiles(id) which holds the same UUIDs.
-- PostgREST can now traverse agents → profiles for nested embedding.
--
-- Safe to run: profiles are auto-created for every auth user via the
-- handle_new_user trigger, so every agent.user_id has a matching profiles row.
-- ============================================================================

-- Drop old FK that pointed to auth.users (PostgREST can't see auth schema)
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS agents_user_id_fkey;

-- Add new FK pointing to public.profiles (PostgREST can see this)
ALTER TABLE agents
  ADD CONSTRAINT agents_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
