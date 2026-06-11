import { routePaths } from './routePaths';
import type { RoleName } from '@/features/auth/userTypes';

export function getRoleHomePath(role: RoleName) {
  if (role === 'ADMIN') {
    return routePaths.adminDashboard;
  }

  if (role === 'VENDOR') {
    return routePaths.vendorDashboard;
  }

  return routePaths.home;
}

export function getRedirectPath(state: unknown) {
  if (!state || typeof state !== 'object' || !('from' in state)) {
    return routePaths.home;
  }

  const from = (state as { from?: { pathname?: unknown; search?: unknown; hash?: unknown } }).from;

  if (!from || typeof from.pathname !== 'string') {
    return routePaths.home;
  }

  const search = typeof from.search === 'string' ? from.search : '';
  const hash = typeof from.hash === 'string' ? from.hash : '';

  return `${from.pathname}${search}${hash}`;
}
