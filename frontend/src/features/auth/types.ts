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

export type EmailVerificationResponse = {
  emailVerified: boolean;
  status: UserStatus;
};

export type ResendVerificationRequest = {
  email: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type LoginUserResponse = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: RoleName;
  emailVerified: boolean;
};

export type CurrentUserResponse = LoginUserResponse & {
  phone: string;
  status: UserStatus;
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  user: LoginUserResponse;
};

export type AuthSession = LoginResponse & {
  expiresAt: number;
};
