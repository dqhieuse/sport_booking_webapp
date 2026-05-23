import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
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
        <div className="h-4 w-24 rounded-full bg-muted" />
        <div className="h-10 w-2/3 rounded-lg bg-muted" />
        <div className="h-5 w-40 rounded-full bg-muted" />
      </div>

      <div className="aspect-[16/7] w-full rounded-xl bg-muted" />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-5 w-1/3 rounded-full bg-muted" />
            <div className="h-4 w-full rounded-full bg-muted" />
            <div className="h-4 w-4/5 rounded-full bg-muted" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-1/4 rounded-full bg-muted" />
            <div className="h-4 w-2/3 rounded-full bg-muted" />
            <div className="h-4 w-1/2 rounded-full bg-muted" />
          </div>
        </div>
        <div className="h-56 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function ImageGallery({ images, courtName }: { images: CourtImage[]; courtName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/7] w-full items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        No images available
      </div>
    );
  }

  const current = images[currentIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-3xl bg-muted">
        <img
          key={current.imageUrl}
          src={current.imageUrl}
          alt={`${courtName} — image ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="absolute bottom-3 right-4 text-xs text-white/90">
              {currentIndex + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image.imageUrl}
                alt={`${courtName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
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
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
    <div className="space-y-8">
      <nav aria-label="Breadcrumb">
        <Link
          to={routePaths.courts}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to courts
        </Link>
      </nav>

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
          <header className="space-y-3 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{court.sport.name}</Badge>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              {court.name}
            </h1>
            <p className="flex items-center gap-1.5 text-base text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {court.venue.name} — {court.venue.address}
            </p>
          </header>

          {/* Gallery */}
          <ImageGallery images={images} courtName={court.name} />

          {/* Content grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left: Description + Venue info */}
            <div className="space-y-8">
              {court.description && (
                <section className="space-y-3">
                  <h2 className="font-display text-xl font-bold text-foreground">About this court</h2>
                  <p className="text-base leading-7 text-muted-foreground">{court.description}</p>
                </section>
              )}

              <section className="space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground">Venue details</h2>
                <div className="sportzone-panel rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">{court.venue.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{court.venue.address}</p>
                    </div>
                  </div>

                  {(court.venue.openingTime || court.venue.closingTime) && (
                    <div className="flex items-start gap-3 border-t border-border pt-4">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-foreground">Opening hours</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {court.venue.openingTime ?? '?'} — {court.venue.closingTime ?? '?'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Booking panel */}
            <aside>
              <div className="sportzone-panel sticky top-6 rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-display text-4xl font-bold text-primary">
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
                        {court.venue.openingTime} – {court.venue.closingTime}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-2xl"
                  disabled={court.status !== 'ACTIVE'}
                >
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  Book this court
                </Button>

                {court.status !== 'ACTIVE' && (
                  <p className="text-center text-xs text-muted-foreground">
                    This court is currently unavailable for booking.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
