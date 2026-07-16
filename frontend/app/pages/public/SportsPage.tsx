import { PageHeader } from "~/components/common/PageHeader";
import { EmptyState } from "~/components/common/EmptyState";
import { ErrorState } from "~/components/common/ErrorState";
import { LoadingState } from "~/components/common/LoadingState";
import { sportsApi } from "~/features/sports/api/sportsApi";
import { SportCard } from "~/features/sports/components/SportCard";
import type { Sport } from "~/features/sports/types";
import { useCallback, useEffect, useState } from "react";

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await sportsApi.getSports();
      setSports(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSports();
  }, [loadSports]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Môn thể thao"
        description="Chọn môn thể thao để xem danh sách sân đang hoạt động."
      />
      {isLoading ? (
        <LoadingState label="Đang tải danh sách môn thể thao" />
      ) : errorMessage ? (
        <ErrorState description={errorMessage} onRetry={() => void loadSports()} />
      ) : sports.length === 0 ? (
        <EmptyState
          title="Chưa có môn thể thao"
          description="Hệ thống chưa có môn thể thao đang hoạt động để hiển thị."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </div>
      )}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Không tải được danh sách môn thể thao.";
}
