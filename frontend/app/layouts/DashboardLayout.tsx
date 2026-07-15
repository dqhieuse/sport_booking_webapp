import { Outlet } from "react-router";

import { AppHeader } from "~/components/navigation/AppHeader";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-[20px] border border-border bg-card p-4">
          <p className="text-sm font-semibold text-muted-foreground">Khu quản lý</p>
          <div className="mt-4 space-y-2 text-sm">
            <span className="block rounded-lg bg-muted px-3 py-2">Tổng quan</span>
            <span className="block rounded-lg px-3 py-2 text-muted-foreground">
              Danh sách
            </span>
            <span className="block rounded-lg px-3 py-2 text-muted-foreground">
              Cài đặt
            </span>
          </div>
        </aside>
        <section>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
