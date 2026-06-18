import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { invalidateApiCache } from '@/lib/apiClient';
import { authTokenStore } from '@/lib/authTokenStore';

import { logoutAccount, refreshAuthSession, restoreAuthSession } from './api/authApi';
import { AuthContext, type AuthContextValue } from './authContextValue';
import type { AuthSession, LoginResponse, LoginUserResponse } from './types';

let restoreSessionPromise: Promise<LoginResponse> | null = null;
let refreshSessionPromise: Promise<LoginResponse> | null = null;

const REFRESH_BUFFER_MS = 60_000;

function createSession(response: LoginResponse): AuthSession {
  return {
    ...response,
    expiresAt: Date.now() + response.expiresIn * 1000,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

    restoreSessionPromise = null;
    refreshSessionPromise = null;
    invalidateApiCache();
    authTokenStore.setAccessToken(nextSession.accessToken);
    setSession(nextSession);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      if (!refreshSessionPromise) {
        refreshSessionPromise = refreshAuthSession()
          .then((response) => response.data)
          .finally(() => {
            refreshSessionPromise = null;
          });
      }

      const response = await refreshSessionPromise;
      const nextSession = createSession(response);
      authTokenStore.setAccessToken(nextSession.accessToken);
      setSession(nextSession);
    } catch {
      invalidateApiCache();
      authTokenStore.clear();
      setSession(null);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const refreshIfNeeded = () => {
      if (Date.now() >= session.expiresAt - REFRESH_BUFFER_MS) {
        void refreshSession();
      }
    };
    const delay = Math.max(session.expiresAt - Date.now() - REFRESH_BUFFER_MS, 0);
    const timeoutId = window.setTimeout(refreshIfNeeded, delay);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshIfNeeded();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshSession, session]);

  const logout = useCallback(async () => {
    restoreSessionPromise = null;
    refreshSessionPromise = null;
    invalidateApiCache();
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
