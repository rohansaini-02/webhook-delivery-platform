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

    // Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const recentDeliveries = await prisma.delivery.findMany({
      where: { 
        createdAt: { gte: sevenDaysAgo },
        adminId
      },
      select: { createdAt: true }
    });

    const chartData = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    today.setHours(0,0,0,0);

    recentDeliveries.forEach(d => {
      // Normalize to midnight to avoid timezone crossover noise
      const dDate = new Date(d.createdAt);
      dDate.setHours(0,0,0,0);
      const diffTime = today.getTime() - dDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        chartData[6 - diffDays]++;
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
