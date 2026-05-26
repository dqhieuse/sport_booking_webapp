import {
  BadgeCheck,
  CalendarClock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/features/auth/api/authApi';
import type { CurrentUserResponse } from '@/features/auth/types';
import type { RoleName, UserStatus } from '@/features/auth/userTypes';
import { useAuth } from '@/features/auth/useAuth';
import { ApiError } from '@/lib/apiError';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type DisplayProfile = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  role: RoleName;
  status?: UserStatus;
  emailVerified: boolean;
};

const roleLabels: Record<RoleName, string> = {
  USER: 'Customer',
  VENDOR: 'Vendor',
  ADMIN: 'Admin',
};

const statusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING_VERIFICATION: 'Pending verification',
};

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const [profile, setProfile] = useState<CurrentUserResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getCurrentUser(controller.signal);
        setProfile(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          await logout();
          navigate(routePaths.login, { replace: true });
          return;
        }

        setProfile(null);
        setErrorMessage(error instanceof Error ? error.message : 'Could not load profile.');
        setLoadState('error');
      }
    }

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [logout, navigate, reloadKey]);

  const currentProfile: DisplayProfile | null = profile
    ? profile
    : session
      ? {
          ...session.user,
          phone: 'Not available',
        }
      : null;
  const isLoading = loadState === 'idle' || loadState === 'loading';

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (loadState === 'error') {
    return (
      <ApiErrorMessage
        title="Unable to load profile"
        message={errorMessage}
        onRetry={() => setReloadKey((current) => current + 1)}
      />
    );
  }

  if (!currentProfile) {
    return (
      <ApiErrorMessage
        title="Profile unavailable"
        message="Your session is active, but SportZone could not find profile details."
        onRetry={() => setReloadKey((current) => current + 1)}
      />
    );
  }

  const initials = getInitials(currentProfile.fullName);
  const status = currentProfile.status;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-primary/25 bg-primary/10 text-2xl font-semibold text-primary">
            {currentProfile.avatarUrl ? (
              <img src={currentProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials || <UserCircle className="h-10 w-10" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-2 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {roleLabels[currentProfile.role]}
              </Badge>
              {status && (
                <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'} className="px-3 py-1.5">
                  {statusLabels[status]}
                </Badge>
              )}
            </div>
            <div>
              <h1 className="break-words font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {currentProfile.fullName}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                View your account information and session status.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={() => setReloadKey((current) => current + 1)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="sportzone-panel">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Basic information returned by the authenticated profile API.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ProfileField icon={<Mail className="h-4 w-4" aria-hidden="true" />} label="Email" value={currentProfile.email} />
            <ProfileField icon={<Phone className="h-4 w-4" aria-hidden="true" />} label="Phone" value={currentProfile.phone} />
            <ProfileField icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} label="Role" value={roleLabels[currentProfile.role]} />
            <ProfileField
              icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
              label="User ID"
              value={`#${currentProfile.id}`}
            />
          </CardContent>
        </Card>

        <Card className="sportzone-panel">
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>Email verification controls whether local login is allowed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-secondary/60 p-4">
              {currentProfile.emailVerified ? (
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {currentProfile.emailVerified ? 'Email verified' : 'Email not verified'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {currentProfile.emailVerified
                    ? 'Your account can use protected booking features.'
                    : 'Verify your email before using protected booking features.'}
                </p>
              </div>
            </div>

            {!currentProfile.emailVerified && (
              <Button asChild variant="outline" className="w-full">
                <Link to={routePaths.verifyEmail}>Open verification page</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-secondary/55 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-3 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-24 w-24 rounded-full bg-muted animate-soft-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 rounded-full bg-muted animate-soft-pulse" />
            <div className="h-10 max-w-md rounded-full bg-muted animate-soft-pulse" />
            <div className="h-5 max-w-sm rounded-full bg-muted animate-soft-pulse" />
          </div>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72 rounded-2xl bg-muted animate-soft-pulse" />
        <div className="h-72 rounded-2xl bg-muted animate-soft-pulse" />
      </section>
    </div>
  );
}
