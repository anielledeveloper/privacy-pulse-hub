#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment with full PostgreSQL permissions

set -e

echo "🚀 Setting up development environment..."

# Check if we're in the right directory
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create development directories
echo "📁 Creating development directories..."
mkdir -p postgres-init-dev

# Set development environment
export NODE_ENV=development
export COMPOSE_PROJECT_NAME=guidelines-dev

echo "🐳 Starting development containers..."

# Check for existing containers and remove them if they exist
echo "🔍 Checking for existing containers..."
if docker ps -a --format "table {{.Names}}" | grep -q "usage-postgres-dev\|usage-api-dev"; then
    echo "⚠️  Found existing containers. Removing them..."
    docker rm -f usage-postgres-dev usage-api-dev 2>/dev/null || true
fi

# Use development docker-compose file
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "🔧 Ensuring PostgreSQL permissions are properly set..."
# Run the permissions fix script
./scripts/fix-dev-permissions.sh

echo "✅ Development environment setup complete!"
echo ""
echo "📊 To check the status:"
echo "   docker-compose -f docker-compose.dev.yml ps"
echo ""
echo "📋 To view container logs:"
echo "   docker-compose -f docker-compose.dev.yml up    # Stop detached mode and see all logs in real-time"
echo "   docker logs -f usage-postgres-dev              # PostgreSQL logs only (real-time)"
echo "   docker logs -f usage-api-dev                   # API logs only (real-time)"
echo "   docker-compose -f docker-compose.dev.yml logs -f --tail=0  # New logs only (real-time)"
echo ""
echo "🔧 Troubleshooting:"
echo "   If containers won't start: docker-compose -f docker-compose.dev.yml logs"
echo "   If permissions issues: ./scripts/fix-dev-permissions.sh"
echo "   If port conflicts: sudo lsof -i :5433 && sudo lsof -i :3000"
echo ""
echo "🗄️  To connect to PostgreSQL:"
echo "   docker exec -it usage-postgres-dev psql -U postgres -d usage_db"
echo ""
echo "🔄 To restart:"
echo "   docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🛑 To stop:"
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
echo "📝 Note: Full PostgreSQL permissions are automatically set via init script"
