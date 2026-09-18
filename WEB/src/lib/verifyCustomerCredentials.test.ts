import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { verifyCustomerCredentials } from './verifyCustomerCredentials';

async function run() {
  const email = 'verify-test@al-safr.test';
  const password = 'correct-horse-battery-staple';
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.from('Customer').delete().eq('email', email);
  const { error: insertError } = await db
    .from('Customer')
    .insert({ id: crypto.randomUUID(), email, hashedPassword, name: 'Verify Test', updatedAt: new Date().toISOString() });
  if (insertError) throw new Error(`FAIL: seed insert failed: ${insertError.message}`);

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

  await db.from('Customer').delete().eq('email', email);
  console.log('verifyCustomerCredentials.test passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
