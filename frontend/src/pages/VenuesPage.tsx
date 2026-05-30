import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="rounded-2xl border border-border/80 bg-card/80 shadow-sm">
      <div className="h-36 rounded-t-2xl bg-muted animate-soft-pulse" />
      <div className="space-y-4 p-5">
        <div className="h-6 w-2/3 rounded-full bg-muted animate-soft-pulse" />
        <div className="h-4 w-full rounded-full bg-muted animate-soft-pulse" />
        <div className="h-4 w-4/5 rounded-full bg-muted animate-soft-pulse" />
        <div className="h-8 w-36 rounded-full bg-muted animate-soft-pulse" />
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
          <Badge className="w-fit gap-2 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
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

      <section className="sportzone-panel rounded-3xl p-3 sm:p-4">
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="soft-input flex h-12 items-center gap-3 rounded-full px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="sr-only">Search venues</span>
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Venue name or address"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
            />
          </label>

          <Button type="submit" className="my-auto">
            Search
          </Button>
          <Button type="button" variant="ghost" onClick={handleClearSearch} className="my-auto" disabled={!keyword}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </Button>
        </form>
      </section>

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
        <section className="sportzone-panel rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">No venues match your search</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Try another venue name or address to find more active places.
          </p>
        </section>
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

          <section className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {venuesPage.page + 1} of {Math.max(venuesPage.totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={venuesPage.page <= 0}
                onClick={() => handlePageChange(venuesPage.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={venuesPage.page + 1 >= venuesPage.totalPages}
                onClick={() => handlePageChange(venuesPage.page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
