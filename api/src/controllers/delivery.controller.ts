import { Request, Response } from 'express';
import prisma from '../config/db';

import { enqueueDelivery } from '../config/rabbitmq';

// GET /deliveries — List delivery records with cursor pagination
export const getDeliveries = async (req: Request, res: Response): Promise<void> => {
  const { status, subscriptionId, cursor, limit: rawLimit } = req.query;
  const limit = Math.min(parseInt(rawLimit as string) || 20, 100);

  const deliveries = await prisma.delivery.findMany({
    where: {
      adminId: req.admin?.id,
      ...(status && typeof status === 'string' ? { status: status as any } : {}),
      ...(subscriptionId && typeof subscriptionId === 'string' ? { subscriptionId } : {}),
    },
    ...(cursor ? { cursor: { id: cursor as string }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    include: { event: true, subscription: { select: { url: true } } },
  });

  const hasMore = deliveries.length > limit;
  const data = hasMore ? deliveries.slice(0, limit) : deliveries;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json({ status: 'ok', data, pagination: { nextCursor, hasMore, limit } });
};


// GET /deliveries/:id — Get single delivery detail
export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  const id: string = String(req.params.id);
  const delivery = await prisma.delivery.findFirst({
    where: { id, adminId: req.admin?.id },
    include: { event: true, subscription: true },
  });
  if (!delivery) {
    res.status(404).json({ status: 'error', message: 'Delivery not found' });
    return;
  }
  res.json({ status: 'ok', data: delivery });
};

// GET /deliveries/dlq — Get dead-letter queue deliveries with cursor pagination
export const getDlqDeliveries = async (req: Request, res: Response): Promise<void> => {
  const { cursor, limit: rawLimit } = req.query;
  const limit = Math.min(parseInt(rawLimit as string) || 20, 100);

  const deliveries = await prisma.delivery.findMany({
    where: { isDlq: true, adminId: req.admin?.id },
    ...(cursor ? { cursor: { id: cursor as string }, skip: 1 } : {}),
    orderBy: { updatedAt: 'desc' },
    take: limit + 1,
    include: { event: true, subscription: { select: { url: true } } },
  });

  const hasMore = deliveries.length > limit;
  const data = hasMore ? deliveries.slice(0, limit) : deliveries;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  res.json({ status: 'ok', data, pagination: { nextCursor, hasMore, limit } });
};
// POST /deliveries/dlq/purge
export const purgeDlq = async (req: Request, res: Response): Promise<void> => {
  const result = await prisma.delivery.deleteMany({
    where: { isDlq: true, adminId: req.admin?.id },
  });
  res.json({ status: 'ok', message: `Purged ${result.count} messages from DLQ` });
};

// POST /deliveries/dlq/replay-all
export const replayAllDlq = async (req: Request, res: Response): Promise<void> => {
  const dlqItems = await prisma.delivery.findMany({
    where: { isDlq: true, adminId: req.admin?.id },
  });

  if (dlqItems.length === 0) {
    res.json({ status: 'ok', message: 'No items in DLQ' });
    return;
  }

  // Update status en masse
  await prisma.delivery.updateMany({
    where: { isDlq: true, adminId: req.admin?.id },
    data: {
      isDlq: false,
      status: 'PENDING',
      attempts: 0,
      nextAttemptAt: null,
      lastError: null,
      lastStatusCode: null
    }
  });

  // Requeue all
  for (const item of dlqItems) {
    await enqueueDelivery(item.id);
  }

  res.json({ status: 'ok', message: `Requeued ${dlqItems.length} messages` });
};

// POST /deliveries/:id/replay
export const replayDelivery = async (req: Request, res: Response): Promise<void> => {
  const id: string = String(req.params.id);
  
  const delivery = await prisma.delivery.findFirst({ where: { id, adminId: req.admin?.id } });
  if (!delivery) {
    res.status(404).json({ status: 'error', message: 'Delivery not found' });
    return;
  }

  await prisma.delivery.update({
    where: { id },
    data: {
      isDlq: false,
      status: 'PENDING',
      attempts: 0,
      nextAttemptAt: null,
      lastError: null,
      lastStatusCode: null
    }
  });

  await enqueueDelivery(id);

  res.json({ status: 'ok', message: `Delivery ${id} requeued` });
};
