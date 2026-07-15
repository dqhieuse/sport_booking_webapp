import ProfilePage from "~/pages/auth/ProfilePage";
import { ProtectedRoute } from "~/features/auth/components/ProtectedRoute";

export default function ProfileRoute() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
