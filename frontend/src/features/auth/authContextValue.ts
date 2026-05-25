import { createContext } from 'react';

import type { AuthSession, LoginResponse } from './types';

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (response: LoginResponse) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
