import { Calendar, MapPin } from "@gravity-ui/icons";
import { Button, Card, Chip } from "@heroui/react";
import { useParams } from "react-router";

import { PageHeader } from "~/components/common/PageHeader";
import { formatCurrency } from "~/lib/utils";

export default function CourtDetailPage() {
  const { id } = useParams();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="aspect-[16/9] rounded-[20px] border border-border bg-secondary" />
        <PageHeader
          eyebrow={`Sân #${id}`}
          title="Sân thể thao mẫu"
          description="Trang chi tiết đã có vùng ảnh, thông tin sân và entry đặt lịch để tích hợp API available slots."
        />
      </section>
      <Card className="h-fit border border-border bg-card" variant="default">
        <Card.Content className="space-y-4 p-5">
          <Chip variant="primary">ACTIVE</Chip>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            SportZone Arena
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-primary" aria-hidden="true" />
            {formatCurrency(350000)} / giờ
          </p>
          <Button fullWidth variant="primary">
            Chọn lịch đặt sân
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
