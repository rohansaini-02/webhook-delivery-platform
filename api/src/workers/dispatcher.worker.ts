import amqp from 'amqplib';
import axios from 'axios';
import prisma from '../config/db';
import { connectRabbitMQ } from '../config/rabbitmq';
import { signPayload } from '../utils/hmac';
import logger from '../config/logger';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const DELIVERY_QUEUE = 'webhook_deliveries';

// Sleep utility for delay backoffs
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exponential backoff with jitter for retry delays.
 * Formula: min(base * 2^attempt + jitter, maxDelay)
 * Produces: ~1s → ~2s → ~4s → ~8s → ~16s (capped at 5 min)
 */
export const getBackoffDelay = (attempt: number): number => {
  const base = 1000;        // 1 second
  const maxDelay = 300000;  // 5 minutes cap
  const exponential = base * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // 0-1s random jitter
  return Math.min(exponential + jitter, maxDelay);
};

export const startDispatcher = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        
        connection.on('error', (err) => {
            logger.error('[Worker] RabbitMQ Connection Error:', err);
        });

        connection.on('close', () => {
            logger.warn('[Worker] RabbitMQ Connection Closed. Attempting reconnect in 5s...');
            setTimeout(startDispatcher, 5000);
        });

        const channel = await connection.createChannel();
        
        channel.on('error', (err) => {
            logger.error('[Worker] RabbitMQ Channel Error:', err);
        });

        await channel.assertQueue(DELIVERY_QUEUE, { durable: true });

        logger.info('👷 Dispatcher Worker started, listening for deliveries...');

        channel.consume(DELIVERY_QUEUE, async (msg) => {
            if (msg !== null) {
                const { deliveryId } = JSON.parse(msg.content.toString());
                logger.info(`[Dispatcher] Picked up delivery ID: ${deliveryId}`);

                try {
                    const delivery = await prisma.delivery.findUnique({
                        where: { id: deliveryId },
                        include: { event: true, subscription: true }
                    });

                    if (!delivery) {
                        logger.error(`[Dispatcher] Delivery ${deliveryId} not found.`);
                        channel.ack(msg);
                        return;
                    }

                    if (!delivery.subscription.isActive) {
                        logger.info(`[Dispatcher] Subscription ${delivery.subscriptionId} is inactive, abandoning delivery.`);
                        await prisma.delivery.update({
                            where: { id: deliveryId },
                            data: { status: 'FAILED', lastError: 'Subscription inactive', isDlq: true }
                        });
                        channel.ack(msg);
                        return;
                    }

                    // Attempt POST request
                    const startTime = Date.now();
                    try {
                        // Sign the payload with the subscription's secret for consumer verification
                        const payloadStr = JSON.stringify(delivery.event.payload);
                        const signature = signPayload(delivery.subscription.secret, payloadStr);
                        const deliveryTimeout = parseInt(process.env.DELIVERY_TIMEOUT_MS || '5000');

                        const response = await axios.post(delivery.subscription.url, delivery.event.payload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'WebhookDeliveryPlatform/1.0',
                                'X-Webhook-Signature': `sha256=${signature}`,
                                'X-Webhook-Event': delivery.event.type,
                                'X-Webhook-Delivery-Id': delivery.id,
                                'X-Webhook-Timestamp': Date.now().toString(),
                            },
                            timeout: deliveryTimeout,
                        });

                        const latencyMs = Date.now() - startTime;

                        // Success
                        await prisma.delivery.update({
                            where: { id: deliveryId },
                            data: { 
                                status: 'SUCCESS', 
                                lastStatusCode: response.status, 
                                latencyMs,
                                isDlq: false,
                                lastError: null
                            }
                        });
                        logger.info(`[Dispatcher] ✅ Delivery ${deliveryId} succeeded (Status: ${response.status})`);
                        channel.ack(msg);

                    } catch (error: any) {
                        const latencyMs = Date.now() - startTime;
                        // Request failed (network, 4xx, 5xx, timeout)
                        const statusCode = error.response?.status || null;
                        const errorMsg = error.message || 'Unknown network error';
                        const attemptsMade = delivery.attempts + 1;

                        logger.error(`[Dispatcher] ❌ Delivery ${deliveryId} failed: ${errorMsg} (Attempt ${attemptsMade}/${delivery.maxAttempts})`);

                        if (attemptsMade >= delivery.maxAttempts) {
                            // Exhausted retries -> DLQ
                            await prisma.delivery.update({
                                where: { id: deliveryId },
                                data: {
                                    status: 'DLQ',
                                    attempts: attemptsMade,
                                    lastStatusCode: statusCode,
                                    lastError: errorMsg,
                                    latencyMs,
                                    isDlq: true
                                }
                            });
                            // Also increment failCount on subscription maybe
                            await prisma.subscription.update({
                                where: { id: delivery.subscriptionId },
                                data: { failCount: { increment: 1 } }
                            });
                            channel.ack(msg); // Stop requeuing in rabbitMQ, we moved it to DLQ explicitly
                        } else {
                            // Needs retry with exponential backoff
                            const delay = getBackoffDelay(attemptsMade);
                            await prisma.delivery.update({
                                where: { id: deliveryId },
                                data: {
                                    status: 'RETRYING',
                                    attempts: attemptsMade,
                                    lastStatusCode: statusCode,
                                    lastError: errorMsg,
                                    latencyMs,
                                    nextAttemptAt: new Date(Date.now() + delay)
                                }
                            });
                            
                            logger.info(`[Dispatcher] ⏳ Retrying delivery ${deliveryId} in ${Math.round(delay / 1000)}s (attempt ${attemptsMade}/${delivery.maxAttempts})`);
                            await sleep(delay); 
                            channel.nack(msg, false, true); // Put back on queue
                        }
                    }

                } catch (dbError) {
                    logger.error('[Dispatcher] Database error:', dbError);
                    channel.nack(msg, false, true); // Put back on queue on generic crash
                }
            }
        });
    } catch (error) {
        logger.error('Failed to start Dispatcher Worker:', error);
    }
};
