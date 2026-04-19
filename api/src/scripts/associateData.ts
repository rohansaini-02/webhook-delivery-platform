import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const firstAdmin = await prisma.admin.findFirst();
  if (!firstAdmin) {
    console.log('No admin found. Create one first!');
    return;
  }

  console.log(`Associating data with admin: ${firstAdmin.username} (${firstAdmin.id})`);

  // Update Subscriptions
  const subCount = await prisma.subscription.updateMany({
    where: { adminId: null },
    data: { adminId: firstAdmin.id },
  });
  console.log(`Updated ${subCount.count} subscriptions`);

  // Update Events
  const eventCount = await prisma.event.updateMany({
    where: { adminId: null },
    data: { adminId: firstAdmin.id },
  });
  console.log(`Updated ${eventCount.count} events`);

  // Update Deliveries
  const delCount = await prisma.delivery.updateMany({
    where: { adminId: null },
    data: { adminId: firstAdmin.id },
  });
  console.log(`Updated ${delCount.count} deliveries`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
