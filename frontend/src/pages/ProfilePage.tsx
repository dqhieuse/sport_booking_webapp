import {
  Calendar,
  Camera,
  CheckCircle,
  Edit,
  Mail,
  Mobile,
  Pencil,
  Refresh,
  ShieldCheck,
  UserCircle,
  X,
} from '@mynaui/icons-react';
import type { ChangeEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
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
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className={"border-none shadow-none"}>
        <CardContent className="p-6">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className={"relative"}>
              <Avatar className="size-24 border">
                <AvatarImage src={currentProfile.avatarUrl || undefined} alt="" />
                <AvatarFallback className="bg-muted text-2xl font-semibold text-primary">
                  {initials || <UserCircle className="size-10" aria-hidden="true" />}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute size-7 bottom-4 end-3 translate-y-1/2 translate-x-1/2 rounded-full border p-1 text-background bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {isUploadingAvatar ? (
                  <Spinner className="size-4" aria-hidden="true" />
                ) : (
                  <Edit className="size-4" aria-hidden="true" />
                )}
              </Button>
            </div>

            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={"outline"} className="gap-1 px-3 py-1.5">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {roleLabels[currentProfile.role]}
                </Badge>
              </div>
              <div>
                <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        {uploadMessage && (
          <Alert variant={uploadState === 'error' ? 'destructive' : 'default'}>
            {uploadState === 'error' ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <CheckCircle className="size-4 text-primary" aria-hidden="true" />
            )}
            <AlertDescription>{uploadMessage}</AlertDescription>
          </Alert>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] h-fit">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Name and contact details used for booking communication.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileInputField
                id="profile-full-name"
                label="Full name"
                value={currentProfile.fullName}
                icon={<UserCircle className="size-4" aria-hidden="true" />}
              />
              <ProfileInputField
                id="profile-phone"
                label="Phone"
                value={currentProfile.phone}
                icon={<Mobile className="size-4" aria-hidden="true" />}
              />
              <ProfileInputField
                id="profile-email"
                label="Email"
                value={currentProfile.email}
                icon={<Mail className="size-4" aria-hidden="true" />}
              />
              <ProfileInputField
                id="profile-user-id"
                label="User ID"
                value={`#${currentProfile.id}`}
                icon={<Calendar className="size-4" aria-hidden="true" />}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t sm:justify-end p-2">
            <Button type="button" disabled>
              Edit profile
            </Button>
          </CardFooter>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account status</CardTitle>
            <CardDescription>Role, verification, and profile freshness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3">
              <StatusRow label="Role" value={roleLabels[currentProfile.role]} icon={<ShieldCheck className="size-4" aria-hidden="true" />} />
              {status && (
                <StatusRow
                  label="Status"
                  value={statusLabels[status]}
                  icon={<CheckCircle className="size-4" aria-hidden="true" />}
                />
              )}
            </div>

            {!currentProfile.emailVerified && (
              <Button asChild variant="outline" className="w-full">
                <Link to={routePaths.verifyEmail}>Open verification page</Link>
              </Button>
            )}
          </CardContent>
          <CardFooter className="border-t p-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setReloadKey((current) => current + 1)}
              disabled={isUploadingAvatar}
            >
              <Refresh className="size-4" aria-hidden="true" />
              Reload latest profile
            </Button>
          </CardFooter>
        </Card>

        <Alert variant={currentProfile.emailVerified ? 'default' : 'destructive'}>
          {currentProfile.emailVerified ? (
            <CheckCircle color={"green"} className="size-4" aria-hidden="true" />
          ) : (
            <X className="size-4" aria-hidden="true" />
          )}
          <AlertTitle>{currentProfile.emailVerified ? 'Email verified' : 'Email not verified'}</AlertTitle>
          <AlertDescription>
            {currentProfile.emailVerified
              ? 'Your account can use protected booking features.'
              : 'Verify your email before using protected booking features.'}
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}

function ProfileInputField({ id, icon, label, value }: { id: string; icon: ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </Label>
      <Input id={id} value={value} readOnly className="bg-muted/40" />
    </div>
  );
}

function StatusRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card>
        <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 max-w-md" />
            <Skeleton className="h-5 max-w-sm" />
          </div>
        </div>
        </CardContent>
      </Card>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-60 rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-60 rounded-lg" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
