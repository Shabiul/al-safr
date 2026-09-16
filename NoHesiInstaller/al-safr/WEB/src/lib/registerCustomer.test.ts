import { prisma } from '@/lib/db';
import { registerCustomer, EmailAlreadyRegisteredError } from './registerCustomer';

async function run() {
  const email = 'register-test@al-safr.test';
  await prisma.customer.deleteMany({ where: { email } });

  const created = await registerCustomer(email, 'a-strong-password', 'Register Test');
  if (created.email !== email) {
    throw new Error('FAIL: registered customer has wrong email');
  }

  let threw = false;
  try {
    await registerCustomer(email, 'a-different-password', 'Register Test');
  } catch (err) {
    threw = err instanceof EmailAlreadyRegisteredError;
  }
  if (!threw) {
    throw new Error('FAIL: registering a duplicate email did not throw EmailAlreadyRegisteredError');
  }

  await prisma.customer.deleteMany({ where: { email } });
  console.log('registerCustomer.test passed.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
