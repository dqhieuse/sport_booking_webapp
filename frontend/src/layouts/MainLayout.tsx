import { ChevronDown, Mail, MapPin, Phone, LogOut, UserCircle } from 'lucide-react';
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

const footerPublicLinks = primaryNavigation.filter((item) => item.to !== routePaths.home);
const currentYear = new Date().getFullYear();

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'px-1.5 py-1 text-xs font-normal no-underline transition-colors duration-200',
    isActive
      ? 'text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-[20px] backdrop-saturate-[180%]">
        <div className="app-container">
          <div className="flex min-h-11 flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">
            <div className="flex items-center justify-between gap-4">
              <NavLink to={routePaths.home} className="font-display text-sm font-semibold text-foreground no-underline">
                SportZone
              </NavLink>
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggle />
                <AuthActions compact />
              </div>
            </div>

            <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center">
              {primaryNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <nav aria-label="Workspace navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:ml-auto">
              {workspaceNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <AuthActions />
            </div>
          </div>
        </div>
      </header>

      <main className="app-container flex-1 py-8 sm:py-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-border/70 bg-secondary">
      <div className="app-container py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div className="max-w-md">
            <Link to={routePaths.home} className="font-display text-lg font-semibold text-foreground no-underline">
              SportZone
            </Link>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A clean sport booking experience for browsing courts, comparing venues, and managing reservations.
            </p>
          </div>

          <FooterLinkGroup title="Explore" links={footerPublicLinks} />
          <FooterLinkGroup title="Workspace" links={workspaceNavigation} />
        </div>

        <div className="mt-8 grid gap-4 border-t border-border/70 pt-6 text-sm text-muted-foreground lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Ha Noi City, Vietnam
            </span>
            <a href="mailto:dqhieuse@gmail.com" className="inline-flex items-center gap-2 no-underline hover:text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              dqhieuse@gmail.com
            </a>
            <a href="tel:+84849046707" className="inline-flex items-center gap-2 no-underline hover:text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              +84 849 046 707
            </a>
          </div>

          <p className="text-xs">© {currentYear} SportZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: Array<{ label: string; to: string }> }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3 grid gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="w-fit text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
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
        <Button asChild variant="ghost" size={"sm"}>
          <NavLink to={routePaths.login}>Login</NavLink>
        </Button>
        <Button asChild size={"sm"}>
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
          className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-secondary pe-2.5 ps-1 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
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
          <div className="px-3">
            <p className="text-lg text-foreground">{session.user.fullName}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <MenuLink to={routePaths.profile} label="Profile"/>
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
      <Link to={to} className="cursor-pointer hover:no-underline">
        {label}
      </Link>
    </DropdownMenuItem>
  );
}
