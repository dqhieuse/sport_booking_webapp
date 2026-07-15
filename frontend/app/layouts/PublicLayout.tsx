import { Outlet } from "react-router";

import { AppHeader } from "~/components/navigation/AppHeader";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
