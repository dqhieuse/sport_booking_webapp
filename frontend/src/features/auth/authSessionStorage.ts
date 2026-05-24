import { authTokenStore } from '@/lib/authTokenStore';

import type { AuthSession } from './types';

const AUTH_SESSION_STORAGE_KEY = 'sportzone.authSession';

export function readStoredAuthSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;

    if (!session.accessToken || !session.refreshToken || !session.user) {
      clearStoredAuthSession();
      return null;
    }

    authTokenStore.setAccessToken(session.accessToken);
    return session;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function writeStoredAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  authTokenStore.setAccessToken(session.accessToken);
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  authTokenStore.clear();
}
