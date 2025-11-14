#!/bin/bash

echo "Stopping application if running..."
# Kill any running mvnw process
pkill -f mvnw || true
sleep 2

echo "Terminating database connections..."
docker exec postgres psql -U uptimeo -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'uptimeo' AND pid <> pg_backend_pid();"

echo "Cleaning database..."
docker exec postgres psql -U uptimeo -d postgres -c "DROP DATABASE IF EXISTS uptimeo;"
docker exec postgres psql -U uptimeo -d postgres -c "CREATE DATABASE uptimeo;"

echo "Database reset complete. You can now start the application with: ./mvnw"
