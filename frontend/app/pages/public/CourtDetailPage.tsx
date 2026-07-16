import { Calendar, MapPin } from "@gravity-ui/icons";
import { Button, Card, Chip } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { EmptyState } from "~/components/common/EmptyState";
import { ErrorState } from "~/components/common/ErrorState";
import { LoadingState } from "~/components/common/LoadingState";
import { PageHeader } from "~/components/common/PageHeader";
import { courtsApi } from "~/features/courts/api/courtsApi";
import type { Court } from "~/features/courts/types";
import { formatCurrency } from "~/lib/utils";

export default function CourtDetailPage() {
  const { id } = useParams();
  const [court, setCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCourt = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await courtsApi.getCourt(id);
      setCourt(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadCourt();
  }, [loadCourt]);

  if (isLoading) {
    return <LoadingState label="Đang tải chi tiết sân" />;
  }

  if (errorMessage) {
    return <ErrorState description={errorMessage} onRetry={() => void loadCourt()} />;
  }

  if (!court) {
    return (
      <EmptyState
        title="Không tìm thấy sân"
        description="Sân này không tồn tại hoặc đã ngừng hoạt động."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="aspect-[16/9] overflow-hidden rounded-[20px] border border-border bg-secondary">
          {court.primaryImageUrl ? (
            <img
              alt={court.name}
              className="h-full w-full object-cover"
              src={court.primaryImageUrl}
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Chưa có ảnh sân
            </div>
          )}
        </div>
        <PageHeader
          eyebrow={court.sportName ?? `Sân #${court.id}`}
          title={court.name}
          description={court.description ?? "Thông tin chi tiết sân thể thao."}
        />
      </section>
      <Card className="h-fit border border-border bg-card" variant="default">
        <Card.Content className="space-y-4 p-5">
          <Chip variant="primary">{court.status ?? "ACTIVE"}</Chip>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            {court.venueName ?? "Địa điểm đang cập nhật"}
          </p>
          {court.venueAddress ? (
            <p className="text-sm text-muted-foreground">{court.venueAddress}</p>
          ) : null}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-primary" aria-hidden="true" />
            {formatCurrency(court.pricePerHour)} / giờ
          </p>
          {court.venueOpeningTime && court.venueClosingTime ? (
            <p className="text-sm text-muted-foreground">
              Mở cửa: {court.venueOpeningTime} - {court.venueClosingTime}
            </p>
          ) : null}
          <Button fullWidth variant="primary">
            Chọn lịch đặt sân
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Không tải được chi tiết sân.";
}
