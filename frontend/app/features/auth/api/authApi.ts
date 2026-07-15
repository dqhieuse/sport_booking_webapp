import { apiClient } from "~/lib/apiClient";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "~/features/auth/types";

export const authApi = {
  register(payload: RegisterRequest) {
    return apiClient.post<RegisterResponse>("/auth/register", payload, {
      auth: false,
    });
  },
  login(payload: LoginRequest) {
    return apiClient.post<LoginResponse>("/auth/login", payload, {
      auth: false,
    });
  },
  restoreSession() {
    return apiClient.post<LoginResponse>("/auth/session", undefined, {
      auth: false,
      refreshOnUnauthorized: false,
    });
  },
  refresh() {
    return apiClient.post<LoginResponse>("/auth/refresh", undefined, {
      auth: false,
      refreshOnUnauthorized: false,
    });
  },
  me() {
    return apiClient.get<AuthUser>("/auth/me");
  },
  logout() {
    return apiClient.post<void>("/auth/logout", undefined, {
      auth: false,
      refreshOnUnauthorized: false,
    });
  },
};
