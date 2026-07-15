import { Outlet } from "react-router";

import { AppFooter } from "~/components/navigation/AppFooter";
import { AppHeader } from "~/components/navigation/AppHeader";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
