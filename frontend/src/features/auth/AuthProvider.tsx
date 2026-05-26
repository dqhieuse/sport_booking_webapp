import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { authTokenStore } from '@/lib/authTokenStore';

import { logoutAccount, restoreAuthSession } from './api/authApi';
import { AuthContext, type AuthContextValue } from './authContextValue';
import type { AuthSession, LoginResponse, LoginUserResponse } from './types';

let restoreSessionPromise: Promise<LoginResponse> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  function createSession(response: LoginResponse): AuthSession {
    return {
      ...response,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        if (!restoreSessionPromise) {
          restoreSessionPromise = restoreAuthSession().then((response) => response.data);
        }

        const response = await restoreSessionPromise;
        const restoredSession = createSession(response);
        authTokenStore.setAccessToken(restoredSession.accessToken);
        setSession(restoredSession);
      } catch {
        authTokenStore.clear();
        setSession(null);
      } finally {
        setIsInitializing(false);
      }
    }

    void restoreSession();
  }, []);

  const login = useCallback((response: LoginResponse) => {
    const nextSession = createSession(response);

    authTokenStore.setAccessToken(nextSession.accessToken);
    setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    restoreSessionPromise = null;
    authTokenStore.clear();
    setSession(null);

    try {
      await logoutAccount();
    } catch {
      // The browser session must be cleared even if the server-side cookie was already invalid.
    }
  }, []);

  const updateUser = useCallback((user: LoginUserResponse) => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      return {
        ...currentSession,
        user,
      };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isInitializing,
      login,
      updateUser,
      logout,
    }),
    [isInitializing, login, logout, session, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
