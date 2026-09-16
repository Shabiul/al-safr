import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import type { Customer } from '@al-safr/shared';

export async function verifyCustomerCredentials(
  email: string,
  password: string
): Promise<Customer | null> {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return null;

  const isValid = await bcrypt.compare(password, customer.hashedPassword);
  if (!isValid) return null;

  return { id: customer.id, email: customer.email, name: customer.name };
}
