import { ChevronDown, Logout, UserCircle } from '@mynaui/icons-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

const primaryNavigation = [
  { label: 'Sports', to: routePaths.sports },
  { label: 'Courts', to: routePaths.courts },
  { label: 'How it works', to: routePaths.home },
];

const workspaceNavigation = [
  { label: 'My bookings', to: routePaths.bookingHistory },
  { label: 'Vendor', to: routePaths.vendorDashboard },
  { label: 'Admin', to: routePaths.adminDashboard },
];

const footerPublicLinks = primaryNavigation.filter((item) => item.to !== routePaths.home);
const currentYear = new Date().getFullYear();

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'px-4 py-2 text-sm font-black uppercase tracking-[0.22em] no-underline transition-colors duration-200 hover:no-underline',
    isActive
      ? 'text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="px-4 sm:px-8 lg:px-12">
          <div className="flex min-h-[72px] flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-center justify-between gap-4">
              <NavLink to={routePaths.home} className="font-display text-3xl font-black uppercase tracking-normal text-foreground no-underline">
                Arena<span className="text-primary">s</span>
              </NavLink>
              <div className="flex items-center gap-2 lg:hidden">
                <AuthActions compact />
              </div>
            </div>

            <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-1 lg:justify-center">
              {primaryNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* <nav aria-label="Workspace navigation" className="flex flex-wrap items-center gap-1 lg:ml-auto">
              {workspaceNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav> */}

            <div className="hidden items-center gap-3 lg:flex">
              <AuthActions />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_0.7fr_0.7fr]">
          <div className="max-w-md">
            <Link to={routePaths.home} className="font-display text-3xl font-black uppercase text-foreground no-underline">
              Arena<span className="text-primary">s</span>
            </Link>
            <p className="mt-4 max-w-56 text-sm font-semibold leading-6 text-muted-foreground">
              The platform for serious players. Book courts across 18 sports, seven days a week.
            </p>
          </div>

          <FooterLinkGroup title="Platform" links={footerPublicLinks} />
          <FooterLinkGroup title="Company" links={workspaceNavigation} />
        </div>

        <div className="mt-10 grid gap-4 border-t border-border pt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground lg:grid-cols-[1fr_auto] lg:items-center">
          <p>© {currentYear} Arenas. All rights reserved.</p>
          <p>Play more. Wait less.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: Array<{ label: string; to: string }> }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-black uppercase tracking-[0.22em] text-foreground">{title}</h2>
      <div className="mt-3 grid gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="w-fit text-sm font-semibold text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function AuthActions({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { isAuthenticated, session, logout } = useAuth();

  if (!isAuthenticated || !session) {
    return (
      <>
        <Button asChild variant="ghost" size="sm">
          <NavLink to={routePaths.login}>Sign in</NavLink>
        </Button>
        <Button asChild size="sm">
          <NavLink to={routePaths.register}>Book now</NavLink>
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
          className="inline-flex h-9 items-center gap-2 rounded-md border bg-background pe-2.5 ps-1.5 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar className="size-6">
            <AvatarImage src={session.user.avatarUrl || undefined} alt="" />
            <AvatarFallback className="text-[10px]">
              {initials || <UserCircle className="size-4" aria-hidden="true" />}
            </AvatarFallback>
          </Avatar>
          {!compact && <span className="max-w-32 truncate">{session.user.fullName}</span>}
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel asChild>
          <div className="px-3">
            <p className="text-lg text-foreground">{session.user.fullName}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {session.user.role === 'USER' && <MenuLink to={routePaths.profile} label="Profile" />}
        {session.user.role === 'VENDOR' && <MenuLink to={routePaths.vendorProfile} label="Profile" />}
        {session.user.role === 'ADMIN' && <MenuLink to={routePaths.adminProfile} label="Profile" />}
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
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <Logout className="size-4" aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuLink({ to, label }: { to: string; label: string }) {
  return (
    <DropdownMenuItem asChild>
      <Link to={to} className="cursor-pointer hover:no-underline">
        {label}
      </Link>
    </DropdownMenuItem>
  );
}
