const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Medusa application on Railway...');

// Set defaults if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 9000;

console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set'
});

// Change to the .medusa/server directory
const serverPath = path.join(process.cwd(), '.medusa', 'server');
process.chdir(serverPath);
console.log('Changed directory to:', serverPath);

// Start the Medusa server
console.log(`Starting Medusa server on port ${PORT}...`);
const medusa = spawn('npx', ['medusa', 'start', `--port=${PORT}`], {
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT }
});

medusa.on('error', (error) => {
  console.error('Failed to start Medusa:', error);
  process.exit(1);
});

medusa.on('exit', (code) => {
  console.log(`Medusa process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  medusa.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  medusa.kill('SIGTERM');
});