import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
export const DELIVERY_QUEUE = 'webhook_deliveries';

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(DELIVERY_QUEUE, { durable: true });
    console.log('✅ Connected to RabbitMQ');
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ. Ensure it is running:', error);
    // Don't exit process in local dev if RabbitMQ is down right away, 
    // but log heavily. If this were prod, maybe process.exit(1);
  }
};

export const enqueueDelivery = async (deliveryId: string): Promise<boolean> => {
  if (!channel) {
    console.error('RabbitMQ channel not initialized. Cannot enqueue delivery:', deliveryId);
    return false;
  }

  return channel.sendToQueue(DELIVERY_QUEUE, Buffer.from(JSON.stringify({ deliveryId })), {
    persistent: true,
  });
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('RabbitMQ connection closed.');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};




// This file:
// connects to RabbitMQ
// creates queue
// sends messages