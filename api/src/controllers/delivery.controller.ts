import { Request, Response } from 'express';
import prisma from '../config/db';

// GET /deliveries — List all delivery records
export const getDeliveries = async (req: Request, res: Response): Promise<void> => {
  const { status, subscriptionId } = req.query;

  const deliveries = await prisma.delivery.findMany({
    where: {
      ...(status && typeof status === 'string' ? { status: status as any } : {}),
      ...(subscriptionId && typeof subscriptionId === 'string' ? { subscriptionId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { event: true, subscription: { select: { url: true } } },
  });
  res.json({ status: 'ok', data: deliveries });
};

// GET /deliveries/:id — Get single delivery detail
export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  const id: string = String(req.params.id);
  const delivery = await prisma.delivery.findUnique({
    where: { id },
    include: { event: true, subscription: true },
  });
  if (!delivery) {
    res.status(404).json({ status: 'error', message: 'Delivery not found' });
    return;
  }
  res.json({ status: 'ok', data: delivery });
};

// GET /deliveries/dlq — Get all dead-letter queue deliveries
export const getDlqDeliveries = async (req: Request, res: Response): Promise<void> => {
  const deliveries = await prisma.delivery.findMany({
    where: { isDlq: true },
    orderBy: { updatedAt: 'desc' },
    include: { event: true, subscription: { select: { url: true } } },
  });
  res.json({ status: 'ok', data: deliveries });
};
