import { Request, Response } from 'express';
import prisma from '../config/db';
import { IncomingEvent } from '../types/index';
import { enqueueDelivery } from '../config/rabbitmq';

/**
 * POST /events
 * Ingests a new event from an external source, persists it, and schedules 
 * deliveries for all matching active subscriptions (Fan-out pattern).
 */
export const ingestEvent = async (req: Request, res: Response): Promise<void> => {
  const { type, payload }: IncomingEvent = req.body;
  const adminId = req.admin?.id;

  if (!type || !payload) {
    res.status(400).json({ status: 'error', message: 'type and payload are required' });
    return;
  }

  // Persist the event tied to the admin
  const event = await prisma.event.create({ 
    data: { 
      type, 
      payload: payload as any,
      adminId 
    } 
  });

  // Find all active subscriptions that match this event type AND belong to this admin
  const subscriptions = await prisma.subscription.findMany({
    where: {
      adminId,
      isActive: true,
      OR: [
        { events: { has: type } },
        { events: { has: '*' } }
      ]
    },
  });

  // Create a PENDING delivery record for each matched subscription and enqueue passing the delivery ID
  if (subscriptions.length > 0) {
    for (const sub of subscriptions) {
      const delivery = await prisma.delivery.create({
        data: {
          eventId: event.id,
          subscriptionId: sub.id,
          status: 'PENDING',
          adminId // Tie delivery to admin
        },
      });
      // Enqueue to RabbitMQ
      await enqueueDelivery(delivery.id);
    }
  }

  res.status(202).json({
    status: 'accepted',
    message: 'Event ingested and queued for delivery',
    data: {
      eventId: event.id,
      deliveriesScheduled: subscriptions.length,
    },
  });
};

// GET /events — List all events for this admin
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const events = await prisma.event.findMany({
    where: { adminId: req.admin?.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ status: 'ok', data: events });
};

// GET /events/:id — Get single event + its deliveries
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  const id: string = String(req.params.id);
  const event = await prisma.event.findFirst({
    where: { id, adminId: req.admin?.id },
    include: { deliveries: true },
  });
  if (!event) {
    res.status(404).json({ status: 'error', message: 'Event not found' });
    return;
  }
  res.json({ status: 'ok', data: event });
};

// GET /events/meta/types — Get unique event types for the admin
export const getEventTypes = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.admin?.id;
  
  const types = await prisma.event.groupBy({
    by: ['type'],
    where: { adminId },
    _count: { type: true },
    orderBy: { type: 'asc' }
  });

  const uniqueTypes = types.map(t => t.type);
  res.json({ status: 'ok', data: uniqueTypes });
};
