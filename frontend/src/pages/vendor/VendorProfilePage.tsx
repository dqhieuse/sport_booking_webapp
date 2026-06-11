import { ShieldCheck, UserCircle } from '@mynaui/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/useAuth';

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function VendorProfilePage() {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  const user = session.user;
  const initials = getInitials(user.fullName);

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Profile Vendor Account
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Information about the vendor account, separate from the user profile which is shared between user and vendor.
          </p>
        </div>
      </section>

      <Card>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[auto_1fr] lg:items-center">
          <Avatar className="size-24 rounded-xl border">
            <AvatarImage src={user.avatarUrl || undefined} alt="" />
            <AvatarFallback className="rounded-xl text-2xl">
              {initials || <UserCircle className="size-10" aria-hidden="true" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Badge variant={"outline"} className="mb-2 w-fit gap-1 px-2">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Vendor account
            </Badge>
            <h2 className="break-words font-display text-2xl font-semibold">{user.fullName}</h2>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                {user.email}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor permissions</CardTitle>
          <CardDescription>Tài khoản này chỉ truy cập được workspace vendor và các trang profile liên quan.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
