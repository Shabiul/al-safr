import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import type { StaffUser } from '@/types';

export async function verifyStaffCredentials(
  email: string,
  password: string
): Promise<StaffUser | null> {
  const { data: staff } = await db.from('StaffUser').select('*').eq('email', email).maybeSingle();
  if (!staff || !staff.active) return null;

  const isValid = await bcrypt.compare(password, staff.hashedPassword);
  if (!isValid) return null;

  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role };
}
