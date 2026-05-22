import { NavLink, Outlet } from 'react-router-dom';

import { routePaths } from '../routes/routePaths';

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
  const baseClassName = 'rounded-md px-3 py-2 text-sm font-medium no-underline transition';
  return isActive
    ? `${baseClassName} bg-brand-50 text-brand-700`
    : `${baseClassName} text-slate-600 hover:bg-slate-100 hover:text-slate-950`;
}

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <NavLink to={routePaths.home} className="text-lg font-semibold text-slate-950 no-underline">
                Sport Booking
              </NavLink>
              <div className="flex items-center gap-2 lg:hidden">
                <NavLink to={routePaths.login} className="text-sm font-semibold text-slate-700 no-underline">
                  Login
                </NavLink>
                <NavLink
                  to={routePaths.register}
                  className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-700"
                >
                  Register
                </NavLink>
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
              <NavLink to={routePaths.login} className="text-sm font-semibold text-slate-700 no-underline">
                Login
              </NavLink>
              <NavLink
                to={routePaths.register}
                className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-700"
              >
                Register
              </NavLink>
            </div>
          </div>

          <nav aria-label="Workspace navigation" className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {workspaceNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
