import { createContext } from 'react';

import type { AuthSession, LoginResponse } from './types';

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
