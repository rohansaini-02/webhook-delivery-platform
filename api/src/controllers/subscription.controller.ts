import { Request, Response } from 'express';
import prisma from '../config/db';
import { generateSecret } from '../utils/hmac';

/**
 * GET /subscriptions
 * Retrieves a paginated list of webhook subscriptions for the authenticated admin.
 * Uses cursor-based pagination for high performance with large datasets.
 */
export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  const { cursor, limit: rawLimit } = req.query;
  const limit = Math.min(parseInt(rawLimit as string) || 20, 100);

  const subscriptions = await prisma.subscription.findMany({
    where: { adminId: req.admin?.id },
    ...(cursor ? { cursor: { id: cursor as string }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    include: {
      _count: {
        select: { deliveries: true }
      }
    }
  });

  const hasMore = subscriptions.length > limit;
  const data = hasMore ? subscriptions.slice(0, limit) : subscriptions;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json({ status: 'ok', data, pagination: { nextCursor, hasMore, limit } });
};

// GET /subscriptions/:id
export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const subscription = await prisma.subscription.findFirst({ 
    where: { id, adminId: req.admin?.id },
    include: {
      _count: {
        select: { deliveries: true }
      }
    }
  });
  if (!subscription) {
    res.status(404).json({ status: 'error', message: 'Subscription not found' });
    return;
  }
  res.json({ status: 'ok', data: subscription });
};

// POST /subscriptions
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  const { url, secret, environment } = req.body as { url: string; secret?: string; environment?: 'PROD'|'STAGE' };
  const events: string[] = Array.isArray(req.body.events) ? req.body.events : [];

  if (!url || events.length === 0) {
    res.status(400).json({ status: 'error', message: 'url and events are required' });
    return;
  }

  const subscription = await prisma.subscription.create({
    data: { 
      url, 
      events, 
      secret: secret || generateSecret(),
      environment: environment || 'PROD',
      adminId: req.admin?.id
    },
  });
  res.status(201).json({ status: 'ok', data: subscription });
};

// PATCH /subscriptions/:id
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const { url, isActive } = req.body as { url?: string; isActive?: boolean };
  const events: string[] | undefined = Array.isArray(req.body.events) ? req.body.events : undefined;

  const existing = await prisma.subscription.findFirst({ where: { id, adminId: req.admin?.id } });
  if (!existing) {
    res.status(404).json({ status: 'error', message: 'Subscription not found' });
    return;
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: { url, ...(events ? { events } : {}), isActive },
  });
  res.json({ status: 'ok', data: updated });
};

// DELETE /subscriptions/:id
export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const existing = await prisma.subscription.findFirst({ where: { id, adminId: req.admin?.id } });
  if (!existing) {
    res.status(404).json({ status: 'error', message: 'Subscription not found' });
    return;
  }
  await prisma.subscription.delete({ where: { id } });
  res.json({ status: 'ok', message: 'Subscription deleted' });
};

// POST /subscriptions/:id/rotate-secret
export const rotateSecret = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const existing = await prisma.subscription.findFirst({ where: { id, adminId: req.admin?.id } });
  if (!existing) {
    res.status(404).json({ status: 'error', message: 'Subscription not found' });
    return;
  }
  const updated = await prisma.subscription.update({
    where: { id },
    data: { secret: generateSecret() },
  });
  res.json({ status: 'ok', message: 'Secret rotated', data: { secret: updated.secret } });
};
