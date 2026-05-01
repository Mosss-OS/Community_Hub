import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

const logger = winston.createLogger({
  level: 'debug',  // Log everything from debug level and above
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'development' 
      ? combine(colorize(), logFormat)
      : combine(json())
  ),
  transports: [new winston.transports.Console()],
});

export { logger };
