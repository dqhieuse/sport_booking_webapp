import { AlertCircle, Dumbbell, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import { SportCard } from '@/features/sports/components/SportCard';
import type { Sport } from '@/features/sports/types';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load sports.';
}

function SportCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-md bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-6 w-2/3 rounded-full bg-muted" />
        <div className="h-4 w-full rounded-full bg-muted" />
        <div className="h-4 w-4/5 rounded-full bg-muted" />
        <div className="h-4 w-1/2 rounded-full bg-muted" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
        <div className="h-4 w-24 rounded-full bg-muted" />
        <div className="h-8 w-20 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSports() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getPublicSports(controller.signal);
        setSports(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSports([]);
        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadSports();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  const sportCountLabel = useMemo(() => {
    if (loadState === 'loading') {
      return 'Loading';
    }

    return `${sports.length} active`;
  }, [loadState, sports.length]);

  const isLoading = loadState === 'loading' || loadState === 'idle';
  const hasSports = loadState === 'success' && sports.length > 0;
  const isEmpty = loadState === 'success' && sports.length === 0;
  const isError = loadState === 'error';

  return (
    <div className="space-y-10">
      <section className="border-b border-border pb-10">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <Badge className="w-fit gap-2 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Public Sports
            </Badge>
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Choose a sport, then find the right court.
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                Browse active sport categories from the booking system and continue to available courts.
              </p>
            </div>
          </div>

          <div className="sportzone-panel rounded-lg p-5">
            <div className="flex items-center gap-4">
              <div className="sportzone-glow flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Dumbbell className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sports available</p>
                <p className="font-display text-2xl font-bold text-foreground">{sportCountLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SportCardSkeleton key={index} />
          ))}
        </section>
      )}

      {isError && (
        <section className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Unable to load sports</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
            <Button type="button" onClick={() => setReloadKey((current) => current + 1)} className="rounded-full">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </Button>
          </div>
        </section>
      )}

      {isEmpty && (
        <section className="sportzone-panel rounded-lg p-8 text-center">
          <h2 className="font-display text-xl font-bold text-foreground">No active sports yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Public sports are filtered by active status. Add active sports from the backend seed or admin flow to show them here.
          </p>
        </section>
      )}

      {hasSports && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </section>
      )}
    </div>
  );
}
