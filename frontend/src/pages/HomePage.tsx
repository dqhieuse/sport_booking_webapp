import { ArrowRight, MapPin } from '@mynaui/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicCourts } from '@/features/courts/api/courtsApi';
import type { Court } from '@/features/courts/types';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import { routePaths } from '@/routes/routePaths';

type DiscoveryState = {
  sports: Sport[];
  courts: Court[];
};

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const emptyDiscoveryState: DiscoveryState = {
  sports: [],
  courts: [],
};

const fallbackSports = ['Basketball', 'Tennis', 'Football', 'Padel', 'Swimming', 'Badminton'];

const stats = [
  { value: '2,400+', label: 'Courts listed' },
  { value: '18', label: 'Sports available' },
  { value: '340K', label: 'Active players' },
  { value: '6AM-12', label: 'Open every day' },
];

const steps = [
  {
    number: '01',
    title: 'Pick your sport',
    description: "18 sports. Every level. Whether you're training for competition or showing up for the first time.",
  },
  {
    number: '02',
    title: 'Choose your slot',
    description: 'Real-time availability. Courts open from 6AM to midnight, seven days a week.',
  },
  {
    number: '03',
    title: 'Step on court',
    description: 'Confirmation lands in your pocket. Show up, scan, play. Nothing else required.',
  },
];

const testimonials = [
  {
    quote: 'Booked a padel court in under 60 seconds. No app, no phone call, just showed up and played.',
    meta: 'Padel - 3x weekly',
  },
  {
    quote: 'We run a squad of 12. Used to coordinate courts over WhatsApp, now everyone books on one screen.',
    meta: 'Basketball - squad captain',
  },
  {
    quote: 'Train 5am every morning. Arenas is the only platform that actually has courts open that early.',
    meta: 'Tennis - daily trainer',
  },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load discovery data.';
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(1, Math.round(value / 25000)));
}

function DiscoverySkeleton() {
  return (
    <section className="arena-section grid gap-1 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="arena-panel p-5">
          <Skeleton className="h-52 rounded-none" />
          <Skeleton className="mt-5 h-8 w-2/3 rounded-none" />
          <Skeleton className="mt-3 h-4 w-4/5 rounded-none" />
        </div>
      ))}
    </section>
  );
}

