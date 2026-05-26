import { createContext } from 'react';

import type { AuthSession, LoginResponse, LoginUserResponse } from './types';

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (response: LoginResponse) => void;
  updateUser: (user: LoginUserResponse) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
