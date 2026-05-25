import { Dumbbell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
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
    <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-2xl bg-muted animate-soft-pulse" />
        <div className="h-6 w-16 rounded-full bg-muted animate-soft-pulse" />
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-6 w-2/3 rounded-full bg-muted animate-soft-pulse" />
        <div className="h-4 w-full rounded-full bg-muted animate-soft-pulse" />
        <div className="h-4 w-4/5 rounded-full bg-muted animate-soft-pulse" />
        <div className="h-4 w-1/2 rounded-full bg-muted animate-soft-pulse" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
        <div className="h-4 w-24 rounded-full bg-muted animate-soft-pulse" />
        <div className="h-8 w-20 rounded-full bg-muted animate-soft-pulse" />
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
    <div className="page-shell">
      <section className="page-hero">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <Badge className="w-fit gap-2 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Public Sports
            </Badge>
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Choose a sport, then find the right court.
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Browse active sport categories from the booking system and continue to available courts.
              </p>
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
        <ApiErrorMessage
          title="Unable to load sports"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {isEmpty && (
        <section className="sportzone-panel rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">No active sports yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Public sports are filtered by active status. Add active sports from the backend seed or admin flow to show them here.
          </p>
        </section>
      )}

      {hasSports && (
        <>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </section>
        </>
      )}
    </div>
  );
}
