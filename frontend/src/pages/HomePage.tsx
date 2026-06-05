import { ArrowRight, Calendar, MapPin, Search } from '@mynaui/icons-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { Input } from '@/components/ui/input';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { getPublicCourts } from '@/features/courts/api/courtsApi';
import { CourtSuggestionCard } from '@/features/courts/components/CourtSuggestionCard';
import type { Court } from '@/features/courts/types';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import { getPublicVenues } from '@/features/venues/api/venuesApi';
import { VenueHighlightCard } from '@/features/venues/components/VenueHighlightCard';
import type { Venue } from '@/features/venues/types';
import { routePaths } from '@/routes/routePaths';

type DiscoveryState = {
  sports: Sport[];
  venues: Venue[];
  courts: Court[];
};

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const emptyDiscoveryState: DiscoveryState = {
  sports: [],
  venues: [],
  courts: [],
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load discovery data.';
}

function DiscoverySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <Skeleton className="h-32 rounded-md" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [discovery, setDiscovery] = useState<DiscoveryState>(emptyDiscoveryState);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDiscovery() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [sportsResponse, venuesResponse, courtsResponse] = await Promise.all([
          getPublicSports(controller.signal),
          getPublicVenues({ page: 0, size: 3 }, controller.signal),
          getPublicCourts({ page: 0, size: 3 }, controller.signal),
        ]);

        setDiscovery({
          sports: sportsResponse.data.slice(0, 6),
          venues: venuesResponse.data.items,
          courts: courtsResponse.data.items,
        });
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setDiscovery(emptyDiscoveryState);
        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadDiscovery();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  const totalDiscoveryItems = useMemo(
    () => discovery.sports.length + discovery.venues.length + discovery.courts.length,
    [discovery.courts.length, discovery.sports.length, discovery.venues.length],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedKeyword = keyword.trim();
    const search = normalizedKeyword ? `?keyword=${encodeURIComponent(normalizedKeyword)}` : '';
    navigate(`${routePaths.courts}${search}`);
  }

  const isLoading = loadState === 'loading' || loadState === 'idle';
  const isError = loadState === 'error';
  const hasDiscoveryData = loadState === 'success' && totalDiscoveryItems > 0;

  return (
    <div className="page-shell">
      <section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-7">
            <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
              <Calendar className="size-3.5" aria-hidden="true" />
              Book faster
            </Badge>

            <div className="max-w-4xl space-y-5">
              <h1 className="font-display text-4xl font-semibold leading-[1.06] text-foreground sm:text-5xl lg:text-6xl">
                Find your next court without the phone calls
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Explore sports, compare venues, and jump into available courts from one clean discovery screen.
              </p>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col items-stretch gap-2 rounded-lg border bg-background p-2 shadow-sm sm:flex-row sm:items-center"
            >
              <label className="sr-only" htmlFor="court-search">
                Search courts
              </label>
              <div className="flex flex-1 items-center gap-3 px-4 py-3">
                <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="court-search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by court, venue, or sport"
                  className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button type="submit" size="default" className="sm:mr-0">
                Search courts
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
          <div className="hidden rounded-lg border bg-card p-5 shadow-sm lg:block">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Sports" value={isLoading ? '...' : String(discovery.sports.length)} />
              <Metric label="Venues" value={isLoading ? '...' : String(discovery.venues.length)} />
              <Metric label="Courts" value={isLoading ? '...' : String(discovery.courts.length)} />
              <Metric label="Flow" value="Fast" />
            </div>
          </div>
        </div>
      </section>

      {isError && (
        <ApiErrorMessage
          title="Unable to load discovery data"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {isLoading && (
        <section className="space-y-4">
          <SectionHeader eyebrow="Loading" title="Preparing discovery" to={routePaths.courts} />
          <DiscoverySkeleton />
        </section>
      )}

      {hasDiscoveryData && (
        <>
          <section className="space-y-5">
            <SectionHeader eyebrow="Sports" title="Start by category" to={routePaths.sports} />
            <div className="flex flex-wrap gap-3">
              {discovery.sports.map((sport) => (
                <Button key={sport.id} asChild variant="secondary">
                  <Link to={`${routePaths.courts}?sportId=${sport.id}`}>
                    {sport.name}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeader eyebrow="Venues" title="Featured places" to={routePaths.venues} />
            {discovery.venues.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {discovery.venues.map((venue) => (
                  <VenueHighlightCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <EmptyDiscoveryMessage message="No active venues are available yet." />
            )}
          </section>

          <section className="space-y-5">
            <SectionHeader eyebrow="Courts" title="Ready to compare" to={routePaths.courts} />
            {discovery.courts.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {discovery.courts.map((court) => (
                  <CourtSuggestionCard key={court.id} court={court} />
                ))}
              </div>
            ) : (
              <EmptyDiscoveryMessage message="No active courts are available yet." />
            )}
          </section>
        </>
      )}
    </div>
  );
}

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  to: string;
};

function SectionHeader({ eyebrow, title, to }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-1">{title}</h2>
      </div>
      <Button asChild variant="ghost" className="w-fit">
        <Link to={to}>
          View all
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyDiscoveryMessage({ message }: { message: string }) {
  return (
    <EmptyState
      icon={<MapPin className="size-6" aria-hidden="true" />}
      title="Nothing to show yet"
      description={message}
      className="max-w-none rounded-lg border bg-card py-10"
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
