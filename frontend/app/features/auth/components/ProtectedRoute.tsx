import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

import { usePageTransitionNavigate } from "~/components/common/PageTransition";
import { getDefaultRouteForRole, useAuth } from "~/features/auth/AuthProvider";
import type { RoleName } from "~/features/auth/types";
import { routePaths } from "~/routes/routePaths";

type ProtectedRouteProps = {
  allowedRoles?: RoleName[];
  children?: React.ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const navigateWithTransition = usePageTransitionNavigate();
  const { status, user } = useAuth();
  const isUnauthenticated = status !== "loading" && (status !== "authenticated" || !user);
  const isForbidden =
    status === "authenticated" &&
    user !== null &&
    Boolean(allowedRoles?.length) &&
    !allowedRoles?.includes(user.role);

  useEffect(() => {
    if (isUnauthenticated) {
      const redirectTo = `${routePaths.login}?redirectTo=${encodeURIComponent(
        `${location.pathname}${location.search}`,
      )}`;

      navigateWithTransition(redirectTo, { replace: true });
      return;
    }

    if (isForbidden) {
      navigateWithTransition(routePaths.home, { replace: true });
    }
  }, [
    isForbidden,
    isUnauthenticated,
    location.pathname,
    location.search,
    navigateWithTransition,
  ]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (isUnauthenticated || isForbidden) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted">
        Đang chuyển hướng...
      </div>
    );
  }

  return children ?? <Outlet />;
}

export function GuestOnlyRoute({ children }: { children?: React.ReactNode }) {
  const navigateWithTransition = usePageTransitionNavigate();
  const { status, user } = useAuth();
  const shouldRedirect = status === "authenticated" && user !== null;

  useEffect(() => {
    if (shouldRedirect) {
      navigateWithTransition(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [navigateWithTransition, shouldRedirect, user]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted">
        Đang chuyển hướng...
      </div>
    );
  }

  return children ?? <Outlet />;
}
