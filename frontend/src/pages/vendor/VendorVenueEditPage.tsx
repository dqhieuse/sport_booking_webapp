import { Building2, Clock3, Images, MapPin, Pencil, Phone, Store } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getVendorVenueById, updateVendorVenue } from '@/features/vendor/api/vendorApi';
import { ConfirmActionDialog } from '@/features/vendor/components/ConfirmActionDialog';
import {
  VendorVenueForm,
  type VendorVenueFormValues,
} from '@/features/vendor/components/VendorVenueForm';
import { VendorEntityImageManager } from '@/features/vendor/components/VendorEntityImageManager';
import type { VendorVenueDetail, VendorVenueRequest } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'loading' | 'success' | 'error';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load venue.';
}

function toFormValues(venue: VendorVenueDetail): VendorVenueFormValues {
  return {
    name: venue.name,
    address: venue.address,
    phone: venue.phone,
    openingTime: venue.openingTime,
    closingTime: venue.closingTime,
    description: venue.description ?? '',
  };
}

function toVenueRequest(values: VendorVenueFormValues): VendorVenueRequest {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    openingTime: values.openingTime,
    closingTime: values.closingTime,
    description: values.description.trim() || null,
  };
}

export function VendorVenueEditPage() {
  const { venueId } = useParams();
  const numericVenueId = Number(venueId);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [venue, setVenue] = useState<VendorVenueDetail | null>(null);
  const [initialValues, setInitialValues] = useState<VendorVenueFormValues | null>(null);
  const [formValues, setFormValues] = useState<VendorVenueFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!Number.isInteger(numericVenueId) || numericVenueId <= 0) {
      setLoadError('Venue ID is invalid.');
      setLoadState('error');
      return;
    }

    const controller = new AbortController();

    async function loadVenue() {
      setLoadState('loading');
      setLoadError(null);

      try {
        const response = await getVendorVenueById(numericVenueId, controller.signal);
        const nextValues = toFormValues(response.data);
        setVenue(response.data);
        setInitialValues(nextValues);
        setFormValues(nextValues);
        setLoadState('success');
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(getErrorMessage(error));
          setLoadState('error');
        }
      }
    }

    void loadVenue();
    return () => controller.abort();
  }, [numericVenueId, reloadKey]);

  const hasChanges = useMemo(
    () => Boolean(formValues && initialValues && JSON.stringify(formValues) !== JSON.stringify(initialValues)),
    [formValues, initialValues],
  );

  function requestUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues || !Number.isInteger(numericVenueId) || numericVenueId <= 0) {
      return;
    }

    if (!formValues.name.trim() || !formValues.address.trim() || !formValues.phone.trim()) {
      toast.error('Please fill in all required fields.', {
        description: 'Name, address, and phone are required.',
      });
      return;
    }

    if (formValues.openingTime >= formValues.closingTime) {
      toast.error('Opening time must be before closing time.', {
        description: 'Please adjust the times accordingly.',
      });
      return;
    }

    setShowUpdateConfirm(true);
  }

  async function confirmUpdate() {
    if (!formValues || !Number.isInteger(numericVenueId) || numericVenueId <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateVendorVenue(numericVenueId, toVenueRequest(formValues));
      const nextValues = toFormValues(response.data);
      setVenue(response.data);
      setInitialValues(nextValues);
      setFormValues(nextValues);
      setShowUpdateConfirm(false);
      toast.success('Venue updated successfully.', {
        description: `${formValues.name.trim()} has been updated.`,
      });
    } catch (error) {
      toast.error('Failed to update venue.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit venue
            </Badge>
            {venue && (
              <Badge variant={venue.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {venue.status}
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {venue?.name || 'Update venue information'}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Maintain the public listing, contact details, operating hours, and venue presentation from one workspace.
            </p>
          </div>
        </div>
      </section>

      {loadState === 'loading' && <VenueFormSkeleton />}

      {loadState === 'error' && (
        <ApiErrorMessage
          title="Unable to load venue"
          message={loadError}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {loadState === 'success' && formValues && venue && (
        <>
          <VendorVenueForm
            values={formValues}
            onChange={setFormValues}
            onSubmit={requestUpdate}
            cancelUrl={routePaths.vendorVenues}
            isSubmitting={isSubmitting}
            isSubmitDisabled={!hasChanges}
            isDirty={hasChanges}
            onReset={() => setFormValues(initialValues)}
            title="Public venue information"
            description="This content helps customers identify the venue and decide whether it fits their booking needs."
            submitLabel="Save changes"
            submittingLabel="Saving..."
            sidebar={<VenueEditorPreview venue={venue} values={formValues} />}
          />

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Venue images</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload, choose a primary image, or remove images without leaving the edit page.
              </p>
            </div>
            <VendorEntityImageManager
              targetType="venue"
              targetId={venue.id}
              targetName={formValues.name || venue.name}
              onImagesChanged={(images) => {
                const primaryImage = images.find((image) => image.isPrimary);
                setVenue((current) => current ? { ...current, primaryImageUrl: primaryImage?.imageUrl ?? null } : current);
              }}
            />
          </section>

          <ConfirmActionDialog
            open={showUpdateConfirm}
            onOpenChange={setShowUpdateConfirm}
            title="Save venue changes?"
            description="The updated venue information will be saved immediately and reflected on the public listing."
            confirmLabel="Save changes"
            onConfirm={() => void confirmUpdate()}
            isConfirming={isSubmitting}
          />
        </>
      )}
    </div>
  );
}

function VenueFormSkeleton() {
  return (
    <div
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      aria-busy="true"
      aria-label="Loading venue information"
    >
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-5">
              {Array.from({ length: sectionIndex === 0 ? 2 : 1 }).map((__, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className={sectionIndex === 0 && index === 1 ? 'h-40 w-full' : 'h-11 w-full'} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VenueEditorPreview({
  venue,
  values,
}: {
  venue: VendorVenueDetail;
  values: VendorVenueFormValues;
}) {
  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] bg-muted">
          {venue.primaryImageUrl ? (
            <img
              src={venue.primaryImageUrl}
              alt={values.name || venue.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Images className="size-8" aria-hidden="true" />
              <span className="text-sm">No primary image</span>
            </div>
          )}
          <Badge className="absolute left-3 top-3" variant={venue.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {venue.status}
          </Badge>
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="line-clamp-2 text-xl">{values.name.trim() || 'Untitled venue'}</CardTitle>
          <CardDescription className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{values.address.trim() || 'No address provided'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Operating hours</p>
                <p className="text-muted-foreground">{values.openingTime} - {values.closingTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Contact phone</p>
                <p className="text-muted-foreground">{values.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Venue ID</p>
                <p className="text-muted-foreground">#{venue.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Related management</CardTitle>
          <CardDescription>Continue managing this venue after updating its information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to={`${routePaths.vendorImages}?type=venue&targetId=${venue.id}`}>
              <Images className="size-4" aria-hidden="true" />
              Manage venue images
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to={`${routePaths.vendorCourts}?venueId=${venue.id}`}>
              <Building2 className="size-4" aria-hidden="true" />
              Manage venue courts
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
