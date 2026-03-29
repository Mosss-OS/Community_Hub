import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import config from "./config";
import fs from "fs";
import path from "path";

const { Pool } = pg;

// Get database connection string - required environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure SSL based on environment
// In production, use proper SSL certificates
// For local development, SSL can be disabled
const isProduction = process.env.NODE_ENV === "production";

let sslConfig: boolean | pg.ClientConfig = false;

if (isProduction) {
  // In production, verify SSL certificates properly
  // Option 1: Use CA certificate file if provided
  const caCertPath = process.env.DB_SSL_CA_CERT_PATH;
  if (caCertPath && fs.existsSync(caCertPath)) {
    sslConfig = {
      ca: fs.readFileSync(caCertPath),
      rejectUnauthorized: true,
    };
  } else {
    // Option 2: Use system CA certificates (default Node.js behavior)
    // This is secure for most cloud providers (AWS RDS, GCP Cloud SQL, etc.)
    sslConfig = {
      rejectUnauthorized: true,
    };
  }
} else {
  // Development: Allow SSL with self-signed certs for cloud databases
  // but log a warning
  if (connectionString.includes("sslmode=require") || connectionString.includes("ssl=true")) {
    console.warn("WARNING: SSL certificate verification is disabled in development mode.");
    console.warn("Set DB_SSL_CA_CERT_PATH in production for secure database connections.");
    sslConfig = {
      rejectUnauthorized: false,
    };
  }
}

// Configure connection pool with security best practices
export const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: parseInt(process.env.DB_POOL_MAX || "20", 10), // Maximum pool size
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "10000", 10), // Timeout for new connections
  allowExitOnIdle: true, // Allow pool to close when all clients are idle
});

// Validate database connection on startup
pool.on("connect", (client) => {
  // Set session timezone to UTC for consistency
  client.query("SET timezone = 'UTC'");
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
  // Don't crash the process, but log the error
});

export const db = drizzle(pool, { schema });
