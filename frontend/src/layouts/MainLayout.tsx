import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    'rounded-full border px-3 py-2 text-sm font-medium no-underline transition-colors',
    isActive
      ? 'border-primary/30 bg-primary/15 text-accent'
      : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground',
  );
}

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="app-container py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <NavLink to={routePaths.home} className="font-display text-lg font-extrabold text-foreground no-underline">
                Sport<span className="text-primary">Zone</span>
              </NavLink>
              <div className="flex items-center gap-2 lg:hidden">
                <Button asChild variant="ghost" size="sm">
                  <NavLink to={routePaths.login}>Login</NavLink>
                </Button>
                <Button asChild size="sm">
                  <NavLink to={routePaths.register}>Register</NavLink>
                </Button>
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
              <Button asChild variant="ghost">
                <NavLink to={routePaths.login}>Login</NavLink>
              </Button>
              <Button asChild>
                <NavLink to={routePaths.register}>Register</NavLink>
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <nav aria-label="Workspace navigation" className="flex flex-wrap gap-2">
            {workspaceNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-container py-8">
        <Outlet />
      </main>
    </div>
  );
}
