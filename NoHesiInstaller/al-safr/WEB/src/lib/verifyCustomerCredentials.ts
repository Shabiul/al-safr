import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import type { Customer } from '@/types';

export async function verifyCustomerCredentials(
  email: string,
  password: string
): Promise<Customer | null> {
  const { data: customer } = await db.from('Customer').select('*').eq('email', email).maybeSingle();
  if (!customer) return null;

  const isValid = await bcrypt.compare(password, customer.hashedPassword);
  if (!isValid) return null;

  return { id: customer.id, email: customer.email, name: customer.name };
}
