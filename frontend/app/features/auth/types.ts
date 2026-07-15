export type RoleName = "USER" | "VENDOR" | "ADMIN";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: RoleName;
  status?: "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";
  emailVerified: boolean;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterResponse = AuthUser;
