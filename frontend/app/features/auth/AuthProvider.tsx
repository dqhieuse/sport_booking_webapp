import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi } from "~/features/auth/api/authApi";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "~/features/auth/types";
import { ApiError } from "~/lib/apiError";
import { authTokenStore } from "~/lib/authTokenStore";
import { routePaths } from "~/routes/routePaths";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function getDefaultRouteForRole(role?: AuthUser["role"]) {
  if (role === "ADMIN") return routePaths.adminDashboard;
  if (role === "VENDOR") return routePaths.vendorDashboard;

  return routePaths.home;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(() => {
    authTokenStore.clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const applyLoginResponse = useCallback((accessToken: string, nextUser: AuthUser) => {
    authTokenStore.setAccessToken(accessToken);
    setUser(nextUser);
    setStatus("authenticated");
    return nextUser;
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.data);
      setStatus("authenticated");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        return null;
      }

      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function restoreAuthState() {
      try {
        const existingToken = authTokenStore.getAccessToken();

        if (existingToken) {
          const response = await authApi.me();
          if (!isMounted) return;
          setUser(response.data);
          setStatus("authenticated");
          return;
        }

        const response = await authApi.restoreSession();
        if (!isMounted) return;
        applyLoginResponse(response.data.accessToken, response.data.user);
      } catch {
        if (!isMounted) return;
        clearSession();
      }
    }

    restoreAuthState();

    return () => {
      isMounted = false;
    };
  }, [applyLoginResponse, clearSession]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload);
      return applyLoginResponse(response.data.accessToken, response.data.user);
    },
    [applyLoginResponse],
  );

  const register = useCallback(async (payload: RegisterRequest) => {
    const response = await authApi.register(payload);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [login, logout, refreshCurrentUser, register, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
