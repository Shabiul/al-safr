import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import type { Customer } from '@al-safr/shared';

export class EmailAlreadyRegisteredError extends Error {}

export async function registerCustomer(
  email: string,
  password: string,
  name: string
): Promise<Customer> {
  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    throw new EmailAlreadyRegisteredError(`An account with ${email} already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({ data: { email, hashedPassword, name } });

  return { id: customer.id, email: customer.email, name: customer.name };
}
