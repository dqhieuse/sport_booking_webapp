import { Button, Card, Chip } from "@heroui/react";
import { useParams } from "react-router";

import { PageHeader } from "~/components/common/PageHeader";
import { routePaths } from "~/routes/routePaths";

export default function VenueDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="aspect-[16/7] rounded-[20px] border border-border bg-secondary" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PageHeader
          eyebrow={`Địa điểm #${id}`}
          title="SportZone Arena"
          description="Trang chi tiết địa điểm có khu ảnh, thông tin và danh sách sân thuộc địa điểm."
        />
        <Card className="border border-border bg-card" variant="default">
          <Card.Content className="space-y-4 p-5">
            <Chip variant="primary">ACTIVE</Chip>
            <p className="text-sm text-muted-foreground">
              Mở cửa: 06:00 - 22:00
            </p>
            <Button fullWidth variant="primary">
              <a href={routePaths.courts}>Xem sân tại đây</a>
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
