import BookingHistoryPage from "~/pages/auth/BookingHistoryPage";
import { ProtectedRoute } from "~/features/auth/components/ProtectedRoute";

export default function BookingHistoryRoute() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <BookingHistoryPage />
    </ProtectedRoute>
  );
}
