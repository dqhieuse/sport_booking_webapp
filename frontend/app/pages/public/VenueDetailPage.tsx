import { Button, Card, Chip } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { EmptyState } from "~/components/common/EmptyState";
import { ErrorState } from "~/components/common/ErrorState";
import { LoadingState } from "~/components/common/LoadingState";
import { PageHeader } from "~/components/common/PageHeader";
import { venuesApi } from "~/features/venues/api/venuesApi";
import type { Venue } from "~/features/venues/types";
import { routePaths } from "~/routes/routePaths";

export default function VenueDetailPage() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadVenue = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await venuesApi.getVenue(id);
      setVenue(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadVenue();
  }, [loadVenue]);

  if (isLoading) {
    return <LoadingState label="Đang tải chi tiết địa điểm" />;
  }

  if (errorMessage) {
    return <ErrorState description={errorMessage} onRetry={() => void loadVenue()} />;
  }

  if (!venue) {
    return (
      <EmptyState
        title="Không tìm thấy địa điểm"
        description="Địa điểm này không tồn tại hoặc đã ngừng hoạt động."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="aspect-[16/7] overflow-hidden rounded-[20px] border border-border bg-secondary">
        {venue.primaryImageUrl ? (
          <img
            alt={venue.name}
            className="h-full w-full object-cover"
            src={venue.primaryImageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Chưa có ảnh địa điểm
          </div>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PageHeader
          eyebrow={venue.address}
          title={venue.name}
          description={venue.description ?? "Thông tin chi tiết địa điểm thể thao."}
        />
        <Card className="border border-border bg-card" variant="default">
          <Card.Content className="space-y-4 p-5">
            <Chip variant="primary">{venue.status ?? "ACTIVE"}</Chip>
            <p className="text-sm text-muted-foreground">
              Mở cửa: {venue.openingTime ?? "--:--"} - {venue.closingTime ?? "--:--"}
            </p>
            {venue.phone ? (
              <p className="text-sm text-muted-foreground">Liên hệ: {venue.phone}</p>
            ) : null}
            {venue.vendor?.fullName ? (
              <p className="text-sm text-muted-foreground">
                Chủ sân: {venue.vendor.fullName}
              </p>
            ) : null}
            <Button fullWidth variant="primary">
              <a href={`${routePaths.courts}?venueId=${venue.id}`}>Xem sân tại đây</a>
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Không tải được chi tiết địa điểm.";
}
