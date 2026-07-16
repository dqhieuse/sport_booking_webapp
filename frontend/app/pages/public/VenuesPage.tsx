import { PageHeader } from "~/components/common/PageHeader";
import { EmptyState } from "~/components/common/EmptyState";
import { ErrorState } from "~/components/common/ErrorState";
import { LoadingState } from "~/components/common/LoadingState";
import { venuesApi } from "~/features/venues/api/venuesApi";
import { VenueCard } from "~/features/venues/components/VenueCard";
import type { Venue } from "~/features/venues/types";
import { useCallback, useEffect, useState } from "react";

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadVenues = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await venuesApi.getVenues({ status: "ACTIVE", page: 0, size: 12 });
      setVenues(getItems(response.data));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVenues();
  }, [loadVenues]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Địa điểm"
        description="Danh sách địa điểm đang hoạt động, lấy trực tiếp từ API public venues."
      />
      {isLoading ? (
        <LoadingState label="Đang tải danh sách địa điểm" />
      ) : errorMessage ? (
        <ErrorState description={errorMessage} onRetry={() => void loadVenues()} />
      ) : venues.length === 0 ? (
        <EmptyState
          title="Chưa có địa điểm"
          description="Hiện chưa có địa điểm đang hoạt động để hiển thị."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

function getItems<T>(data: T[] | { items: T[] }) {
  return Array.isArray(data) ? data : data.items;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Không tải được danh sách địa điểm.";
}
