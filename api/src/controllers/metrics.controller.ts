import { Request, Response } from 'express';
import prisma from '../config/db';

// GET /metrics — Get summary statistics for the Admin Dashboard
export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSubscriptions = await prisma.subscription.count();
    const totalEvents = await prisma.event.count();
    const totalDeliveries = await prisma.delivery.count();
    
    // Delivery status breakdown
    const successfulDeliveries = await prisma.delivery.count({ where: { status: 'SUCCESS' } });
    const failedDeliveries = await prisma.delivery.count({ where: { status: 'FAILED' } });
    const pendingDeliveries = await prisma.delivery.count({ where: { status: 'PENDING' } });
    const retryingDeliveries = await prisma.delivery.count({ where: { status: 'RETRYING' } });

    res.status(200).json({
      status: 'success',
      data: {
        totals: {
          subscriptions: totalSubscriptions,
          events: totalEvents,
          deliveries: totalDeliveries,
        },
        deliveryStatuses: {
          success: successfulDeliveries,
          failed: failedDeliveries,
          pending: pendingDeliveries,
          retrying: retryingDeliveries,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve metrics' });
  }
};
