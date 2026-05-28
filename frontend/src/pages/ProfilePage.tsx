import {
  BadgeCheck,
  CalendarClock,
  Camera,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  XCircle,
} from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, uploadCurrentUserAvatar } from '@/features/auth/api/authApi';
import type { CurrentUserResponse } from '@/features/auth/types';
import type { RoleName, UserStatus } from '@/features/auth/userTypes';
import { useAuth } from '@/features/auth/useAuth';
import { ApiError } from '@/lib/apiError';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type UploadState = 'idle' | 'uploading' | 'success' | 'error';
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
const acceptedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxAvatarSizeBytes = 2 * 1024 * 1024;

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function validateAvatarFile(file: File) {
  if (!acceptedAvatarTypes.includes(file.type)) {
    return 'Avatar image must be JPEG, PNG, or WebP.';
  }

  if (file.size > maxAvatarSizeBytes) {
    return 'Avatar image must be at most 2MB.';
  }

  return null;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, session, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<CurrentUserResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
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
  const isUploadingAvatar = uploadState === 'uploading';

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setUploadState('error');
      setUploadMessage(validationError);
      return;
    }

    setUploadState('uploading');
    setUploadMessage(null);

    try {
      const response = await uploadCurrentUserAvatar(file);
      setProfile(response.data);
      updateUser(response.data);
      setUploadState('success');
      setUploadMessage('Avatar updated successfully.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await logout();
        navigate(routePaths.login, { replace: true });
        return;
      }

      setUploadState('error');
      setUploadMessage(error instanceof Error ? error.message : 'Could not upload avatar.');
    }
  }

  return (
    <div className="page-shell">
      <section>
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

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="h-4 w-4" aria-hidden="true" />
              )}
              Upload avatar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReloadKey((current) => current + 1)}
              disabled={isUploadingAvatar}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>
        {uploadMessage && (
          <p
            className={uploadState === 'error' ? 'mt-5 text-sm text-destructive' : 'mt-5 text-sm text-muted-foreground'}
            role="status"
          >
            {uploadMessage}
          </p>
        )}
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
