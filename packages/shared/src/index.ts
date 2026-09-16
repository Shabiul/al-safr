export type StaffRole = 'SUPER_ADMIN' | 'STAFF';

export interface Customer {
  id: string;
  email: string;
  name: string;
}

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}
