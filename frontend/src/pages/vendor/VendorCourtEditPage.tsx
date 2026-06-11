import { CalendarClock, CircleDollarSign, Images, MapPin, Pencil, Trophy } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import { getVendorCourtById, getVendorVenues, updateVendorCourt } from '@/features/vendor/api/vendorApi';
import { ConfirmActionDialog } from '@/features/vendor/components/ConfirmActionDialog';
import { VendorEntityImageManager } from '@/features/vendor/components/VendorEntityImageManager';
import type { VendorCourtDetail, VendorCourtRequest, VendorVenue } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'loading' | 'success' | 'error';
type CourtFormValues = {
  name: string;
  venueId: string;
  sportId: string;
  pricePerHour: string;
  description: string;
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
const relativeTimeUnits: Array<{ unit: Intl.RelativeTimeFormatUnit; milliseconds: number }> = [
  { unit: 'year', milliseconds: 31_536_000_000 },
  { unit: 'month', milliseconds: 2_592_000_000 },
  { unit: 'week', milliseconds: 604_800_000 },
  { unit: 'day', milliseconds: 86_400_000 },
  { unit: 'hour', milliseconds: 3_600_000 },
  { unit: 'minute', milliseconds: 60_000 },
  { unit: 'second', milliseconds: 1_000 },
];

function formatRelativeTime(value: string, now: number) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Unknown';

  const difference = timestamp - now;
  const selectedUnit =
    relativeTimeUnits.find(({ milliseconds }) => Math.abs(difference) >= milliseconds) ??
    relativeTimeUnits[relativeTimeUnits.length - 1];

  return relativeTimeFormatter.format(
    Math.round(difference / selectedUnit.milliseconds),
    selectedUnit.unit,
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load court.';
}

function toFormValues(court: VendorCourtDetail): CourtFormValues {
  return {
    name: court.name,
    venueId: String(court.venue.id),
    sportId: String(court.sport.id),
    pricePerHour: String(court.pricePerHour),
    description: court.description ?? '',
  };
}

function toRequest(values: CourtFormValues): VendorCourtRequest {
  return {
    name: values.name.trim(),
    venueId: Number(values.venueId),
    sportId: Number(values.sportId),
    pricePerHour: Number(values.pricePerHour),
    description: values.description.trim() || null,
  };
}

export function VendorCourtEditPage() {
  const { courtId } = useParams();
  const numericCourtId = Number(courtId);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [court, setCourt] = useState<VendorCourtDetail | null>(null);
  const [venues, setVenues] = useState<VendorVenue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [initialValues, setInitialValues] = useState<CourtFormValues | null>(null);
  const [formValues, setFormValues] = useState<CourtFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [relativeTimeNow, setRelativeTimeNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setRelativeTimeNow(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!Number.isInteger(numericCourtId) || numericCourtId <= 0) {
      setLoadError('Court ID is invalid.');
      setLoadState('error');
      return;
    }

    const controller = new AbortController();
    async function loadPage() {
      setLoadState('loading');
      setLoadError(null);
      try {
        const [courtResponse, venueResponse, sportResponse] = await Promise.all([
          getVendorCourtById(numericCourtId, controller.signal),
          getVendorVenues({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
          getPublicSports(controller.signal),
        ]);
        const nextValues = toFormValues(courtResponse.data);
        setCourt(courtResponse.data);
        setVenues(venueResponse.data.items);
        setSports(sportResponse.data.filter((sport) => sport.status === 'ACTIVE'));
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
    void loadPage();
    return () => controller.abort();
  }, [numericCourtId, reloadKey]);

  const hasChanges = useMemo(
    () => Boolean(formValues && initialValues && JSON.stringify(formValues) !== JSON.stringify(initialValues)),
    [formValues, initialValues],
  );

  function requestUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formValues?.name.trim() || !formValues.venueId || !formValues.sportId || Number(formValues.pricePerHour) <= 0) {
      toast.error('Please fill in all required court information.');
      return;
    }
    setShowUpdateConfirm(true);
  }

  async function confirmUpdate() {
    if (!formValues) return;
    setIsSubmitting(true);
    try {
      await updateVendorCourt(numericCourtId, toRequest(formValues));
      const refreshedResponse = await getVendorCourtById(numericCourtId);
      const nextValues = toFormValues(refreshedResponse.data);
      setCourt(refreshedResponse.data);
      setInitialValues(nextValues);
      setFormValues(nextValues);
      setRelativeTimeNow(Date.now());
      setShowUpdateConfirm(false);
      toast.success('Court updated successfully.');
    } catch (error) {
      toast.error('Failed to update court.', { description: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-2 px-3 py-1">
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit court
          </Badge>
          {court && <Badge variant={court.status === 'ACTIVE' ? 'default' : 'secondary'}>{court.status}</Badge>}
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {court?.name || 'Update court information'}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Maintain court details, pricing, venue assignment, sport, and gallery from one workspace.
        </p>
      </section>

      {loadState === 'loading' && <CourtEditorSkeleton />}
      {loadState === 'error' && (
        <ApiErrorMessage title="Unable to load court" message={loadError} onRetry={() => setReloadKey((value) => value + 1)} />
      )}

      {loadState === 'success' && court && formValues && (
        <>
          <form className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={requestUpdate} noValidate>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Court information</CardTitle>
                  <CardDescription>Information shown to customers during court browsing and booking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="edit-court-name">Court name *</Label>
                    <Input id="edit-court-name" className="h-11" maxLength={150} value={formValues.name}
                      onChange={(event) => setFormValues({ ...formValues, name: event.target.value })} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-court-venue">Venue *</Label>
                      <Select value={formValues.venueId} onValueChange={(value) => setFormValues({ ...formValues, venueId: value })}>
                        <SelectTrigger id="edit-court-venue" className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>{venues.map((venue) => <SelectItem key={venue.id} value={String(venue.id)}>{venue.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-court-sport">Sport *</Label>
                      <Select value={formValues.sportId} onValueChange={(value) => setFormValues({ ...formValues, sportId: value })}>
                        <SelectTrigger id="edit-court-sport" className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>{sports.map((sport) => <SelectItem key={sport.id} value={String(sport.id)}>{sport.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-court-price">Price per hour (VND) *</Label>
                    <Input id="edit-court-price" type="number" min="1" step="1000" className="h-11"
                      value={formValues.pricePerHour}
                      onChange={(event) => setFormValues({ ...formValues, pricePerHour: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-court-description">Description</Label>
                    <Textarea id="edit-court-description" rows={7} maxLength={1000} value={formValues.description}
                      onChange={(event) => setFormValues({ ...formValues, description: event.target.value })} />
                    <p className="text-right text-xs text-muted-foreground">{formValues.description.length}/1000</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-6">
              <Card className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  {court.primaryImageUrl ? <img src={court.primaryImageUrl} alt={formValues.name} className="h-full w-full object-cover" /> :
                    <div className="flex h-full items-center justify-center text-muted-foreground"><Images className="size-8" /></div>}
                </div>
                <CardContent className="space-y-4 p-5">
                  <div><h2 className="font-display text-xl font-semibold">{formValues.name || 'Untitled court'}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{venues.find((item) => String(item.id) === formValues.venueId)?.name}</p></div>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2"><Trophy className="size-4 text-muted-foreground" />{sports.find((item) => String(item.id) === formValues.sportId)?.name}</p>
                    <p className="flex items-center gap-2"><CircleDollarSign className="size-4 text-muted-foreground" />{Number(formValues.pricePerHour || 0).toLocaleString('vi-VN')} VND/hour</p>
                    <p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />Court ID #{court.id}</p>
                    <p className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-muted-foreground" />
                      Last updated: <time dateTime={court.updatedAt} title={new Date(court.updatedAt).toLocaleString('vi-VN')}>{formatRelativeTime(court.updatedAt, relativeTimeNow)}</time>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-muted-foreground" />
                      Created at: <time dateTime={court.createdAt} title={new Date(court.createdAt).toLocaleString('vi-VN')}>{formatRelativeTime(court.createdAt, relativeTimeNow)}</time>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Save court</CardTitle><CardDescription>{hasChanges ? 'Unsaved changes' : 'Court is up to date'}</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  <Button type="submit" className="w-full" disabled={!hasChanges || isSubmitting}>{isSubmitting && <Spinner />}Save changes</Button>
                  <Button type="button" variant="outline" className="w-full" disabled={!hasChanges || isSubmitting} onClick={() => setFormValues(initialValues)}>Discard changes</Button>
                  <Button asChild variant="outline" className="w-full"><Link to={`${routePaths.vendorSlots}?courtId=${court.id}`}><CalendarClock className="size-4" />Configure slots</Link></Button>
                  <Button asChild variant="ghost" className="w-full"><Link to={routePaths.vendorCourts}>Back to courts</Link></Button>
                </CardContent>
              </Card>
            </aside>
          </form>

          <section className="space-y-3">
            <div><h2 className="font-display text-2xl font-semibold">Court images</h2><p className="mt-1 text-sm text-muted-foreground">Upload, select primary, or delete images directly.</p></div>
            <VendorEntityImageManager targetType="court" targetId={court.id} targetName={formValues.name || court.name}
              onImagesChanged={(images) => setCourt((current) => current ? { ...current, primaryImageUrl: images.find((image) => image.isPrimary)?.imageUrl ?? null } : current)} />
          </section>

          <ConfirmActionDialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}
            title="Save court changes?" description="Court information will be updated immediately."
            confirmLabel="Save changes" onConfirm={() => void confirmUpdate()} isConfirming={isSubmitting} />
        </>
      )}
    </div>
  );
}

function CourtEditorSkeleton() {
  return <div className="grid gap-6 xl:grid-cols-[1fr_340px]"><Skeleton className="h-[560px]" /><Skeleton className="h-[520px]" /></div>;
}
