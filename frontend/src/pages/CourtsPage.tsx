import { Search } from '@mynaui/icons-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { PaginationControls } from '@/components/pagination-controls';
import { getPublicCourts } from '@/features/courts/api/courtsApi';
import { CourtListCard } from '@/features/courts/components/CourtListCard';
import type { Court } from '@/features/courts/types';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import type { PageResponse } from '@/types/api';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const COURT_PAGE_SIZE = 9;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load courts.';
}

function getNumberParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
}

function getPageParam(searchParams: URLSearchParams) {
  const value = searchParams.get('page');
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function CourtCardSkeleton() {
  return (
    <div className="arena-image-card min-h-[320px]">
      <Skeleton className="aspect-[16/10] rounded-b-none" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center justify-between border-t border-border/70 pt-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CourtsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '');
  const [courtsPage, setCourtsPage] = useState<PageResponse<Court> | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [filterState, setFilterState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const keyword = searchParams.get('keyword')?.trim() || undefined;
  const sportId = getNumberParam(searchParams, 'sportId');
  const venueId = getNumberParam(searchParams, 'venueId');
  const currentPage = getPageParam(searchParams);

  useEffect(() => {
    setKeywordInput(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFilters() {
      setFilterState('loading');

      try {
        const sportsResponse = await getPublicSports(controller.signal);

        setSports(sportsResponse.data);
        setFilterState('success');
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setFilterState('error');
      }
    }

    void loadFilters();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourts() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getPublicCourts(
          {
            keyword,
            sportId,
            venueId,
            page: currentPage,
            size: COURT_PAGE_SIZE,
          },
          controller.signal,
        );

        setCourtsPage(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setCourtsPage(null);
        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadCourts();

    return () => {
      controller.abort();
    };
  }, [currentPage, keyword, reloadKey, sportId, venueId]);

  function updateSearchParams(updates: Record<string, string | undefined>) {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    if (!('page' in updates)) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearchParams({ keyword: keywordInput.trim() || undefined });
  }

  function handlePageChange(nextPage: number) {
    updateSearchParams({ page: nextPage > 0 ? String(nextPage) : undefined });
  }

  const courts = courtsPage?.items || [];
  const isLoading = loadState === 'loading' || loadState === 'idle';
  const isError = loadState === 'error';
  const isEmpty = loadState === 'success' && courts.length === 0;
  const hasCourts = loadState === 'success' && courts.length > 0;

  const resultSummary = useMemo(() => {
    if (isLoading) {
      return 'Loading courts';
    }

    if (!courtsPage) {
      return 'No results yet';
    }

    return `${courtsPage.totalItems} courts found`;
  }, [courtsPage, isLoading]);

  return (
    <div className="arena-page">
      <section className="border-b border-border px-4 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="space-y-5">
            <p className="eyebrow">Browse & book</p>
            <div className="max-w-3xl space-y-4">
              <h1 className="arena-display-sm">
                All <span className="text-primary">courts.</span>
              </h1>
            </div>
          </div>

          <div className="space-y-8 lg:text-right">
            <p className="text-base font-semibold text-muted-foreground">{resultSummary}</p>
            <form onSubmit={handleSearchSubmit} className="ml-auto max-w-md border border-border bg-card p-4">
              <label className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Search courts</span>
                <Input
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder="Search courts, venues, locations..."
                  className="h-9 border-border bg-background pl-10"
                />
              </label>
            </form>
            <p className="text-base font-semibold text-muted-foreground">Sorted by: Availability</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => updateSearchParams({ sportId: undefined })}
            className={sportId ? 'arena-tab' : 'arena-tab arena-tab-active'}
          >
            All courts
          </button>
          {sports.slice(0, 5).map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => updateSearchParams({ sportId: String(sport.id) })}
              className={sportId === sport.id ? 'arena-tab arena-tab-active' : 'arena-tab'}
              disabled={filterState === 'loading'}
            >
              {sport.name}
            </button>
          ))}
        </div>

        {filterState === 'error' && (
          <p className="mt-4 text-sm font-semibold text-muted-foreground">
            Sport filters could not be loaded. You can still search courts by keyword.
          </p>
        )}
      </section>

      {isLoading && (
        <section className="grid gap-1 px-4 py-1 sm:px-8 md:grid-cols-2 lg:px-12 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <CourtCardSkeleton key={index} />
          ))}
        </section>
      )}

      {isError && (
        <ApiErrorMessage
          title="Unable to load courts"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {isEmpty && (
        <EmptyState
          icon={<Search className="size-6" aria-hidden="true" />}
          title="No courts match your search"
          description="Try a different keyword, sport, or venue filter to discover more active courts."
          className="mx-4 my-12 max-w-none border border-border bg-card sm:mx-8 lg:mx-12"
        />
      )}

      {hasCourts && courtsPage && (
        <>
          <section className="grid gap-1 px-4 py-1 sm:px-8 md:grid-cols-2 lg:px-12 xl:grid-cols-3">
            {courts.map((court) => (
              <CourtListCard key={court.id} court={court} />
            ))}
          </section>

          <div className="px-4 py-10 sm:px-8 lg:px-12">
            <PaginationControls
              page={courtsPage.page}
              totalPages={courtsPage.totalPages}
              totalItems={courtsPage.totalItems}
              itemLabel="courts"
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
