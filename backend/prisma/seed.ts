import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reviewapp.com' },
    update: {},
    create: {
      email: 'admin@reviewapp.com',
      name: 'System Administrator',
      address: '123 Admin Street, Tech City',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created Admin User:');
  console.log(`Email: admin@reviewapp.com`);
  console.log(`Password: Admin@123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
