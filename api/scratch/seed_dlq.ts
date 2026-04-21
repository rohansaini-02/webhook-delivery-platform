import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding DLQ Data ---');
  
  // 1. Get rohanlabs1 admin
  const admin = await prisma.admin.findUnique({
    where: { username: 'rohanlabs1' }
  });
  if (!admin) {
    console.error('No admin found. Please register a user first.');
    return;
  }
  console.log(`Found Admin: ${admin.username} (${admin.id})`);

  // 2. Get first subscription for this admin
  const sub = await prisma.subscription.findFirst({
    where: { adminId: admin.id }
  });
  if (!sub) {
    console.error('No subscription found for this admin. Please create a subscription first.');
    return;
  }
  console.log(`Found Subscription: ${sub.id}`);

  // 3. Create a mock event
  const event = await prisma.event.create({
    data: {
      type: 'user.signup',
      payload: { userId: 'test_123', email: 'dlq_test@example.com' },
      adminId: admin.id
    }
  });
  console.log(`Created Mock Event: ${event.id}`);

  // 4. Create 2 more IDENTICAL DLQ deliveries to avoid filter confusion
  for (let i = 0; i < 2; i++) {
    const event = await prisma.event.create({
      data: {
        type: 'user.signup',
        payload: { email: `test_${i}@ident.com`, userId: `user_${i}` },
        adminId: admin.id
      }
    });

    await prisma.delivery.create({
      data: {
        eventId: event.id,
        subscriptionId: sub.id,
        status: 'DLQ',
        isDlq: true,
        attempts: 5,
        maxAttempts: 5,
        lastStatusCode: 503,
        lastError: 'Identical failure for testing UI visibility',
        latencyMs: 1500,
        adminId: admin.id
      }
    });
    console.log(`Created Identical DLQ record ${i+1}`);
  }

  console.log(`[SUCCESS] Seeded 2 more identical DLQ records.`);
  console.log(`You now have 5 TOTAL records in your DLQ database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
