const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables from the repo root so deployments and local dev share config.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const registerGuestUser = require('../app/api/register-guest-user');
const submitHireRequest = require('../app/api/submit-hire-request');
const syncFirebaseUser = require('../app/api/sync-firebase-user');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.post('/app/api/register-guest-user', asyncHandler(registerGuestUser));
app.post('/app/api/submit-hire-request', asyncHandler(submitHireRequest));
app.post('/app/api/sync-firebase-user', asyncHandler(syncFirebaseUser));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.use((error, req, res, _next) => {
  console.error('⚠️  Unhandled backend error:', error);
  res.status(500).json({ error: 'Internal server error', details: error?.message });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
