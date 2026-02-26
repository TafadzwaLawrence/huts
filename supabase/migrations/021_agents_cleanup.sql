-- Cleanup script for agent system tables
-- Run this BEFORE running 021_agents_system.sql if you get "relation already exists" errors

-- Drop all agent-related tables and dependencies
DROP TABLE IF EXISTS agent_advertisements CASCADE;
DROP TABLE IF EXISTS agent_achievements CASCADE;
DROP TABLE IF EXISTS agent_inquiries CASCADE;
DROP TABLE IF EXISTS agent_service_areas CASCADE;
DROP TABLE IF EXISTS agent_reviews CASCADE;
DROP TABLE IF EXISTS agent_profiles CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_agent_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS trigger_update_agent_stats() CASCADE;
DROP FUNCTION IF EXISTS generate_agent_slug(TEXT, UUID) CASCADE;

-- Confirm cleanup
SELECT 'Agent tables cleaned up successfully' as status;
