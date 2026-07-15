import { Card, Typography } from "@heroui/react";

import { PageHeader } from "~/components/common/PageHeader";
import { useAuth } from "~/features/auth/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Thông tin tài khoản đang đăng nhập."
      />
      <Card className="border border-border bg-card" variant="default">
        <Card.Content className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          <ProfileField label="Họ và tên" value={user?.fullName} />
          <ProfileField label="Email" value={user?.email} />
          <ProfileField label="Số điện thoại" value={user?.phone} />
          <ProfileField label="Vai trò" value={user?.role} />
          <ProfileField
            label="Trạng thái email"
            value={user?.emailVerified ? "Đã xác minh" : "Chưa xác minh"}
          />
          <ProfileField label="Trạng thái tài khoản" value={user?.status} />
        </Card.Content>
      </Card>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-default p-4">
      <Typography.Paragraph className="text-[12px] leading-4 text-muted" size="xs">
        {label}
      </Typography.Paragraph>
      <Typography className="mt-1 text-[14px] font-medium text-[#18181b]">
        {value || "Chưa cập nhật"}
      </Typography>
    </div>
  );
}
