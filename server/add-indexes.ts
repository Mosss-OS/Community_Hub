import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const runIndexes = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const sql = postgres(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('Adding database indexes...');

  try {
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_organization_id ON events(organization_id);
      CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date);
      CREATE INDEX IF NOT EXISTS idx_sermons_organization_id ON sermons(organization_id);
      CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
      CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);
    `;
    console.log('Indexes added successfully');
  } catch (error) {
    console.error('Failed to add indexes:', error);
    process.exit(1);
  }

  await sql.end();
  process.exit(0);
};

runIndexes();
