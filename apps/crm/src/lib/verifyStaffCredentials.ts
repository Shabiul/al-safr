import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import type { StaffUser } from '@al-safr/shared';

export async function verifyStaffCredentials(
  email: string,
  password: string
): Promise<StaffUser | null> {
  const staff = await prisma.staffUser.findUnique({ where: { email } });
  if (!staff) return null;

  const isValid = await bcrypt.compare(password, staff.hashedPassword);
  if (!isValid) return null;

  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role };
}
