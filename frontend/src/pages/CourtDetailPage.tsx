import {
  ChevronRight,
  ClockCircle,
  MapPin,
} from '@mynaui/icons-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Skeleton } from '@/components/ui/skeleton';
import { BackBreadcrumb } from '@/components/back-breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { DetailImageCarousel } from '@/components/detail-image-carousel';
import { getPublicCourtById, getPublicCourtImages } from '@/features/courts/api/courtsApi';
import type { CourtDetail, CourtImage } from '@/features/courts/types';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Could not load court details.';
}

function CourtDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-40" />
      </div>

      <Skeleton className="aspect-[16/7] w-full rounded-lg" />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-56 rounded-lg" />
      </div>
    </div>
  );
}

export function CourtDetailPage() {
  const { courtId } = useParams<{ courtId: string }>();
  const parsedId = Number(courtId);

  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [images, setImages] = useState<CourtImage[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isValidId = Number.isFinite(parsedId) && parsedId > 0;

  useEffect(() => {
    if (!isValidId) return;

    const controller = new AbortController();

    async function loadCourt() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [courtResponse, imagesResponse] = await Promise.all([
          getPublicCourtById(parsedId, controller.signal),
          getPublicCourtImages(parsedId, controller.signal),
        ]);

        setCourt(courtResponse.data);
        const sorted = [...imagesResponse.data].sort((a, b) => {
          if (a.isPrimary) return -1;
          if (b.isPrimary) return 1;
          return a.sortOrder - b.sortOrder;
        });
        setImages(sorted);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setCourt(null);
        setImages([]);
        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadCourt();

    return () => {
      controller.abort();
    };
  }, [isValidId, parsedId, reloadKey]);

  const isLoading = loadState === 'idle' || loadState === 'loading';
  const isError = loadState === 'error';
  const hasData = loadState === 'success' && court !== null;

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link
          to={routePaths.courts}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to courts
        </Link>
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
          <h1 className="font-display text-lg font-bold text-foreground">Invalid court</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The court ID in the URL is not valid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <BackBreadcrumb parentLabel="Courts" parentTo={routePaths.courts} currentLabel={court?.name || 'Court details'} />

      {isLoading && <CourtDetailSkeleton />}

      {isError && (
        <ApiErrorMessage
          title="Unable to load court"
          message={errorMessage}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {hasData && court && (
        <>
          {/* Header */}
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{court.sport.name}</Badge>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {court.name}
            </h1>
            <p className="flex items-center gap-1.5 text-base text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {court.venue.name} - {court.venue.address}
            </p>
          </header>

          {/* Gallery */}
          <DetailImageCarousel images={images} itemName={court.name} />

          {/* Content grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left: Description + Venue info */}
            <div className="space-y-8">
              {court.description && (
                <section className="space-y-3">
                  <h2 className="font-display text-xl font-semibold text-foreground">About this court</h2>
                  <p className="text-base leading-7 text-muted-foreground">{court.description}</p>
                </section>
              )}

              <section className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-foreground">Venue details</h2>
                <Card>
                  <CardContent className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">{court.venue.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{court.venue.address}</p>
                    </div>
                  </div>

                  {(court.venue.openingTime || court.venue.closingTime) && (
                    <div className="flex items-start gap-3 border-t border-border pt-4">
                      <ClockCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-foreground">Opening hours</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {court.venue.openingTime ?? '?'} - {court.venue.closingTime ?? '?'}
                        </p>
                      </div>
                    </div>
                  )}
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Right: Booking panel */}
            <aside>
              <Card className="sticky top-24">
                <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-display text-4xl font-semibold text-primary">
                    {currencyFormatter.format(court.pricePerHour)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">per hour</p>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sport</span>
                    <span className="font-medium text-foreground">{court.sport.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`font-medium ${court.status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                    >
                      {court.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {court.venue.openingTime && court.venue.closingTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hours</span>
                      <span className="font-medium text-foreground">
                        {court.venue.openingTime} - {court.venue.closingTime}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={court.status !== 'ACTIVE'}
                >
                  Book this court
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>

                {court.status !== 'ACTIVE' && (
                  <p className="text-center text-xs text-muted-foreground">
                    This court is currently unavailable for booking.
                  </p>
                )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
