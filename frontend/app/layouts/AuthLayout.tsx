import { Outlet } from "react-router";

import { GuestOnlyRoute } from "~/features/auth/components/ProtectedRoute";

export default function AuthLayout() {
  return (
    <GuestOnlyRoute>
      <main className="min-h-screen bg-white text-[#111111]">
        <Outlet />
      </main>
    </GuestOnlyRoute>
  );
}
