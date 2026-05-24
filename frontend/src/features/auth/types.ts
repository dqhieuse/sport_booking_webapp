import type { RoleName, UserStatus } from '@/features/auth/userTypes';

export type RegisterRequest = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type AuthUserResponse = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: RoleName;
  status: UserStatus;
  emailVerified: boolean;
};
