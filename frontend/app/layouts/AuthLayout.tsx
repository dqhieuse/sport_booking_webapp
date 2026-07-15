import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <Outlet />
    </main>
  );
}
