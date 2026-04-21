import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; // Added import for rateLimit
import morgan from 'morgan';

import prisma from './config/db';
import logger from './config/logger';
import { apiKeyAuth } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

import subscriptionRoutes from './routes/subscription.routes';
import eventRoutes from './routes/event.routes';
import deliveryRoutes from './routes/delivery.routes';
import metricsRoutes from './routes/metrics.routes';
import authRoutes from './routes/auth.routes';
import { setupSwagger } from './config/swagger';

const app = express();
setupSwagger(app as any);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // 100 requests per user per minute
  keyGenerator: (req) => {
    // Rate limit per API key (per-user) instead of globally
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return req.ip || 'unknown';
  },
  message: { status: 'error', message: 'Rate limit exceeded. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false, default: false },
});

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path !== '/health') {
    logger.info(`[DEBUG] Incoming Request: ${req.method} ${req.path} from ${req.ip}`);
    logger.info(`[DEBUG] Headers: ${JSON.stringify(req.headers)}`);
  }
  next();
});

app.use(helmet()); // Helmet helps secure the app by setting various HTTP headers.
app.use(cors()); 
app.use(express.json()); 
app.use(morgan('dev')); // This logs HTTP requests to the console in development mode.
app.use('/api/', limiter); 

// ─── Health Check (public — no auth required) ─────────────────────────────────
app.get('/health', async (req: Request, res: Response) => {
  const checks: Record<string, any> = {
    database: false,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch { /* database unreachable */ }

  const healthy = checks.database;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'webhook-delivery-api',
    checks,
  });
});

// ─── Public routes
app.use('/api/v1/auth', authRoutes);

// ─── Protected Routes (require API key) ──────────────────────────────────────
app.use('/api/v1/subscriptions', apiKeyAuth, subscriptionRoutes);
app.use('/api/v1/events', apiKeyAuth, eventRoutes);
app.use('/api/v1/deliveries', apiKeyAuth, deliveryRoutes);
app.use('/api/v1/metrics', apiKeyAuth, metricsRoutes);

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

