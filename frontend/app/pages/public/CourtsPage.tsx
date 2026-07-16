import { PageHeader } from "~/components/common/PageHeader";
import { EmptyState } from "~/components/common/EmptyState";
import { ErrorState } from "~/components/common/ErrorState";
import { LoadingState } from "~/components/common/LoadingState";
import { courtsApi } from "~/features/courts/api/courtsApi";
import { CourtCard } from "~/features/courts/components/CourtCard";
import type { Court } from "~/features/courts/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export default function CourtsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sportId = searchParams.get("sportId");
  const venueId = searchParams.get("venueId");
  const activeKeyword = searchParams.get("keyword") ?? "";

  const loadCourts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await courtsApi.getCourts({
        sportId,
        venueId,
        keyword: activeKeyword,
        status: "ACTIVE",
        page: 0,
        size: 12,
      });
      setCourts(getItems(response.data));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [activeKeyword, sportId, venueId]);

  useEffect(() => {
    setKeyword(activeKeyword);
  }, [activeKeyword]);

  useEffect(() => {
    void loadCourts();
  }, [loadCourts]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);

    if (keyword.trim()) {
      nextParams.set("keyword", keyword.trim());
    } else {
      nextParams.delete("keyword");
    }

    setSearchParams(nextParams);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách sân"
        description="Tìm sân theo môn, địa điểm hoặc từ khoá từ API public courts."
      />
      <form
        className="rounded-[20px] border border-border bg-card p-4"
        onSubmit={handleSearch}
      >
        <input
          className="min-h-11 w-full rounded-full border border-border bg-secondary px-4 text-sm outline-none placeholder:text-muted-foreground"
          name="keyword"
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên sân, môn hoặc địa điểm"
          type="search"
          value={keyword}
        />
      </form>
      {isLoading ? (
        <LoadingState label="Đang tải danh sách sân" />
      ) : errorMessage ? (
        <ErrorState description={errorMessage} onRetry={() => void loadCourts()} />
      ) : courts.length === 0 ? (
        <EmptyState
          title="Không tìm thấy sân"
          description="Không có sân phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <CourtCard court={court} key={court.id} />
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
  return error instanceof Error ? error.message : "Không tải được danh sách sân.";
}
