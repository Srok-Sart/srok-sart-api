#!/bin/bash

# Load environment variables or set defaults
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=srok_sart

# Install required packages
echo "Installing required packages..."
yarn add -D @faker-js/faker typeorm-fixtures-cli

# Create database if it doesn't exist
echo "Checking if database exists..."
PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -c "CREATE DATABASE $DB_NAME"
echo "Database check completed"

# Run migrations with --ignore-engines flag
echo "Running database migrations..."
yarn --ignore-engines migration:run

# Load fixtures with --ignore-engines flag and faker provider
echo "Loading fixtures..."
yarn --ignore-engines ts-node -r tsconfig-paths/register ./node_modules/typeorm-fixtures-cli/dist/cli.js load ./src/database/fixtures --dataSource=./data-source.config.ts --require=@faker-js/faker

echo "Database seeding completed!" 