#!/bin/bash

# Fix Development PostgreSQL Permissions
# This script can be run manually if permissions need to be fixed

echo "🔧 Fixing PostgreSQL development permissions..."

# Check if containers are running
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "usage-postgres-dev.*Up"; then
    echo "❌ PostgreSQL container is not running. Please start it first:"
    echo "   docker-compose -f docker-compose.dev.yml up -d postgres"
    exit 1
fi

echo "📋 Applying permissions to PostgreSQL..."

# Apply the permissions script
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d usage_db -c "
-- Grant ALL privileges to postgres user for development
GRANT ALL PRIVILEGES ON DATABASE usage_db TO postgres;
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
"

if [ $? -eq 0 ]; then
    echo "✅ Permissions fixed successfully!"
    echo "🔍 Verifying permissions..."
    
    # Verify permissions
    docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d usage_db -c "\dp" | head -10
    
    echo ""
    echo "🎉 PostgreSQL development permissions are now properly configured!"
    echo "   You should now be able to delete rows in pgAdmin and other tools."
else
    echo "❌ Failed to fix permissions. Please check the error messages above."
    exit 1
fi
