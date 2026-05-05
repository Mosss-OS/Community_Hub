import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectKafka } from "./services/kafka";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

// Force production if not explicitly development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS - allow specific origins with credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://wccrm-lagos.vercel.app',
    'https://wccrm-lagos.vercel.app/',
    'https://wccrm.onrender.com',
    'https://wccrm.onrender.com/',
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // For requests without Origin (like curl), allow without credentials
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    // Allow the origin anyway for production
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: []
    }
  },
  // Only enable HSTS in production
  hsts: {
    maxAge: process.env.NODE_ENV === 'production' ? 31536000 : 0,
    includeSubDomains: process.env.NODE_ENV === 'production',
    preload: process.env.NODE_ENV === 'production'
  }
}));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Only log API errors (4xx/5xx) to keep terminal clean
    if (path.startsWith("/api") && res.statusCode >= 400) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    await registerRoutes(httpServer, app);
    console.log('Routes registered successfully');
  } catch (err) {
    console.error('Failed to register routes:', err);
  }

  // Setup Swagger API docs (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('API docs available at /api-docs');
  }

  // Setup WebSocket
  const { setupWebSocket } = await import('./websocket');
  setupWebSocket(httpServer);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "true" || process.env.RENDER === "true";
  
  if (isProduction) {
    serveStatic(app);
  } else {
    // Only load vite in local development
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Connect to Kafka if configured
  if (process.env.KAFKA_BROKERS) {
    await connectKafka();
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
