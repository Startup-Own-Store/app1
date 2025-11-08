require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add timeout middleware
app.use((req, res, next) => {
  // Set timeout to 30 seconds
  req.setTimeout(30000, () => {
    console.error('❌ Request timeout');
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  });
  
  res.setTimeout(30000, () => {
    console.error('❌ Response timeout');
    if (!res.headersSent) {
      res.status(408).json({ error: 'Response timeout' });
    }
  });
  
  next();
});

// Add logging middleware to see all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Log environment status on startup
console.log('🚀 Starting Express server...');
console.log('📊 Environment check:');
console.log('  - SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing');
console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ Missing');
console.log('  - PORT:', PORT);

// Health check endpoint (GET request - works in browser)
app.get('/health', (req, res) => {
  console.log('✅ Health check accessed');
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: process.env.SUPABASE_URL ? 'configured' : 'missing',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
    }
  });
});

// Root endpoint (GET request - works in browser)
app.get('/', (req, res) => {
  console.log('✅ Root endpoint accessed');
  res.status(200).json({ 
    message: 'OwnStore API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/', description: 'API info' },
      { method: 'POST', path: '/app/api/create-order', description: 'Create order' },
      { method: 'POST', path: '/app/api/sync-firebase-user', description: 'Sync Firebase user to Supabase' },
      { method: 'POST', path: '/app/api/register-guest-user', description: 'Create or validate guest Supabase user' }
    ]
  });
});

// Show info page when someone tries to GET the sync endpoint
app.get('/app/api/sync-firebase-user', (req, res) => {
  res.status(200).json({
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    usage: {
      method: 'POST',
      url: '/app/api/sync-firebase-user',
      body: {
        idToken: 'Firebase ID token (string)',
        metadata: {
          displayName: 'string',
          email: 'string',
          phoneNumber: 'string',
          photoURL: 'string',
          providers: ['array']
        }
      }
    }
  });
});

// Lazy load the route handlers to avoid module loading errors
app.post('/app/api/create-order', (req, res) => {
  console.log('📦 Create order request received');
  try {
    const createOrder = require('./app/api/create-order');
    createOrder(req, res);
  } catch (error) {
    console.error('❌ Error loading create-order module:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/app/api/sync-firebase-user', async (req, res) => {
  console.log('🔥 Sync Firebase user request received');
  console.log('📨 Request body keys:', Object.keys(req.body || {}));
  console.log('📨 Request headers:', req.headers);
  
  try {
    const syncFirebaseUser = require('./app/api/sync-firebase-user');
    await syncFirebaseUser(req, res);
  } catch (error) {
    console.error('❌ Error in sync-firebase-user handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.get('/app/api/register-guest-user', (req, res) => {
  res.status(200).json({
    error: 'Method not allowed',
    message: 'Use POST /app/api/register-guest-user to create or validate a guest user',
  });
});

app.post('/app/api/register-guest-user', async (req, res) => {
  console.log('🧾 Guest user registration request received');
  try {
    const registerGuestUser = require('./app/api/register-guest-user');
    await registerGuestUser(req, res);
  } catch (error) {
    console.error('❌ Error in register-guest-user handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// 404 handler - must be last
app.use((req, res) => {
  console.log(`❌ 404 - Not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /app/api/create-order',
      'POST /app/api/sync-firebase-user'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n Backend server running successfully!');
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Network URL: http://0.0.0.0:${PORT} (accessible from emulator via 10.0.2.2:${PORT})`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API info: http://localhost:${PORT}/`);
  console.log(`Sync endpoint: POST http://localhost:${PORT}/app/api/sync-firebase-user`);
  console.log('\n Waiting for requests...\n');
});

server.on('error', (err) => {
  console.error('Server startup error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    console.error('Kill the process or use a different port.');
    process.exit(1);
  }
});