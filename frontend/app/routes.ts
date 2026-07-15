import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/PublicLayout.tsx", [
    index("routes/home.tsx"),
    route("sports", "routes/sports.tsx"),
    route("courts", "routes/courts.tsx"),
    route("courts/:id", "routes/court-detail.tsx"),
    route("venues", "routes/venues.tsx"),
    route("venues/:id", "routes/venue-detail.tsx"),
    route("profile", "routes/auth/profile.tsx"),
    route("bookings", "routes/auth/booking-history.tsx"),
  ]),
  layout("layouts/AuthLayout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("verify-email", "routes/auth/verify-email.tsx"),
    route("verify-email/success", "routes/auth/verify-email-success.tsx"),
    route("verify-email/failed", "routes/auth/verify-email-failed.tsx"),
  ]),
  layout("layouts/DashboardLayout.tsx", [
    ...prefix("vendor", [index("routes/vendor/dashboard.tsx")]),
    ...prefix("admin", [index("routes/admin/dashboard.tsx")]),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
