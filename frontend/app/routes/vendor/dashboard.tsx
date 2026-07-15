import VendorDashboardPage from "~/pages/vendor/VendorDashboardPage";
import { ProtectedRoute } from "~/features/auth/components/ProtectedRoute";

export default function VendorDashboardRoute() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <VendorDashboardPage />
    </ProtectedRoute>
  );
}
