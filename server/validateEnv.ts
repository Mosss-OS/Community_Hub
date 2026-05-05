interface EnvConfig {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  NODE_ENV?: string;
  KAFKA_BROKERS?: string;
  SUPER_ADMIN_EMAIL?: string;
  SUPER_ADMIN_PASSWORD?: string;
}

function validateEnv(): EnvConfig {
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Validate SESSION_SECRET length
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.length < 32) {
    console.warn('WARNING: SESSION_SECRET should be at least 32 characters long');
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    NODE_ENV: process.env.NODE_ENV,
    KAFKA_BROKERS: process.env.KAFKA_BROKERS,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
  };
}

export default validateEnv;
