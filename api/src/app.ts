import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import prisma from './config/db';
import { apiKeyAuth } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

import subscriptionRoutes from './routes/subscription.routes';
import eventRoutes from './routes/event.routes';
import deliveryRoutes from './routes/delivery.routes';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Health Check (public — no auth required) ─────────────────────────────────
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', service: 'webhook-delivery-api', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'webhook-delivery-api', database: 'disconnected' });
  }
});

// ─── Protected Routes (require API key) ──────────────────────────────────────
app.use('/api/v1/subscriptions', apiKeyAuth, subscriptionRoutes);
app.use('/api/v1/events', apiKeyAuth, eventRoutes);
app.use('/api/v1/deliveries', apiKeyAuth, deliveryRoutes);

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
