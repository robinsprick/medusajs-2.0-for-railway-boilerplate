#!/bin/bash

echo "=== Medusa Start Script for Railway ==="
echo "NODE_ENV: ${NODE_ENV}"
echo "PORT: ${PORT:-9000}"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo "Yes" || echo "No")"

# Change to the built server directory
cd /app/.medusa/server

# Start Medusa
echo "Starting Medusa server on port ${PORT:-9000}..."
exec npx medusa start --port=${PORT:-9000}