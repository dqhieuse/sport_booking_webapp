import { Mail, ShieldCheck, UserCircle } from '@mynaui/icons-react';

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

export function AdminProfilePage() {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  const user = session.user;
  const initials = getInitials(user.fullName);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-3">
          <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Admin profile
          </Badge>
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Hồ sơ tài khoản admin.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Trang profile riêng cho quản trị viên, tách khỏi profile user và vendor.
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
              <Badge className="mb-3 w-fit gap-2">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Admin account
              </Badge>
              <h2 className="break-words font-display text-2xl font-semibold">{user.fullName}</h2>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" />
                {user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin permissions</CardTitle>
            <CardDescription>Tài khoản này chỉ truy cập nhóm route admin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}
