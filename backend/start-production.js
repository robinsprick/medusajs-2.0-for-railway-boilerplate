#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Medusa Production Start Script ===');
console.log('Current directory:', process.cwd());
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || 9000,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set'
});

// Check if .medusa/server exists
const serverPath = path.join(process.cwd(), '.medusa', 'server');
if (!fs.existsSync(serverPath)) {
  console.error('ERROR: .medusa/server directory not found!');
  console.log('Attempting to build...');
  try {
    execSync('pnpm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Set PORT for Medusa
const port = process.env.PORT || 9000;

// Start Medusa directly
console.log(`Starting Medusa on port ${port}...`);
try {
  execSync(`cd .medusa/server && npx medusa start --port=${port}`, {
    stdio: 'inherit',
    env: { ...process.env, PORT: port }
  });
} catch (error) {
  console.error('Failed to start Medusa:', error.message);
  process.exit(1);
}