require("dotenv").config();

console.log("MONGO_URI:", process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// ─── Global Error Handlers ────────────────────────────────────────────────────
// Catches synchronous exceptions that were never caught anywhere in the code.
// Without this, Node exits silently with no useful information.
process.on('uncaughtException', (err) => {
  console.error(`\n❌ [${new Date().toISOString()}] UNCAUGHT EXCEPTION — server will shut down`);
  console.error(`   Name   : ${err.name}`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack  :\n${err.stack}\n`);
  // Give in-flight I/O a moment to settle before forcing exit
  process.exit(1);
});

// Catches Promise rejections that have no .catch() handler.
// In Node ≥ 15 an unhandled rejection already crashes the process,
// but this gives you a structured, timestamped log before it does.
process.on('unhandledRejection', (reason, promise) => {
  console.error(`\n⚠️  [${new Date().toISOString()}] UNHANDLED PROMISE REJECTION`);
  console.error('   Promise:', promise);
  console.error('   Reason :', reason instanceof Error ? reason.stack : reason);
  console.error('   Hint   : Add a .catch() or try/catch around the rejected promise.\n');
  // Let the uncaughtException handler above take over (Node re-throws internally)
  process.exit(1);
});
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HealthSync API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HealthSync API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/signup, /api/auth/login, /api/auth/profile',
      reports: '/api/reports (GET), /api/reports/upload (POST), /api/reports/:id (GET, DELETE)',
      ai: '/api/ai/analyze (POST), /api/ai/insights/:reportId (GET), /api/ai/predict (POST)',
      emergency: '/api/emergency/:userId (GET - public), /api/emergency/:userId/qr (GET - public)',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_ATTEMPTS = 10;

/**
 * Check if a given port is available.
 * Resolves true if free, false if in use.
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const tester = net.createServer()
      .once('error', () => resolve(false))   // EADDRINUSE → not free
      .once('listening', () => {
        tester.close(() => resolve(true));    // Closed cleanly → free
      })
      .listen(port);
  });
}

/**
 * Find the first free port starting from `startPort`.
 * Logs a clear message for every port that is already occupied.
 */
async function findFreePort(startPort) {
  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
    const port = startPort + attempt;
    const free = await isPortFree(port);
    if (free) return port;
    const nextPort = startPort + attempt + 1;
    console.warn(`⚠️  Port ${port} in use, switching to ${nextPort}`);
  }
  throw new Error(
    `No free port found in range ${startPort}–${startPort + MAX_PORT_ATTEMPTS - 1}. ` +
    'Please free a port or set a different PORT in your .env file.'
  );
}

/**
 * Start the Express server on the first available port.
 */
async function startServer() {
  try {
    const PORT = await findFreePort(BASE_PORT);

    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════╗
║  HealthSync Backend Server         ║
║  Port: ${PORT}                         ║
║  Environment: ${process.env.NODE_ENV || 'development'}        ║
║  Status: Running ✓                 ║
╚════════════════════════════════════╝
      `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    // Prevent unhandled server-level errors from crashing the process
    server.on('error', (err) => {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    });

    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
