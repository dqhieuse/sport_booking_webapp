import { ArrowRight, Search } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <div key={index} className="rounded-2xl border border-border/80 bg-card/80 p-4">
          <div className="h-32 rounded-xl bg-muted animate-soft-pulse" />
          <div className="mt-5 space-y-3">
            <div className="h-5 w-2/3 rounded-full bg-muted animate-soft-pulse" />
            <div className="h-4 w-full rounded-full bg-muted animate-soft-pulse" />
            <div className="h-4 w-4/5 rounded-full bg-muted animate-soft-pulse" />
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
            <Badge className="w-fit gap-2 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Book faster
            </Badge>

            <div className="max-w-4xl space-y-5">
              <h1 className="font-display text-4xl font-semibold leading-[1.06] text-foreground sm:text-5xl lg:text-6xl">
                Find your next court without the phone calls.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Explore sports, compare venues, and jump into available courts from one clean discovery screen.
              </p>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col items-stretch gap-2 rounded-[1.35rem] border border-border/80 bg-secondary/70 p-2 shadow-inner shadow-black/[0.03] transition focus-within:border-primary/35 focus-within:bg-card/90 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.08)] sm:flex-row sm:items-center dark:shadow-black/20"
            >
              <label className="sr-only" htmlFor="court-search">
                Search courts
              </label>
              <div className="flex flex-1 items-center gap-3 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <input
                  id="court-search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by court, venue, or sport"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" size="default" className="sm:mr-0">
                Search courts
                <ArrowRight className="h-5" aria-hidden="true" />
              </Button>
            </form>
          </div>
          <div className="hidden rounded-[1.5rem] border border-border/80 bg-secondary/60 p-5 lg:block">
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
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyDiscoveryMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
