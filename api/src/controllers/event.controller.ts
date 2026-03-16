import { Request, Response } from 'express';
import prisma from '../config/db';
import { IncomingEvent } from '../types/index';
import { enqueueDelivery } from '../config/rabbitmq';

// POST /events  — Ingest a new event
export const ingestEvent = async (req: Request, res: Response): Promise<void> => {
  const { type, payload }: IncomingEvent = req.body;

  if (!type || !payload) {
    res.status(400).json({ status: 'error', message: 'type and payload are required' });
    return;
  }

  // Persist the event
  const event = await prisma.event.create({ data: { type, payload: payload as any } });

  // Find all active subscriptions that match this event type
  const subscriptions = await prisma.subscription.findMany({
    where: {
      isActive: true,
      events: { has: type },
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

// GET /events — List all events
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ status: 'ok', data: events });
};

// GET /events/:id — Get single event + its deliveries
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  const id: string = String(req.params.id);
  const event = await prisma.event.findUnique({
    where: { id },
    include: { deliveries: true },
  });
  if (!event) {
    res.status(404).json({ status: 'error', message: 'Event not found' });
    return;
  }
  res.json({ status: 'ok', data: event });
};
