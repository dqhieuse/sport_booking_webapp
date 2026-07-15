import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "~/features/auth/AuthProvider";
import type { RoleName } from "~/features/auth/types";
import { routePaths } from "~/routes/routePaths";

type ProtectedRouteProps = {
  allowedRoles?: RoleName[];
  children?: React.ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    const redirectTo = `${routePaths.login}?redirectTo=${encodeURIComponent(
      `${location.pathname}${location.search}`,
    )}`;

    return <Navigate replace to={redirectTo} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate replace to={routePaths.home} />;
  }

  return children ?? <Outlet />;
}
