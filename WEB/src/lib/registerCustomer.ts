import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import type { Customer } from '@/types';

export class EmailAlreadyRegisteredError extends Error {}

export async function registerCustomer(
  email: string,
  password: string,
  name: string
): Promise<Customer> {
  const { data: existing } = await db.from('Customer').select('id').eq('email', email).maybeSingle();
  if (existing) {
    throw new EmailAlreadyRegisteredError(`An account with ${email} already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { data: customer, error } = await db
    .from('Customer')
    .insert({ id: crypto.randomUUID(), email, hashedPassword, name, updatedAt: new Date().toISOString() })
    .select()
    .single();
  if (error || !customer) throw new Error(error?.message || 'Failed to create customer');

  return { id: customer.id, email: customer.email, name: customer.name };
}
