import { LockKeyhole } from '@mynaui/icons-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { RoleName } from '@/features/auth/userTypes';
import { useAuth } from '@/features/auth/useAuth';

import { getRedirectPath, getRoleHomePath } from './routeRedirect';
import { routePaths } from './routePaths';

type ProtectedRouteProps = {
  allowedRoles?: RoleName[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isInitializing, session } = useAuth();

  if (isInitializing) {
    return <AuthRouteState title="Checking session" description="Please wait while SportZone restores your login session." />;
  }

  if (!isAuthenticated || !session) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <Navigate to={getRoleHomePath(session.user.role)} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();
  const redirectTo = getRedirectPath(location.state);

  if (isInitializing) {
    return <AuthRouteState title="Checking session" description="Please wait while SportZone restores your login session." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export function RoleRestrictedRoute({ blockedRoles }: { blockedRoles: RoleName[] }) {
  const { isInitializing, session } = useAuth();

  if (isInitializing) {
    return <AuthRouteState title="Checking session" description="Please wait while SportZone restores your login session." />;
  }

  if (session && blockedRoles.includes(session.user.role)) {
    return <Navigate to={getRoleHomePath(session.user.role)} replace />;
  }

  return <Outlet />;
}

function AuthRouteState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit gap-2">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Protected route
        </Badge>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
          <Spinner className="size-4 animate-spin" aria-hidden="true" />
          Loading authentication state...
        </div>
      </CardContent>
    </Card>
  );
}
