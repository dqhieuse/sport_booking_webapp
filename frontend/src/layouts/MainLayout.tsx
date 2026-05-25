import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/useAuth';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

const primaryNavigation = [
  { label: 'Home', to: routePaths.home },
  { label: 'Sports', to: routePaths.sports },
  { label: 'Venues', to: routePaths.venues },
  { label: 'Courts', to: routePaths.courts },
];

const workspaceNavigation = [
  { label: 'My bookings', to: routePaths.bookingHistory },
  { label: 'Vendor', to: routePaths.vendorDashboard },
  { label: 'Admin', to: routePaths.adminDashboard },
];

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-full border px-3 py-2 text-sm font-medium no-underline transition-[background,border-color,color,transform] duration-200 hover:-translate-y-0.5 active:translate-y-0',
    isActive
      ? 'border-primary/25 bg-primary/10 text-primary shadow-sm'
      : 'border-transparent text-muted-foreground hover:border-border/80 hover:bg-secondary/80 hover:text-foreground',
  );
}

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-2xl">
        <div className="app-container py-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <NavLink to={routePaths.home} className="font-display text-lg font-semibold text-foreground no-underline">
                Sport<span className="text-primary">Zone</span>
              </NavLink>
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggle />
                <AuthActions compact />
              </div>
            </div>

            <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
              {primaryNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <ThemeToggle />
              <AuthActions />
            </div>
          </div>

          <Separator className="my-3 bg-border/70" />

          <nav aria-label="Workspace navigation" className="flex flex-wrap gap-2">
            {workspaceNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-container py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AuthActions({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { isAuthenticated, session, logout } = useAuth();

  if (!isAuthenticated || !session) {
    return (
      <>
        <Button asChild variant="ghost" size={compact ? 'sm' : 'default'}>
          <NavLink to={routePaths.login}>Login</NavLink>
        </Button>
        <Button asChild size={compact ? 'sm' : 'default'}>
          <NavLink to={routePaths.register}>Register</NavLink>
        </Button>
      </>
    );
  }

  const initials = session.user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  async function handleLogout() {
    await logout();
    navigate(routePaths.home);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-secondary px-2.5 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {session.user.avatarUrl ? (
              <img
                src={session.user.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials || <UserCircle className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          {!compact && <span className="max-w-32 truncate">{session.user.fullName}</span>}
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel asChild>
          <div className="px-3 py-3">
            <p className="truncate text-base font-semibold text-foreground">{session.user.fullName}</p>
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{session.user.email}</p>
            <p className="mt-2 w-fit rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {session.user.role}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <MenuLink to={routePaths.profile} label="Profile" />
        <MenuLink to={routePaths.bookingHistory} label="My bookings" />
        {session.user.role === 'VENDOR' && (
          <MenuLink to={routePaths.vendorDashboard} label="Vendor dashboard" />
        )}
        {session.user.role === 'ADMIN' && (
          <MenuLink to={routePaths.adminDashboard} label="Admin dashboard" />
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            void handleLogout();
          }}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuLink({ to, label }: { to: string; label: string }) {
  return (
    <DropdownMenuItem asChild>
      <Link to={to} className="no-underline">
        {label}
      </Link>
    </DropdownMenuItem>
  );
}
