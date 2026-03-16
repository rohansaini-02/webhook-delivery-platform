import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = 'webhook_deliveries';

let channel: amqp.Channel | null = null;

export const signPayload = (payload: any, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
};

const processDelivery = async (deliveryId: string) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: { event: true, subscription: true },
  });

  if (!delivery || (delivery.status !== 'PENDING' && delivery.status !== 'RETRYING')) {
    return;
  }

  const { event, subscription } = delivery;
  const signature = signPayload(event.payload, subscription.secret);

  try {
    const response = await axios.post(subscription.url, event.payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event.type,
      },
      timeout: parseInt(process.env.DELIVERY_TIMEOUT_MS || '5000', 10),
    });

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'SUCCESS',
        attempts: { increment: 1 },
        lastStatusCode: response.status,
      },
    });
    console.log(`✅ [${deliveryId}] Delivered to ${subscription.url} (Status: ${response.status})`);
  } catch (error: any) {
    const statusCode = error.response?.status || null;
    const errorMessage = error.message || 'Unknown error';
    const newAttempts = delivery.attempts + 1;
    const isFinalFailure = newAttempts >= delivery.maxAttempts;

    // Exponential Backoff: 2^attempts seconds (2s, 4s, 8s, 16s...)
    const backoffSeconds = Math.pow(2, newAttempts);
    const nextAttemptAt = isFinalFailure ? null : new Date(Date.now() + backoffSeconds * 1000);

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: isFinalFailure ? 'FAILED' : 'RETRYING',
        attempts: newAttempts,
        lastStatusCode: statusCode,
        lastError: errorMessage,
        isDlq: isFinalFailure,
        nextAttemptAt,
      },
    });
    
    if (isFinalFailure) {
      console.error(`🚨 [${deliveryId}] Max retries reached. Moved to DLQ. Failed to deliver to ${subscription.url} - ${errorMessage}`);
      
      // Auto-disable subscription after max failures (simulate 3 bad DLQs -> auto-disable)
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { failCount: { increment: 1 } },
      });
    } else {
      console.warn(`⚠️ [${deliveryId}] Failed attempt ${newAttempts}/${delivery.maxAttempts}. Retrying in ${backoffSeconds}s...`);
    }
  }
};

const pollRetries = async () => {
  if (!channel) return;
  const pendingRetries = await prisma.delivery.findMany({
    where: {
      status: 'RETRYING',
      nextAttemptAt: { lte: new Date() },
    },
  });

  for (const delivery of pendingRetries) {
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify({ deliveryId: delivery.id })), { persistent: true });
    // Reset nextAttemptAt to avoid re-triggering this poll immediately before processing finishes
    await prisma.delivery.update({
        where: { id: delivery.id },
        data: { nextAttemptAt: null }
    });
    console.log(`⏰ Re-queued delivery [${delivery.id}] for retry attempt ${delivery.attempts + 1}`);
  }
};

const startWorker = async () => {
  try {
    console.log('🏃 Starting Webhook Delivery Worker with Exponential Backoff...');
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    // Consume queue
    channel.consume(QUEUE, async (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        if (content.deliveryId) {
          await processDelivery(content.deliveryId);
        }
        channel!.ack(msg);
      }
    });

    // Start DB Retry Poller every 5 seconds
    setInterval(pollRetries, 5000);
    console.log(`🎧 Listening for deliveries on queue: ${QUEUE}`);
    console.log(`⏳ Retry backoff poller activated (5s interval).`);
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
