import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import { verifyStaffCredentials } from './verifyStaffCredentials';

async function run() {
  const email = 'verify-staff-test@al-safr.test';
  const password = 'correct-horse-battery-staple';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.staffUser.deleteMany({ where: { email } });
  await prisma.staffUser.create({
    data: { email, hashedPassword, name: 'Verify Staff Test', role: 'STAFF' },
  });

  const matched = await verifyStaffCredentials(email, password);
  if (!matched || matched.email !== email || matched.role !== 'STAFF') {
    throw new Error('FAIL: correct password did not verify with the right role');
  }

  const rejected = await verifyStaffCredentials(email, 'wrong-password');
  if (rejected !== null) {
    throw new Error('FAIL: wrong password verified');
  }

  await prisma.staffUser.deleteMany({ where: { email } });
  console.log('verifyStaffCredentials.test passed.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
