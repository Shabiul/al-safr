import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import type { StaffUser } from '@/types';

export async function verifyStaffCredentials(
  email: string,
  password: string
): Promise<StaffUser | null> {
  const staff = await prisma.staffUser.findUnique({ where: { email } });
  if (!staff || !staff.active) return null;

  const isValid = await bcrypt.compare(password, staff.hashedPassword);
  if (!isValid) return null;

  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role };
}
