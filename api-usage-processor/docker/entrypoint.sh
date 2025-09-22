#!/usr/bin/env sh
set -e

echo "=== Starting API Container ==="

# Wait for Postgres to be ready
echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Postgres not ready yet, waiting..."
  sleep 1
done
echo "Postgres is ready!"

# Always install dependencies to ensure they're up to date
echo "Installing dependencies..."
echo "y" | pnpm install --frozen-lockfile=false
echo "Dependencies installed successfully"

# Run migrations
echo "Running database migrations..."
npx sequelize-cli db:migrate
echo "Migrations completed successfully"

# Run seeders
echo "Running database seeders..."
npx sequelize-cli db:seed:all
echo "Seeders completed successfully"

# Start the application
echo "Starting NestJS application..."
exec pnpm start
