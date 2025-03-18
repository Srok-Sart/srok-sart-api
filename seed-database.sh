#!/bin/bash

# Load environment variables if present, otherwise use defaults
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  # Default database connection parameters
  DB_HOST=${DB_HOST:-localhost}
  DB_PORT=${DB_PORT:-5432}
  DB_USERNAME=${DB_USERNAME:-postgres}
  DB_PASSWORD=${DB_PASSWORD:-admin}
  DB_NAME=${DB_NAME:-srok_sart}
fi

# Set connection timeout
export PGCONNECT_TIMEOUT=10

# Create database if it doesn't exist
echo "Checking if database exists..."
PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -c "CREATE DATABASE $DB_NAME"
echo "Database check completed"

# Check if tables exist before running migrations
TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")

if [ "$TABLE_COUNT" -eq "0" ]; then
  # Run migrations only if no tables exist
  echo "Running database migrations..."
  yarn --ignore-engines migration:run || { echo "Migration failed"; exit 1; }
else
  echo "Database already has tables, skipping migrations"
fi

# Try to load fixtures sequentially to isolate issues
echo "Loading fixtures..."
NODE_OPTIONS="--no-deprecation" yarn fixtures || { echo "Fixture loading failed"; exit 1; }

echo "Database seeding completed!"