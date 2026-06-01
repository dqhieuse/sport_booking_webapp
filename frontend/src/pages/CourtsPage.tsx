import { Calendar, Search, X } from '@mynaui/icons-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { PaginationControls } from '@/components/pagination-controls';
import { getPublicCourts } from '@/features/courts/api/courtsApi';
import { CourtListCard } from '@/features/courts/components/CourtListCard';
import type { Court } from '@/features/courts/types';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import { getPublicVenues } from '@/features/venues/api/venuesApi';
import type { Venue } from '@/features/venues/types';
import type { PageResponse } from '@/types/api';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const COURT_PAGE_SIZE = 9;
const ALL_SPORTS_VALUE = 'all-sports';
const ALL_VENUES_VALUE = 'all-venues';

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
    <div className="rounded-lg border bg-card shadow-sm">
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
  const [venues, setVenues] = useState<Venue[]>([]);
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
        const [sportsResponse, venuesResponse] = await Promise.all([
          getPublicSports(controller.signal),
          getPublicVenues({ page: 0, size: 100 }, controller.signal),
        ]);

        setSports(sportsResponse.data);
        setVenues(venuesResponse.data.items);
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

  function handleClearFilters() {
    setKeywordInput('');
    setSearchParams(new URLSearchParams());
  }

  const courts = courtsPage?.items || [];
  const isLoading = loadState === 'loading' || loadState === 'idle';
  const isError = loadState === 'error';
  const isEmpty = loadState === 'success' && courts.length === 0;
  const hasCourts = loadState === 'success' && courts.length > 0;
  const hasActiveFilters = Boolean(keyword || sportId || venueId);

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
    <div className="page-shell">
      <section>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
              <Calendar className="size-3.5" aria-hidden="true" />
              Public Courts
            </Badge>
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Search and compare courts by sport, venue, and price.
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Public list only shows active courts, so guests can browse available booking options quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto_auto]">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Search courts</span>
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Court, venue, or sport"
                className="h-10 pl-10"
              />
            </label>

          <Select
            value={sportId ? String(sportId) : ALL_SPORTS_VALUE}
            onValueChange={(value) =>
              updateSearchParams({ sportId: value === ALL_SPORTS_VALUE ? undefined : value })
            }
            disabled={filterState === 'loading'}
          >
            <SelectTrigger aria-label="Filter by sport">
              <SelectValue placeholder="All sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SPORTS_VALUE}>All sports</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport.id} value={String(sport.id)}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={venueId ? String(venueId) : ALL_VENUES_VALUE}
            onValueChange={(value) =>
              updateSearchParams({ venueId: value === ALL_VENUES_VALUE ? undefined : value })
            }
            disabled={filterState === 'loading'}
          >
            <SelectTrigger aria-label="Filter by venue">
              <SelectValue placeholder="All venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VENUES_VALUE}>All venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={String(venue.id)}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

            <Button type="submit" className="my-auto">
              Search
            </Button>
            <Button type="button" variant="ghost" onClick={handleClearFilters} className="my-auto" disabled={!hasActiveFilters}>
              <X className="size-4" aria-hidden="true" />
              Clear
            </Button>
          </form>

          {filterState === 'error' && (
            <p className="mt-3 text-sm text-muted-foreground">
              Sport and venue filters could not be loaded. You can still search courts by keyword.
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
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
          icon={<Calendar className="size-6" aria-hidden="true" />}
          title="No courts match your search"
          description="Try a different keyword, sport, or venue filter to discover more active courts."
          className="max-w-none rounded-lg border bg-card"
        />
      )}

      {hasCourts && courtsPage && (
        <>
          <div>
            <p className="text-sm text-muted-foreground">Search results</p>
            <p className="font-display text-2xl font-semibold text-foreground">{resultSummary}</p>
          </div>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => (
              <CourtListCard key={court.id} court={court} />
            ))}
          </section>

          <PaginationControls
            page={courtsPage.page}
            totalPages={courtsPage.totalPages}
            totalItems={courtsPage.totalItems}
            itemLabel="courts"
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
