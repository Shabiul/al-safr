import bcrypt from 'bcryptjs';
import { prisma } from './index';

async function demo() {
  const customerPassword = await bcrypt.hash('customer-demo-pass', 10);
  const customer = await prisma.customer.upsert({
    where: { email: 'demo.customer@al-safr.test' },
    update: {},
    create: {
      email: 'demo.customer@al-safr.test',
      hashedPassword: customerPassword,
      name: 'Demo Customer',
    },
  });

  const staffPassword = await bcrypt.hash('staff-demo-pass', 10);
  const staff = await prisma.staffUser.upsert({
    where: { email: 'demo.staff@al-safr.test' },
    update: {},
    create: {
      email: 'demo.staff@al-safr.test',
      hashedPassword: staffPassword,
      name: 'Demo Staff',
      role: 'SUPER_ADMIN',
    },
  });

  const fetchedCustomer = await prisma.customer.findUniqueOrThrow({ where: { email: customer.email } });
  const fetchedStaff = await prisma.staffUser.findUniqueOrThrow({ where: { email: staff.email } });

  if (fetchedCustomer.email !== customer.email) {
    throw new Error('FAIL: customer not fetchable by email');
  }
  if (fetchedStaff.email !== staff.email) {
    throw new Error('FAIL: staff not fetchable by email');
  }

  const wrongPasswordMatches = await bcrypt.compare('totally-wrong-password', fetchedStaff.hashedPassword);
  if (wrongPasswordMatches) {
    throw new Error('FAIL: wrong password matched staff hash');
  }

  console.log('demo() passed: customer + staff seeded, fetched, and password check verified.');
}

demo()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
