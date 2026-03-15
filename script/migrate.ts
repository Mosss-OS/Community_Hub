import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString.replace('sslmode=require', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool, { schema });

async function migrate() {
  console.log("Running migrations...");
  
  try {
    // Add organization_id to events table if it doesn't exist
    await pool.query(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to events");
    
    // Add organization_id to sermons table
    await pool.query(`
      ALTER TABLE sermons ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to sermons");
    
    // Add organization_id to prayer_requests table
    await pool.query(`
      ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to prayer_requests");
    
    // Add organization_id to groups table
    await pool.query(`
      ALTER TABLE groups ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to groups");
    
    // Add organization_id to fundraising_campaigns table
    await pool.query(`
      ALTER TABLE fundraising_campaigns ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to fundraising_campaigns");
    
    // Add organization_id to devotionals table
    await pool.query(`
      ALTER TABLE daily_devotionals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to daily_devotionals");
    
    // Add organization_id to reading_plans table
    await pool.query(`
      ALTER TABLE bible_reading_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    `);
    console.log("Added organization_id to bible_reading_plans");
    
    console.log("All migrations completed!");
  } catch (error: any) {
    if (error.code === '42701') { // column already exists
      console.log("Some columns already exist, that's OK");
    } else {
      console.error("Migration error:", error.message);
    }
  } finally {
    await pool.end();
  }
}

migrate();
