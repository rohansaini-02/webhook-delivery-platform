import { Request, Response } from 'express';
import prisma from '../config/db';
import logger from '../config/logger';

// GET /metrics — Get summary statistics for the Admin Dashboard
export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.admin?.id;

    const totalSubscriptions = await prisma.subscription.count({ where: { adminId } });
    const totalEvents = await prisma.event.count({ where: { adminId } });
    const totalDeliveries = await prisma.delivery.count({ where: { adminId } });
    
    // Delivery status breakdown
    const successfulDeliveries = await prisma.delivery.count({ where: { status: 'SUCCESS', adminId } });
    const failedDeliveries = await prisma.delivery.count({ where: { status: 'FAILED', adminId } });
    const pendingDeliveries = await prisma.delivery.count({ where: { status: 'PENDING', adminId } });
    const retryingDeliveries = await prisma.delivery.count({ where: { status: 'RETRYING', adminId } });
    const dlqDeliveries = await prisma.delivery.count({ where: { isDlq: true, adminId } });

    // Chart Data (Current Week - Starting Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    
    // Calculate distance to most recent Monday (1)
    // If today is Sunday (0), distance is 6. If Monday (1), distance is 0. If Tuesday (2), distance is 1.
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - diffToMonday);

    // End of the week (next Sunday midnight)
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    const recentDeliveries = await prisma.delivery.findMany({
      where: { 
        createdAt: { gte: monday, lt: nextMonday },
        adminId
      },
      select: { createdAt: true }
    });

    // Initialize 7 days starting from Monday
    const chartData = [0, 0, 0, 0, 0, 0, 0];
    
    recentDeliveries.forEach(d => {
      const dDate = new Date(d.createdAt);
      dDate.setHours(0,0,0,0);
      const diffTime = dDate.getTime() - monday.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        chartData[diffDays]++;
      }
    });

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
          dlq: dlqDeliveries,
        },
        chartData: chartData
      }
    });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve metrics' });
  }
};
