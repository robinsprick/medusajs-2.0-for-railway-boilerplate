#!/bin/bash

echo "Starting Medusa application on Railway..."

# Set defaults if not provided
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-9000}

# Debug environment
echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

# Create .medusa/server directory if needed
if [ ! -d ".medusa/server" ]; then
  echo "Building Medusa..."
  npm run build
fi

# Change to the .medusa/server directory
cd .medusa/server

# Run migrations
echo "Running migrations..."
npx medusa db:migrate || echo "Migration might have already run"

# Start the server
echo "Starting Medusa server on port $PORT..."
exec npx medusa start --port=$PORT