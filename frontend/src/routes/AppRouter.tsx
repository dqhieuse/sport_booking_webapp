import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { VendorLayout } from '../layouts/VendorLayout';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { BookingDetailPage } from '../pages/BookingDetailPage';
import { BookingHistoryPage } from '../pages/BookingHistoryPage';
import { BookingResultPage } from '../pages/BookingResultPage';
import { CourtDetailPage } from '../pages/CourtDetailPage';
import { CourtsPage } from '../pages/CourtsPage';
import { CreateBookingPage } from '../pages/CreateBookingPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { RoutePlaceholderPage } from '../pages/RoutePlaceholderPage';
import { SportsPage } from '../pages/SportsPage';
import { VenueDetailPage } from '../pages/VenueDetailPage';
import { VenuesPage } from '../pages/VenuesPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { VendorCourtSlotsPage } from '../pages/vendor/VendorCourtSlotsPage';
import { VendorCourtCreatePage } from '../pages/vendor/VendorCourtCreatePage';
import { VendorCourtEditPage } from '../pages/vendor/VendorCourtEditPage';
import { VendorCourtsPage } from '../pages/vendor/VendorCourtsPage';
import { VendorDashboardPage } from '../pages/vendor/VendorDashboardPage';
import { VendorImageCreatePage } from '../pages/vendor/VendorImageCreatePage';
import { VendorImagesPage } from '../pages/vendor/VendorImagesPage';
import { VendorProfilePage } from '../pages/vendor/VendorProfilePage';
import { VendorBookingCreatePage } from '../pages/vendor/VendorBookingCreatePage';
import { VendorBookingDetailPage } from '../pages/vendor/VendorBookingDetailPage';
import { VendorBookingsPage } from '../pages/vendor/VendorBookingsPage';
import { VendorVenueCreatePage } from '../pages/vendor/VendorVenueCreatePage';
import { VendorVenueEditPage } from '../pages/vendor/VendorVenueEditPage';
import { VendorVenuesPage } from '../pages/vendor/VendorVenuesPage';
import { ProtectedRoute, PublicOnlyRoute, RoleRestrictedRoute } from './ProtectedRoute';
import { routePaths } from './routePaths';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route element={<RoleRestrictedRoute blockedRoles={['VENDOR', 'ADMIN']} />}>
            <Route index element={<HomePage />} />
            <Route
              path={routePaths.sports}
              element={<SportsPage />}
            />
            <Route
              path={routePaths.venues}
              element={<VenuesPage />}
            />
            <Route
              path={routePaths.venueDetail}
              element={<VenueDetailPage />}
            />
            <Route
              path={routePaths.courts}
              element={<CourtsPage />}
            />
            <Route
              path={routePaths.courtDetail}
              element={<CourtDetailPage />}
            />
          </Route>
          <Route element={<PublicOnlyRoute />}>
            <Route
              path={routePaths.login}
              element={<LoginPage />}
            />
            <Route
              path={routePaths.register}
              element={<RegisterPage />}
            />
          </Route>
          <Route
            path={routePaths.verifyEmail}
            element={<VerifyEmailPage />}
          />
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route
              path={routePaths.profile}
              element={<ProfilePage />}
            />
            <Route
              path={routePaths.bookingHistory}
              element={<BookingHistoryPage />}
            />
            <Route
              path={routePaths.bookingCreate}
              element={<CreateBookingPage />}
            />
            <Route
              path={routePaths.bookingResult}
              element={<BookingResultPage />}
            />
            <Route
              path={routePaths.bookingDetail}
              element={<BookingDetailPage />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
          <Route element={<VendorLayout />}>
            <Route
              path={routePaths.vendorDashboard}
              element={<VendorDashboardPage />}
            />
            <Route
              path={routePaths.vendorProfile}
              element={<VendorProfilePage />}
            />
            <Route
              path={routePaths.vendorVenues}
              element={<VendorVenuesPage />}
            />
            <Route
              path={routePaths.vendorVenueCreate}
              element={<VendorVenueCreatePage />}
            />
            <Route
              path={routePaths.vendorVenueEdit}
              element={<VendorVenueEditPage />}
            />
            <Route
              path={routePaths.vendorCourts}
              element={<VendorCourtsPage />}
            />
            <Route
              path={routePaths.vendorCourtCreate}
              element={<VendorCourtCreatePage />}
            />
            <Route
              path={routePaths.vendorCourtEdit}
              element={<VendorCourtEditPage />}
            />
            <Route
              path={routePaths.vendorImages}
              element={<VendorImagesPage />}
            />
            <Route
              path={routePaths.vendorImageCreate}
              element={<VendorImageCreatePage />}
            />
            <Route
              path={routePaths.vendorSlots}
              element={<VendorCourtSlotsPage />}
            />
            <Route
              path={routePaths.vendorBookings}
              element={<VendorBookingsPage />}
            />
            <Route
              path={routePaths.vendorBookingCreate}
              element={<VendorBookingCreatePage />}
            />
            <Route
              path={routePaths.vendorBookingDetail}
              element={<VendorBookingDetailPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route
            path={routePaths.adminDashboard}
            element={<RoutePlaceholderPage title="Admin dashboard" description="Platform overview for administrators." />}
          />
          <Route
            path={routePaths.adminProfile}
            element={<AdminProfilePage />}
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
