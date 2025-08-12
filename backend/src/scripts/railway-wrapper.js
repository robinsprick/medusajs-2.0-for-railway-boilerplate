const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 9000;
let medusaReady = false;

console.log('=== Railway Medusa Wrapper ===');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT
});

// Create a simple health check server
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    console.log(`[Health Check] ${new Date().toISOString()} - Medusa ready: ${medusaReady}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: medusaReady ? 'ready' : 'starting',
      timestamp: new Date().toISOString(),
      port: PORT,
      uptime: process.uptime()
    }));
  } else {
    // Forward to Medusa if ready
    if (medusaReady) {
      res.writeHead(302, { 'Location': `http://localhost:${PORT}${req.url}` });
      res.end();
    } else {
      res.writeHead(503);
      res.end('Service starting...');
    }
  }
});

// Start health check server immediately
healthServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Health check server listening on port ${PORT}`);
  
  // Now start Medusa in the background
  startMedusa();
});

function startMedusa() {
  console.log('Starting Medusa server...');
  
  // Change to server directory
  const serverPath = path.join('/app', '.medusa', 'server');
  
  const medusa = spawn('npx', ['medusa', 'start', `--port=${parseInt(PORT) + 1}`], {
    cwd: serverPath,
    stdio: 'inherit',
    env: { ...process.env, PORT: parseInt(PORT) + 1 }
  });

  // Wait a bit then mark as ready
  setTimeout(() => {
    medusaReady = true;
    console.log('Medusa marked as ready');
    
    // After Medusa is ready, close health server and let Medusa take over
    setTimeout(() => {
      console.log('Switching to Medusa...');
      healthServer.close(() => {
        // Restart Medusa on the correct port
        const medusaMain = spawn('npx', ['medusa', 'start', `--port=${PORT}`], {
          cwd: serverPath,
          stdio: 'inherit',
          env: { ...process.env, PORT: PORT }
        });
        
        medusaMain.on('exit', (code) => {
          process.exit(code);
        });
      });
    }, 5000);
  }, 30000); // Wait 30 seconds for Medusa to start

  medusa.on('error', (error) => {
    console.error('Failed to start Medusa:', error);
    process.exit(1);
  });
}