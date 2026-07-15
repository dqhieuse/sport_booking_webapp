import AdminDashboardPage from "~/pages/admin/AdminDashboardPage";
import { ProtectedRoute } from "~/features/auth/components/ProtectedRoute";

export default function AdminDashboardRoute() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardPage />
    </ProtectedRoute>
  );
}
