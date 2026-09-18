import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { verifyStaffCredentials } from './verifyStaffCredentials';

async function run() {
  const email = 'verify-staff-test@al-safr.test';
  const password = 'correct-horse-battery-staple';
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.from('StaffUser').delete().eq('email', email);
  const { error: insertError } = await db.from('StaffUser').insert({
    id: crypto.randomUUID(),
    email,
    hashedPassword,
    name: 'Verify Staff Test',
    role: 'STAFF',
    updatedAt: new Date().toISOString(),
  });
  if (insertError) throw new Error(`FAIL: seed insert failed: ${insertError.message}`);

  const matched = await verifyStaffCredentials(email, password);
  if (!matched || matched.email !== email || matched.role !== 'STAFF') {
    throw new Error('FAIL: correct password did not verify with the right role');
  }

  const rejected = await verifyStaffCredentials(email, 'wrong-password');
  if (rejected !== null) {
    throw new Error('FAIL: wrong password verified');
  }

  await db.from('StaffUser').delete().eq('email', email);
  console.log('verifyStaffCredentials.test passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
