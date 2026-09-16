import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import { verifyCustomerCredentials } from './verifyCustomerCredentials';

async function run() {
  const email = 'verify-test@al-safr.test';
  const password = 'correct-horse-battery-staple';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.customer.deleteMany({ where: { email } });
  await prisma.customer.create({ data: { email, hashedPassword, name: 'Verify Test' } });

  const matched = await verifyCustomerCredentials(email, password);
  if (!matched || matched.email !== email) {
    throw new Error('FAIL: correct password did not verify');
  }

  const rejected = await verifyCustomerCredentials(email, 'wrong-password');
  if (rejected !== null) {
    throw new Error('FAIL: wrong password verified');
  }

  const unknownUser = await verifyCustomerCredentials('nobody@al-safr.test', password);
  if (unknownUser !== null) {
    throw new Error('FAIL: unknown email verified');
  }

  await prisma.customer.deleteMany({ where: { email } });
  console.log('verifyCustomerCredentials.test passed.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
