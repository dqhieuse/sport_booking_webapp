import { ReactNode, useCallback, useMemo, useState } from 'react';

import { AuthContext, type AuthContextValue } from './authContextValue';
import {
  readStoredAuthSession,
  writeStoredAuthSession,
} from './authSessionStorage';
import type { AuthSession, LoginResponse } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredAuthSession());

  const login = useCallback((response: LoginResponse) => {
    const nextSession: AuthSession = {
      ...response,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };

    writeStoredAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
    }),
    [login, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
