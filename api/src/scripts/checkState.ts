import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const apiKey = 'YOUR_ADMIN_API_KEY_HERE';
  
  const admin = await prisma.admin.findUnique({ where: { apiKey } });
  if (!admin) {
    console.log('Admin NOT FOUND for this API Key');
    return;
  }
  console.log(`Admin Found: ${admin.username} (${admin.id})`);

  const subscriptions = await prisma.subscription.findMany({
    where: { adminId: admin.id }
  });
  console.log(`Found ${subscriptions.length} subscriptions for this admin:`);
  subscriptions.forEach(s => {
    console.log(` - ID: ${s.id}, Events: ${JSON.stringify(s.events)}, Active: ${s.isActive}`);
  });

  const deliveries = await prisma.delivery.findMany({
    where: { adminId: admin.id },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Found ${deliveries.length} recent deliveries for this admin.`);

  const events = await prisma.event.findMany({
    where: { adminId: admin.id },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Found ${events.length} recent incoming events for this admin.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
