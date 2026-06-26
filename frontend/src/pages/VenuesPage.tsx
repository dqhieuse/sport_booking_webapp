import { Building, Search, X } from '@mynaui/icons-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { PaginationControls } from '@/components/pagination-controls';
import { getPublicVenues } from '@/features/venues/api/venuesApi';
import { VenueHighlightCard } from '@/features/venues/components/VenueHighlightCard';
import type { Venue } from '@/features/venues/types';
import type { PageResponse } from '@/types/api';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const VENUE_PAGE_SIZE = 9;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load venues.';
}

function getPageParam(searchParams: URLSearchParams) {
  const value = searchParams.get('page');
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function VenueCardSkeleton() {
  return (
    <div className="border border-border bg-card">
      <Skeleton className="h-36 rounded-b-none" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-8 w-36" />
      </div>
    </div>
  );
}

export function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') || '');
  const [venuesPage, setVenuesPage] = useState<PageResponse<Venue> | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const keyword = searchParams.get('keyword')?.trim() || undefined;
  const currentPage = getPageParam(searchParams);

  useEffect(() => {
    setKeywordInput(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVenues() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getPublicVenues(
          {
            keyword,
            page: currentPage,
            size: VENUE_PAGE_SIZE,
          },
          controller.signal,
        );

        setVenuesPage(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setVenuesPage(null);
        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadVenues();

    return () => {
      controller.abort();
    };
  }, [currentPage, keyword, reloadKey]);

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

  function handleClearSearch() {
    setKeywordInput('');
    setSearchParams(new URLSearchParams());
  }

  const venues = venuesPage?.items || [];
  const isLoading = loadState === 'loading' || loadState === 'idle';
  const isError = loadState === 'error';
  const isEmpty = loadState === 'success' && venues.length === 0;
  const hasVenues = loadState === 'success' && venues.length > 0;

  const resultSummary = useMemo(() => {
    if (isLoading) {
      return 'Loading venues';
    }

    if (!venuesPage) {
      return 'No results yet';
    }

    return `${venuesPage.totalItems} venues found`;
  }, [isLoading, venuesPage]);

  return (
    <div className="arena-page">
      <section className="border-b border-border px-4 py-14 sm:px-8 lg:px-12">
        <div className="space-y-5">
          <p className="eyebrow">Browse venues</p>
          <div className="max-w-3xl space-y-4">
            <h1 className="arena-display-sm">
              Active <span className="text-primary">venues.</span>
            </h1>
            <p className="max-w-xl text-base font-semibold leading-7 text-muted-foreground">
              Compare locations, opening hours, and available venue information from the public API.
            </p>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="mt-10 grid max-w-3xl gap-3 border border-border bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Search venues</span>
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Venue name or address"
                className="h-10 pl-10"
              />
            </label>

            <Button type="submit" className="my-auto">
              Search
            </Button>
            <Button type="button" variant="ghost" onClick={handleClearSearch} className="my-auto" disabled={!keyword}>
              <X className="size-4" aria-hidden="true" />
              Clear
            </Button>
        </form>
      </section>

      {isLoading && (
        <section className="grid gap-1 px-4 py-10 sm:px-8 md:grid-cols-2 lg:px-12 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <VenueCardSkeleton key={index} />
          ))}
        </section>
      )}

      {isError && (
        <ApiErrorMessage
          title="Unable to load venues"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {isEmpty && (
        <EmptyState
          icon={<Building className="size-6" aria-hidden="true" />}
          title="No venues match your search"
          description="Try another venue name or address to find more active places."
          className="mx-4 my-12 max-w-none border border-border bg-card sm:mx-8 lg:mx-12"
        />
      )}

      {hasVenues && venuesPage && (
        <>
          <div className="px-4 pt-10 sm:px-8 lg:px-12">
            <p className="eyebrow">Search results</p>
            <p className="mt-2 font-display text-4xl font-black uppercase text-foreground">{resultSummary}</p>
          </div>
          <section className="grid gap-1 px-4 py-8 sm:px-8 md:grid-cols-2 lg:px-12 xl:grid-cols-3">
            {venues.map((venue) => (
              <VenueHighlightCard key={venue.id} venue={venue} />
            ))}
          </section>

          <div className="px-4 py-10 sm:px-8 lg:px-12">
            <PaginationControls
              page={venuesPage.page}
              totalPages={venuesPage.totalPages}
              totalItems={venuesPage.totalItems}
              itemLabel="venues"
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
