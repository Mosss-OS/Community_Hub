interface EnvConfig {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  JWT_SECRET?: string;
  NODE_ENV?: string;
  APP_URL?: string;
  KAFKA_BROKERS?: string;
  SUPER_ADMIN_EMAIL?: string;
  SUPER_ADMIN_PASSWORD?: string;
  CLIENT_API_URL?: string;
  ENABLE_NOTIFICATIONS?: string;
  ENABLE_WEBSOCKETS?: string;
  ENABLE_ANALYTICS?: string;
}

function validateEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET'];
  if (nodeEnv === "production" || nodeEnv === "staging") {
    requiredVars.push("JWT_SECRET", "APP_URL");
  }
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

  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try {
      new URL(appUrl);
    } catch {
      throw new Error("APP_URL must be a valid URL");
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: nodeEnv,
    APP_URL: process.env.APP_URL,
    KAFKA_BROKERS: process.env.KAFKA_BROKERS,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    CLIENT_API_URL: process.env.CLIENT_API_URL,
    ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS,
    ENABLE_WEBSOCKETS: process.env.ENABLE_WEBSOCKETS,
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
  };
}

export default validateEnv;
