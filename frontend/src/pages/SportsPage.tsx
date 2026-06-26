import { useEffect, useState } from 'react';
import { Activity } from '@mynaui/icons-react';

import { Skeleton } from '@/components/ui/skeleton';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { EmptyState } from '@/components/empty-state';
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
    <div className="border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="size-12 rounded-md" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="mt-5 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
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

  const isLoading = loadState === 'loading' || loadState === 'idle';
  const hasSports = loadState === 'success' && sports.length > 0;
  const isEmpty = loadState === 'success' && sports.length === 0;
  const isError = loadState === 'error';

  return (
    <div className="arena-page">
      <section className="border-b border-border px-4 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <p className="eyebrow">Choose your sport</p>
            <div className="max-w-3xl space-y-4">
              <h1 className="arena-display-sm">
                Sports <span className="text-primary">lineup.</span>
              </h1>
              <p className="max-w-xl text-base font-semibold leading-7 text-muted-foreground">
                Browse active sport categories from the booking system and continue to available courts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <section className="grid gap-1 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-12">
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
        <EmptyState
          icon={<Activity className="size-6" aria-hidden="true" />}
          title="No active sports yet"
          description="Public sports are filtered by active status. Add active sports from the backend seed or admin flow to show them here."
          className="mx-4 my-12 max-w-none border border-border bg-card sm:mx-8 lg:mx-12"
        />
      )}

      {hasSports && (
        <>
        <section className="grid gap-1 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-12">
          {sports.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </section>
        </>
      )}
    </div>
  );
}
