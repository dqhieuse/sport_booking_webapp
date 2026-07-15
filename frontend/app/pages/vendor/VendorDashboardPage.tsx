import { Card } from "@heroui/react";

import { PageHeader } from "~/components/common/PageHeader";
import { useAuth } from "~/features/auth/AuthProvider";

export default function VendorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Dashboard"
        description={`Xin chào ${user?.fullName ?? "Vendor"}. Quản lý địa điểm, sân, slot và booking của chủ sân.`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {["Địa điểm", "Sân", "Booking"].map((label) => (
          <Card className="border border-border bg-card" key={label}>
            <Card.Content className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">0</p>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}
