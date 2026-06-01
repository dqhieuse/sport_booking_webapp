import { Building, Search, X } from '@mynaui/icons-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="rounded-lg border bg-card shadow-sm">
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
    <div className="page-shell">
      <section>
        <div className="space-y-5">
          <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
            <Building className="size-3.5" aria-hidden="true" />
            Public Venues
          </Badge>
          <div className="max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Browse active venues before choosing a court.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Compare locations, opening hours, and available venue information from the public API.
            </p>
          </div>
        </div>
      </section>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
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
        </CardContent>
      </Card>

      {isLoading && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          className="max-w-none rounded-lg border bg-card"
        />
      )}

      {hasVenues && venuesPage && (
        <>
          <div>
            <p className="text-sm text-muted-foreground">Search results</p>
            <p className="font-display text-2xl font-semibold text-foreground">{resultSummary}</p>
          </div>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => (
              <VenueHighlightCard key={venue.id} venue={venue} />
            ))}
          </section>

          <PaginationControls
            page={venuesPage.page}
            totalPages={venuesPage.totalPages}
            totalItems={venuesPage.totalItems}
            itemLabel="venues"
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
