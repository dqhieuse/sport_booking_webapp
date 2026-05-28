import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailImageCarousel } from '@/components/detail-image-carousel';
import { getPublicCourts } from '@/features/courts/api/courtsApi';
import { CourtSuggestionCard } from '@/features/courts/components/CourtSuggestionCard';
import type { Court } from '@/features/courts/types';
import { getPublicVenueById, getPublicVenueImages } from '@/features/venues/api/venuesApi';
import type { VenueDetail, VenueImage } from '@/features/venues/types';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load venue details.';
}

function VenueDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-full bg-muted animate-soft-pulse" />
        <div className="h-10 w-2/3 rounded-lg bg-muted animate-soft-pulse" />
        <div className="h-5 w-56 rounded-full bg-muted animate-soft-pulse" />
      </div>
      <div className="aspect-[16/7] w-full rounded-[1.75rem] bg-muted animate-soft-pulse" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="h-5 w-1/3 rounded-full bg-muted animate-soft-pulse" />
          <div className="h-4 w-full rounded-full bg-muted animate-soft-pulse" />
          <div className="h-4 w-4/5 rounded-full bg-muted animate-soft-pulse" />
        </div>
        <div className="h-56 rounded-2xl bg-muted animate-soft-pulse" />
      </div>
    </div>
  );
}

export function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const parsedId = Number(venueId);

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [images, setImages] = useState<VenueImage[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isValidId = Number.isFinite(parsedId) && parsedId > 0;

  useEffect(() => {
    if (!isValidId) {
      return;
    }

    const controller = new AbortController();

    async function loadVenue() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [venueResponse, imagesResponse, courtsResponse] = await Promise.all([
          getPublicVenueById(parsedId, controller.signal),
          getPublicVenueImages(parsedId, controller.signal),
          getPublicCourts({ venueId: parsedId, page: 0, size: 4 }, controller.signal),
        ]);

        setVenue(venueResponse.data);
        setImages(
          [...imagesResponse.data].sort((a, b) => {
            if (a.isPrimary) return -1;
            if (b.isPrimary) return 1;
            return a.sortOrder - b.sortOrder;
          }),
        );
        setCourts(courtsResponse.data.items);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setVenue(null);
        setImages([]);
        setCourts([]);
        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadVenue();

    return () => {
      controller.abort();
    };
  }, [isValidId, parsedId, reloadKey]);

  const isLoading = loadState === 'idle' || loadState === 'loading';
  const isError = loadState === 'error';
  const hasData = loadState === 'success' && venue !== null;

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link
          to={routePaths.venues}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to venues
        </Link>
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
          <h1 className="font-display text-lg font-bold text-foreground">Invalid venue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The venue ID in the URL is not valid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <nav aria-label="Breadcrumb" className="border-b border-border/80 pb-4">
        <Link
          to={routePaths.venues}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to venues
        </Link>
      </nav>

      {isLoading && <VenueDetailSkeleton />}

      {isError && (
        <ApiErrorMessage
          title="Unable to load venue"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {hasData && venue && (
        <>
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Venue</Badge>
              <Badge variant="secondary">{venue.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {venue.name}
            </h1>
            <p className="flex items-center gap-1.5 text-base text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {venue.address}
            </p>
          </header>

          <DetailImageCarousel images={images} itemName={venue.name} />

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <section className="space-y-3">
                <h2 className="font-display text-xl font-semibold text-foreground">About this venue</h2>
                <p className="text-base leading-7 text-muted-foreground">
                  {venue.description || 'This venue has not added a public description yet.'}
                </p>
              </section>

              <section className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Courts</p>
                    <h2 className="section-title mt-1">Available at this venue</h2>
                  </div>
                  <Button asChild variant="ghost" className="w-fit">
                    <Link to={`${routePaths.courts}?venueId=${venue.id}`}>
                      View all courts
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                {courts.length > 0 ? (
                  <div className="grid gap-4">
                    {courts.map((court) => (
                      <CourtSuggestionCard key={court.id} court={court} />
                    ))}
                  </div>
                ) : (
                  <div className="sportzone-panel rounded-2xl p-6 text-sm text-muted-foreground">
                    No active courts are available for this venue yet.
                  </div>
                )}
              </section>
            </div>

            <aside>
              <div className="sportzone-panel sticky top-24 space-y-5 rounded-2xl p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Venue information</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-foreground">{venue.name}</p>
                </div>

                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">Opening hours</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {venue.openingTime} - {venue.closingTime}
                      </p>
                    </div>
                  </div>

                  {venue.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-foreground">Phone</p>
                        <a href={`tel:${venue.phone}`} className="mt-0.5 block text-sm text-muted-foreground hover:text-foreground">
                          {venue.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">Vendor</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{venue.vendor.fullName}</p>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full">
                  <Link to={`${routePaths.courts}?venueId=${venue.id}`}>
                    Browse courts
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
