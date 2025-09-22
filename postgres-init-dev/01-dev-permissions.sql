-- Development Environment - Full PostgreSQL Permissions
-- WARNING: This script is for DEVELOPMENT ENVIRONMENT ONLY
-- DO NOT use in production!

-- This script runs during PostgreSQL initialization
-- It ensures the postgres user has full permissions for development

-- Grant ALL privileges to postgres user for development
GRANT ALL PRIVILEGES ON DATABASE usage_db TO postgres;

-- Connect to the usage_db database
\c usage_db;

-- Grant ALL privileges on schema and existing objects
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Set default privileges for future tables (full access)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON FUNCTIONS TO postgres;

-- Make postgres user the owner of the public schema
ALTER SCHEMA public OWNER TO postgres;

-- Grant schema creation and usage privileges for development
GRANT CREATE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;

-- Ensure postgres user can create databases (for development)
ALTER USER postgres CREATEDB;

-- Log completion
\echo 'Development permissions script completed successfully'
