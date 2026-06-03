const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error('ADMIN_EMAIL is required');
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  await prisma.adminUser.update({ where: { email }, data: { role: Role.ADMIN } });
  console.log(`Updated role to ADMIN for ${email}`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
