import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { CourtDetailPage } from '../pages/CourtDetailPage';
import { CourtsPage } from '../pages/CourtsPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RoutePlaceholderPage } from '../pages/RoutePlaceholderPage';
import { SportsPage } from '../pages/SportsPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { routePaths } from './routePaths';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path={routePaths.sports}
            element={<SportsPage />}
          />
          <Route
            path={routePaths.venues}
            element={<RoutePlaceholderPage title="Venues" description="Browse sport venues and locations." />}
          />
          <Route
            path={routePaths.courts}
            element={<CourtsPage />}
          />
          <Route
            path={routePaths.courtDetail}
            element={<CourtDetailPage />}
          />
          <Route
            path={routePaths.login}
            element={<RoutePlaceholderPage title="Log in" description="Authenticate users, vendors, and admins." />}
          />
          <Route
            path={routePaths.register}
            element={<RegisterPage />}
          />
          <Route
            path={routePaths.verifyEmail}
            element={<VerifyEmailPage />}
          />
          <Route
            path={routePaths.profile}
            element={<RoutePlaceholderPage title="Profile" description="Manage the logged-in user's profile." />}
          />
          <Route
            path={routePaths.bookingHistory}
            element={<RoutePlaceholderPage title="Booking history" description="Review bookings and cancellation status." />}
          />
          <Route
            path={routePaths.vendorDashboard}
            element={<RoutePlaceholderPage title="Vendor dashboard" description="Overview of vendor venues, courts, and bookings." />}
          />
          <Route
            path={routePaths.vendorVenues}
            element={<RoutePlaceholderPage title="Vendor venues" description="Manage venues owned by the current vendor." />}
          />
          <Route
            path={routePaths.vendorCourts}
            element={<RoutePlaceholderPage title="Vendor courts" description="Manage courts, prices, images, and time slots." />}
          />
          <Route
            path={routePaths.vendorBookings}
            element={<RoutePlaceholderPage title="Vendor bookings" description="Confirm, cancel, and manage venue bookings." />}
          />
          <Route
            path={routePaths.adminDashboard}
            element={<RoutePlaceholderPage title="Admin dashboard" description="Platform overview for administrators." />}
          />
          <Route
            path={routePaths.adminSports}
            element={<RoutePlaceholderPage title="Admin sports" description="Manage sport categories." />}
          />
          <Route
            path={routePaths.adminUsers}
            element={<RoutePlaceholderPage title="Admin users" description="Manage users, vendors, and account status." />}
          />
          <Route
            path={routePaths.adminVenues}
            element={<RoutePlaceholderPage title="Admin venues" description="Moderate venue information." />}
          />
          <Route
            path={routePaths.adminCourts}
            element={<RoutePlaceholderPage title="Admin courts" description="Moderate court information." />}
          />
          <Route
            path={routePaths.adminBookings}
            element={<RoutePlaceholderPage title="Admin bookings" description="Review platform bookings." />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