export function HomePage() {
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
        const [sportsResponse, courtsResponse] = await Promise.all([
          getPublicSports(controller.signal),
          getPublicCourts({ page: 0, size: 6 }, controller.signal),
        ]);

        setDiscovery({
          sports: sportsResponse.data.slice(0, 6),
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

  const sports = discovery.sports.length > 0 ? discovery.sports : fallbackSports.map((name, index) => ({ id: index + 1, name, description: null }));
  const featuredCourts = discovery.courts.slice(0, 3);
  const hasCourts = loadState === 'success' && featuredCourts.length > 0;
  const isLoading = loadState === 'loading' || loadState === 'idle';
  const isError = loadState === 'error';

  const livePlayerText = useMemo(() => `${Math.max(340, discovery.courts.length * 110 || 340).toLocaleString()} players`, [discovery.courts.length]);

  return (
    <div className="arena-page">
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden border-b border-border px-4 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute right-[8%] top-[22%] hidden text-[24rem] font-black leading-none text-white/[0.035] lg:block">
          1
        </div>
        <div className="pointer-events-none absolute bottom-8 right-0 hidden h-[80%] w-px rotate-12 bg-primary/60 lg:block" />

        <div className="flex min-h-[520px] flex-col justify-between gap-12">
          <div className="max-w-5xl">
            <div className="arena-kicker">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              Live - courts available now
            </div>
            <h1 className="arena-display mt-8">
              Find your
              <span className="block text-primary">arena.</span>
            </h1>
            <p className="mt-10 max-w-md text-base font-semibold leading-6 text-muted-foreground">
              Book courts for basketball, tennis, padel, football and more. No calls. No waiting. Just play.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-end">
            <Button asChild>
              <Link to={routePaths.courts}>
                Find a court
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <span className="text-sm font-semibold text-muted-foreground">{livePlayerText}</span>
          </div>
        </div>
      </section>

      <nav className="grid border-b border-border sm:grid-cols-3 lg:grid-cols-6" aria-label="Sport shortcuts">
        {sports.slice(0, 6).map((sport) => (
          <Link
            key={sport.id}
            to={`${routePaths.courts}?sportId=${sport.id}`}
            className="border-r border-border px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground no-underline hover:bg-primary hover:text-primary-foreground hover:no-underline"
          >
            {sport.name}
          </Link>
        ))}
      </nav>

      {isError && (
        <section className="arena-section">
          <ApiErrorMessage
            title="Unable to load discovery data"
            message={errorMessage}
            onRetry={() => setReloadKey((current) => current + 1)}
          />
        </section>
      )}

      {isLoading && <DiscoverySkeleton />}

      {!isLoading && !isError && (
        <>
          <section className="arena-section">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Choose your sport</p>
                <h2 className="section-title mt-2">18 sports. One platform.</h2>
              </div>
              <p className="text-sm font-semibold text-muted-foreground">All available today</p>
            </div>

            <div className="grid border border-border sm:grid-cols-3 lg:grid-cols-6">
              {sports.slice(0, 6).map((sport, index) => (
                <Link
                  key={sport.id}
                  to={`${routePaths.courts}?sportId=${sport.id}`}
                  className="group min-h-36 border-b border-r border-border p-6 no-underline hover:bg-primary hover:no-underline sm:border-b-0"
                >
                  <p className="font-display text-5xl font-black leading-none text-primary group-hover:text-primary-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-10 text-xs font-black uppercase tracking-[0.12em] text-foreground group-hover:text-primary-foreground">
                    {sport.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="arena-section">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Featured courts</p>
                <h2 className="section-title mt-2">Your court awaits.</h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={routePaths.courts}>View all courts</Link>
              </Button>
            </div>

            {hasCourts ? (
              <div className="grid gap-1 lg:grid-cols-[2fr_1fr]">
                <FeaturedCourtCard court={featuredCourts[0]} large />
                <div className="grid gap-1">
                  {featuredCourts.slice(1, 3).map((court) => (
                    <FeaturedCourtCard key={court.id} court={court} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<MapPin className="size-6" aria-hidden="true" />}
                title="No active courts yet"
                description="Seed or create active courts to show the featured court grid."
                className="max-w-none border border-border bg-card py-12"
              />
            )}
          </section>
        </>
      )}

      <section className="arena-section bg-card/55">
        <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <p className="eyebrow">Three steps. That's all.</p>
          <h2 className="section-title lg:text-right">Get on court fast.</h2>
        </div>
        <div className="grid border border-border lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="border-b border-r border-border p-8 lg:border-b-0">
              <p className="font-display text-7xl font-black leading-none text-primary">{step.number}</p>
              <h3 className="mt-8 font-display text-3xl font-black uppercase leading-none text-foreground">{step.title}</h3>
              <p className="mt-4 text-sm font-semibold leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-r border-border px-8 py-10">
            <p className="font-display text-6xl font-black uppercase leading-none text-foreground last:text-primary">{stat.value}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="arena-section">
        <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <p className="eyebrow">Heard from the court</p>
          <h2 className="section-title lg:text-right">Real players.</h2>
        </div>
        <div className="grid border border-border lg:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.meta} className="border-b border-r border-border p-8 lg:border-b-0">
              <p className="text-base font-semibold leading-7 text-foreground">"{item.quote}"</p>
              <footer className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-primary">{item.meta}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border bg-card px-4 py-24 text-center sm:px-8 lg:px-12">
        <p className="eyebrow">The clock is ticking</p>
        <p className="pointer-events-none absolute inset-x-0 top-8 font-display text-[16rem] font-black leading-none text-white/[0.035]">24:00</p>
        <h2 className="relative mx-auto mt-5 max-w-5xl font-display text-6xl font-black uppercase leading-[0.86] text-foreground sm:text-8xl">
          Your court is waiting.
        </h2>
        <p className="relative mt-5 text-sm font-semibold text-muted-foreground">Don't let someone else take your slot.</p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link to={routePaths.courts}>
              Find your court now
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <span className="text-xs font-semibold text-muted-foreground">No account required</span>
        </div>
      </section>
    </div>
  );
}

function FeaturedCourtCard({ court, large = false }: { court: Court; large?: boolean }) {
  return (
    <article className={large ? 'arena-image-card min-h-[420px]' : 'arena-image-card min-h-[210px]'}>
      {court.primaryImageUrl ? (
        <img src={court.primaryImageUrl} alt={court.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.18),transparent_32rem)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/10" />
      <div className="relative flex h-full min-h-inherit flex-col justify-end p-6 sm:p-8">
        <span className="mb-4 w-fit bg-primary px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground">
          Available now
        </span>
        <h3 className={large ? 'font-display text-5xl font-black uppercase leading-none text-foreground' : 'font-display text-3xl font-black uppercase leading-none text-foreground'}>
          {court.name}
        </h3>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          <MapPin className="mr-1 inline size-4" aria-hidden="true" />
          {court.venue.name}
        </p>
        {large && (
          <Button asChild className="mt-6 w-fit">
            <Link to={routePaths.courtDetail.replace(':courtId', String(court.id))}>Book court</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
