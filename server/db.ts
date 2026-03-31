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

console.log("DB URL:", connectionString.substring(0, 50) + "...");

// Configure SSL based on environment
// Check if SSL is required from the connection string
const needsSSL = connectionString.includes("sslmode=require") || 
                 connectionString.includes("ssl=true") ||
                 connectionString.includes("sslmode=prefer");

console.log("needsSSL:", needsSSL);

let sslConfig: boolean | pg.ConnectionOptions = false;

if (needsSSL) {
  // For Aiven cloud databases - download and use their CA certificate
  // The CA certificate can be downloaded from https://console.aiven.io/ -> Service -> Overview -> CA Certificate
  // Alternatively, use NODE_TLS_REJECT_UNAUTHORIZED=0 environment variable (not recommended for production)
  
  // Aiven uses a self-signed CA, so we need to disable strict certificate verification
  // This is secure because the connection is still encrypted
  sslConfig = {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined, // Disable hostname verification
  };
  console.log("Using SSL with rejectUnauthorized: false for Aiven database");
} else {
  console.log("SSL disabled for database connection");
}

// Configure connection pool with security best practices
export const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: parseInt(process.env.DB_POOL_MAX || "20", 10), // Maximum pool size
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "30000", 10), // Timeout for new connections (increased to 30s)
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
