import { ArrowRight, CalendarDays, MapPin, Search, Trophy } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <div key={index} className="rounded-lg border border-border bg-card p-5">
          <div className="h-32 rounded-md bg-muted" />
          <div className="mt-5 space-y-3">
            <div className="h-5 w-2/3 rounded-full bg-muted" />
            <div className="h-4 w-full rounded-full bg-muted" />
            <div className="h-4 w-4/5 rounded-full bg-muted" />
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
    <div className="space-y-14">
      <section className="border-b border-border pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-7">
            <Badge className="w-fit gap-2 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Book faster
            </Badge>

            <div className="max-w-4xl space-y-5">
              <h1 className="font-display text-5xl font-extrabold leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
                Find your next court without the phone calls.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Explore sports, compare venues, and jump into available courts from one clean discovery screen.
              </p>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col items-center overflow-hidden rounded-2xl border border-border bg-secondary shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition focus-within:border-black/20 focus-within:shadow-[0_0_0_3px_rgba(255,90,31,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6)] dark:focus-within:border-white/20 sm:flex-row"
            >
              <label className="sr-only" htmlFor="court-search">
                Search courts
              </label>
              <div className="flex flex-1 items-center gap-3 px-5 py-4">
                <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <input
                  id="court-search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by court, venue, or sport"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" size="default" className="rounded-xl mr-1">
                Search courts
                <ArrowRight className="h-5" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {isError && (
        <section className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Unable to load discovery data</h2>
              <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button type="button" onClick={() => setReloadKey((current) => current + 1)} className="rounded-full">
              Retry
            </Button>
          </div>
        </section>
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
                <Button key={sport.id} asChild variant="secondary" className="rounded-full">
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
        <p className="text-xs font-medium uppercase text-primary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl font-extrabold text-foreground">{title}</h2>
      </div>
      <Button asChild variant="ghost" className="w-fit rounded-full">
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
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
