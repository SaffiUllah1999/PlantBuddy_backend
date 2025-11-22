const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// ============================================================================
// PLANTBUDDY BACKEND API
// ============================================================================
// Production-ready Express server for PlantBuddy application
// Supports deployment on alwaysdata.com and other Node.js hosting platforms
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================================================
// CONFIGURATION & ENVIRONMENT VALIDATION
// ============================================================================

// Validate required environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://saffiullah1911:saffi@cluster0.ub6u6j5.mongodb.net/";
const DB_NAME = process.env.DB_NAME || "PlantBuddy";

// Log startup configuration (without sensitive data)
console.log("=".repeat(60));
console.log("PlantBuddy Backend API - Starting...");
console.log("=".repeat(60));
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`Database: ${DB_NAME}`);
console.log(`MongoDB URI: ${MONGODB_URI ? "✓ Configured" : "✗ Missing"}`);
console.log("=".repeat(60));

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS configuration - adjust origins for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Multer configuration for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

let dbo = null;
let mongoClient = null;
let dbConnectionStatus = {
  connected: false,
  lastAttempt: null,
  error: null
};

/**
 * Initialize MongoDB connection
 * @returns {Promise<Db>} MongoDB database instance
 */
async function initDb() {
  if (dbo && dbConnectionStatus.connected) {
    return dbo;
  }

  mongoClient = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    dbConnectionStatus.lastAttempt = new Date().toISOString();
    await mongoClient.connect();

    // Verify connection
    await mongoClient.db("admin").command({ ping: 1 });

    dbo = mongoClient.db(DB_NAME);
    dbConnectionStatus.connected = true;
    dbConnectionStatus.error = null;

    console.log(`✓ MongoDB connected successfully to database: ${DB_NAME}`);
    return dbo;
  } catch (err) {
    dbConnectionStatus.connected = false;
    dbConnectionStatus.error = err.message;
    console.error("✗ MongoDB connection failed:", err.message);
    throw err;
  }
}

/**
 * Check database connection health
 * @returns {Promise<Object>} Connection status
 */
async function checkDbHealth() {
  try {
    if (!dbo) {
      return { status: "disconnected", message: "Database not initialized" };
    }

    await mongoClient.db("admin").command({ ping: 1 });
    return { status: "healthy", message: "Database connection active" };
  } catch (err) {
    return { status: "unhealthy", message: err.message };
  }
}

// ============================================================================
// HEALTH CHECK & STATUS ENDPOINTS
// ============================================================================

/**
 * Root endpoint - Simple health check
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PlantBuddy API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

/**
 * Comprehensive health check endpoint
 */
app.get("/health", async (req, res) => {
  const startTime = Date.now();

  // Check database health
  const dbHealth = await checkDbHealth();

  // Calculate uptime
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

  // Memory usage
  const memUsage = process.memoryUsage();
  const memoryInfo = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };

  const responseTime = Date.now() - startTime;

  const healthStatus = {
    success: true,
    status: dbHealth.status === "healthy" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    service: {
      name: "PlantBuddy Backend API",
      version: "1.0.0",
      environment: NODE_ENV,
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptime)
    },
    database: {
      status: dbHealth.status,
      message: dbHealth.message,
      name: DB_NAME,
      connected: dbConnectionStatus.connected,
      lastAttempt: dbConnectionStatus.lastAttempt
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: memoryInfo,
      pid: process.pid
    },
    performance: {
      responseTime: `${responseTime}ms`
    }
  };

  const statusCode = dbHealth.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

/**
 * API status endpoint - Quick check
 */
app.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    online: true,
    database: dbConnectionStatus.connected,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Get all users
 */
app.get("/getUsers", async (req, res) => {
  try {
    if (!dbo) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }

    const users = await dbo.collection("Users").find({}).toArray();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve users",
      message: NODE_ENV === "development" ? err.message : undefined
    });
  }
});

/**
 * Get leaderboard users (sorted by score)
 */
app.get("/getLeaderBoardUsers", async (req, res) => {
  try {
    if (!dbo) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }

    const users = await dbo
      .collection("Users")
      .find({})
      .sort({ Score: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error("Error retrieving leaderboard users:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve leaderboard",
      message: NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 handler - Route not found
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : "An unexpected error occurred",
    stack: NODE_ENV === "development" ? err.stack : undefined
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log("✓ MongoDB connection closed");
    }

    console.log("✓ Graceful shutdown completed");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the server (only when run directly, not when imported)
 */
if (require.main === module) {
  (async () => {
    try {
      // Initialize database connection
      await initDb();

      // Start Express server
      app.listen(PORT, () => {
        console.log("=".repeat(60));
        console.log(`✓ Server is running on port ${PORT}`);
        console.log(`✓ Environment: ${NODE_ENV}`);
        console.log(`✓ Health check: http://localhost:${PORT}/health`);
        console.log(`✓ API Status: http://localhost:${PORT}/status`);
        console.log("=".repeat(60));
      });
    } catch (err) {
      console.error("✗ Failed to start server:", err);
      process.exit(1);
    }
  })();
}

// ============================================================================
// EXPORT FOR SERVERLESS PLATFORMS (Vercel, etc.)
// ============================================================================

module.exports = app;
