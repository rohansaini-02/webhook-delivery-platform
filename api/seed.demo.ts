import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  // 1. Create a dummy subscription (Echo endpoint that succeeds)
  const sub1 = await prisma.subscription.create({
    data: {
      url: 'https://postman-echo.com/post', // Public echo server for testing webhooks
      secret: 'demo_secret_key_123',
      events: ['user.created', 'order.shipped'],
      isActive: true,
    },
  });

  // 2. Create another subscription (Failing endpoint for DLQ demo)
  const sub2 = await prisma.subscription.create({
    data: {
      url: 'https://httpstat.us/500', // Returns 500 error
      secret: 'demo_secret_key_456',
      events: ['user.created', 'payment.failed'],
      isActive: true,
    },
  });

  console.log('Created Subscriptions: ', sub1.id, sub2.id);

  // 3. Inject some events directly into the database to mock history
  // For actual delivery demo, we'll hit the API so the worker triggers
  const event1 = await prisma.event.create({
    data: {
      type: 'user.created',
      payload: { id: 101, name: 'Alice Demo', email: 'alice@demo.com' },
    },
  });

  const event2 = await prisma.event.create({
    data: {
      type: 'order.shipped',
      payload: { orderId: 55992, status: 'shipped', tracking: '1Z9999999999999999' },
    },
  });

  // Mock some finished deliveries
  await prisma.delivery.create({
    data: {
      eventId: event1.id,
      subscriptionId: sub1.id,
      status: 'SUCCESS',
      attempts: 1,
      lastStatusCode: 200,
    },
  });

  await prisma.delivery.create({
    data: {
      eventId: event1.id,
      subscriptionId: sub2.id,
      status: 'DLQ',
      attempts: 5,
      lastStatusCode: 500,
      isDlq: true,
      lastError: 'Internal Server Error',
    },
  });

  console.log('Created mock Events & Deliveries!');

  // Trigger real events through the API so they process live in the background while the user watches
  try {
    const apiFetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : null;
    if (!apiFetch) {
       console.log('Skipping live trigger, fetch not globally available');
       return;
    }
    await apiFetch('http://localhost:3000/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'dev-secret-api-key-12345'
      },
      body: JSON.stringify({
        type: 'user.created',
        payload: { userId: 999, name: 'Live Demo User', message: 'Hello World!' }
      })
    });
    console.log('Triggered a LIVE event to the queue for the worker to process!');
  } catch (err: any) {
    console.log('Could not trigger live event automatically: ', err?.message || String(err));
  }

  console.log('Demo Data Seeding Complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
