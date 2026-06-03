const bcrypt = require('bcrypt');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email,
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      birthDate: new Date('1990-01-01T00:00:00.000Z'),
      phone: '',
      role: Role.ADMIN,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(`Admin ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
