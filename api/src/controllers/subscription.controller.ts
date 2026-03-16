import { Request, Response } from 'express';
import prisma from '../config/db';
import { generateSecret } from '../utils/hmac';

// GET /subscriptions
export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: 'ok', data: subscriptions });
};

// GET /subscriptions/:id
export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const subscription = await prisma.subscription.findUnique({ where: { id } });
  if (!subscription) {
    res.status(404).json({ status: 'error', message: 'Subscription not found' });
    return;
  }
  res.json({ status: 'ok', data: subscription });
};

// POST /subscriptions
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  const { url, secret } = req.body as { url: string; secret?: string };
  const events: string[] = Array.isArray(req.body.events) ? req.body.events : [];

  if (!url || events.length === 0) {
    res.status(400).json({ status: 'error', message: 'url and events are required' });
    return;
  }

  const subscription = await prisma.subscription.create({
    data: { url, events, secret: secret || generateSecret() },
  });
  res.status(201).json({ status: 'ok', data: subscription });
};

// PATCH /subscriptions/:id
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const { url, isActive } = req.body as { url?: string; isActive?: boolean };
  const events: string[] | undefined = Array.isArray(req.body.events) ? req.body.events : undefined;

  const existing = await prisma.subscription.findUnique({ where: { id } });
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
  const existing = await prisma.subscription.findUnique({ where: { id } });
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
  const existing = await prisma.subscription.findUnique({ where: { id } });
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
