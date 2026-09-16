export type StaffRole = 'SUPER_ADMIN' | 'STAFF';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}
