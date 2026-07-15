import { Card } from "@heroui/react";

import { PageHeader } from "~/components/common/PageHeader";
import { useAuth } from "~/features/auth/AuthProvider";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description={`Xin chào ${user?.fullName ?? "Admin"}. Quản lý sports, users, vendors, venues, courts và bookings.`}
      />
      <Card className="border border-border bg-card">
        <Card.Content className="p-5 text-sm text-muted-foreground">
          Các bảng quản trị sẽ được thêm theo từng sprint/task cụ thể.
        </Card.Content>
      </Card>
    </div>
  );
}
