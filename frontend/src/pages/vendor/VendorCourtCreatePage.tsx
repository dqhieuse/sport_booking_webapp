import { Check, CheckCircle2, Clock3, Trophy } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/empty-state';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import {
  createVendorCourt,
  getVendorCourtTimeSlots,
  getVendorVenues,
  updateVendorCourtTimeSlots,
} from '@/features/vendor/api/vendorApi';
import { ConfirmActionDialog } from '@/features/vendor/components/ConfirmActionDialog';
import { CreationStepIndicator } from '@/features/vendor/components/CreationStepIndicator';
import { VendorEntityImageManager } from '@/features/vendor/components/VendorEntityImageManager';
import type {
  VendorCourtDetail,
  VendorCourtRequest,
  VendorCourtTimeSlot,
  VendorVenue,
} from '@/features/vendor/types';
import { getVendorCourtEditPath, routePaths } from '@/routes/routePaths';

type CourtFormValues = {
  name: string;
  venueId: string;
  sportId: string;
  pricePerHour: string;
  description: string;
};

const initialFormValues: CourtFormValues = {
  name: '',
  venueId: '',
  sportId: '',
  pricePerHour: '',
  description: '',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not create court.';
}

function toCourtRequest(values: CourtFormValues): VendorCourtRequest {
  return {
    name: values.name.trim(),
    venueId: Number(values.venueId),
    sportId: Number(values.sportId),
    pricePerHour: Number(values.pricePerHour),
    description: values.description.trim() || null,
  };
}

export function VendorCourtCreatePage() {
  const [step, setStep] = useState(1);
  const [venues, setVenues] = useState<VendorVenue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [formValues, setFormValues] = useState<CourtFormValues>(initialFormValues);
  const [createdCourt, setCreatedCourt] = useState<VendorCourtDetail | null>(null);
  const [timeSlots, setTimeSlots] = useState<VendorCourtTimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotLoadError, setSlotLoadError] = useState<string | null>(null);
  const [slotReloadKey, setSlotReloadKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showImageStepConfirm, setShowImageStepConfirm] = useState(false);
  const [showTimeSlotConfirm, setShowTimeSlotConfirm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const [venueResponse, sportResponse] = await Promise.all([
          getVendorVenues({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
          getPublicSports(controller.signal),
        ]);
        setVenues(venueResponse.data.items);
        setSports(sportResponse.data.filter((sport) => sport.status === 'ACTIVE'));
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error('Failed to load court options.', { description: getErrorMessage(error) });
        }
      }
    }

    void loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (step !== 3 || !createdCourt) {
      return;
    }

    const controller = new AbortController();
    const courtId = createdCourt.id;

    async function loadTimeSlots() {
      setIsLoadingSlots(true);
      setSlotLoadError(null);
      try {
        const response = await getVendorCourtTimeSlots(courtId, controller.signal);
        setTimeSlots(response.data);
        setSelectedSlotIds(
          response.data
            .filter((slot) => slot.status === 'ACTIVE')
            .map((slot) => slot.timeSlotId),
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setSlotLoadError(getErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadTimeSlots();
    return () => controller.abort();
  }, [createdCourt, slotReloadKey, step]);

  function handleFieldChange(field: keyof CourtFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function requestCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.venueId || !formValues.sportId || Number(formValues.pricePerHour) <= 0) {
      toast.error('Please fill in all required fields with valid values.', {
        description: 'Court name, venue, sport, and price per hour are required.',
      });
      return;
    }

    setShowCreateConfirm(true);
  }

  async function confirmCreate() {
    setIsSubmitting(true);
    try {
      const response = await createVendorCourt(toCourtRequest(formValues));
      setCreatedCourt(response.data);
      setShowCreateConfirm(false);
      setStep(2);
      toast.success('Court information saved.', {
        description: 'You can now upload court images.',
      });
    } catch (error) {
      toast.error('Failed to create court.', { description: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedVenue = venues.find((venue) => String(venue.id) === formValues.venueId);
  const selectedSport = sports.find((sport) => String(sport.id) === formValues.sportId);
  const selectedSlotSet = useMemo(() => new Set(selectedSlotIds), [selectedSlotIds]);

  function toggleSlot(timeSlotId: number) {
    setSelectedSlotIds((current) =>
      current.includes(timeSlotId)
        ? current.filter((id) => id !== timeSlotId)
        : [...current, timeSlotId],
    );
  }

  async function confirmTimeSlots() {
    if (!createdCourt) {
      return;
    }

    setIsSavingSlots(true);
    try {
      const response = await updateVendorCourtTimeSlots(createdCourt.id, selectedSlotIds);
      setTimeSlots(response.data);
      setSelectedSlotIds(
        response.data
          .filter((slot) => slot.status === 'ACTIVE')
          .map((slot) => slot.timeSlotId),
      );
      setShowTimeSlotConfirm(false);
      setStep(4);
      toast.success('Court time configuration saved.');
    } catch (error) {
      toast.error('Failed to save court time configuration.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSavingSlots(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
          <Trophy className="size-3.5" aria-hidden="true" />
          Create court
        </Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Create a new court.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Save court details first, then upload images using separate API actions.
          </p>
        </div>
      </section>

      <CreationStepIndicator
        currentStep={step}
        steps={['Basic information', 'Add images', 'Time configuration', 'Complete']}
      />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Court information</CardTitle>
            <CardDescription>
              Review these details in the confirmation dialog before the court is created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={requestCreate} noValidate>
              <div className="space-y-2">
                <Label htmlFor="court-name">Court name *</Label>
                <Input
                  id="court-name"
                  value={formValues.name}
                  onChange={handleFieldChange('name')}
                  placeholder="Court A1"
                  maxLength={150}
                  className="h-11"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="court-venue">Venue *</Label>
                  <Select
                    value={formValues.venueId}
                    onValueChange={(value) => setFormValues((current) => ({ ...current, venueId: value }))}
                  >
                    <SelectTrigger id="court-venue" className="h-11">
                      <SelectValue placeholder="Choose venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={String(venue.id)}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="court-sport">Sport *</Label>
                  <Select
                    value={formValues.sportId}
                    onValueChange={(value) => setFormValues((current) => ({ ...current, sportId: value }))}
                  >
                    <SelectTrigger id="court-sport" className="h-11">
                      <SelectValue placeholder="Choose sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={String(sport.id)}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="court-price">Price per hour (VND) *</Label>
                <Input
                  id="court-price"
                  type="number"
                  min="1"
                  step="1000"
                  value={formValues.pricePerHour}
                  onChange={handleFieldChange('pricePerHour')}
                  placeholder="150000"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court-description">Description</Label>
                <Textarea
                  id="court-description"
                  value={formValues.description}
                  onChange={handleFieldChange('description')}
                  placeholder="Surface, lighting, facilities, and other court details..."
                  maxLength={1000}
                  rows={6}
                />
                <p className="text-right text-xs text-muted-foreground">{formValues.description.length}/1000</p>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                <Button asChild type="button" variant="outline">
                  <Link to={routePaths.vendorCourts}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Review and create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && createdCourt && (
        <div className="space-y-5">
          <VendorEntityImageManager
            targetType="court"
            targetId={createdCourt.id}
            targetName={createdCourt.name}
          />
          <div className="flex justify-end">
            <Button type="button" onClick={() => setShowImageStepConfirm(true)}>
              Continue to time configuration
            </Button>
          </div>
        </div>
      )}

      {step === 3 && createdCourt && (
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Time configuration</CardTitle>
              <CardDescription>
                Select the time slots that can receive bookings for {createdCourt.name}.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingSlots}
                onClick={() => setSelectedSlotIds(timeSlots.map((slot) => slot.timeSlotId))}
              >
                <Check className="size-4" aria-hidden="true" />
                Select all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoadingSlots}
                onClick={() => setSelectedSlotIds([])}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoadingSlots && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Skeleton key={index} className="h-16" />
                ))}
              </div>
            )}

            {slotLoadError && (
              <ApiErrorMessage
                title="Unable to load time slots"
                message={slotLoadError}
                onRetry={() => setSlotReloadKey((current) => current + 1)}
              />
            )}

            {!isLoadingSlots && !slotLoadError && timeSlots.length === 0 && (
              <EmptyState
                icon={<Clock3 className="size-6" aria-hidden="true" />}
                title="No time slots available"
                description="The backend does not currently have active time slots to assign."
                className="max-w-none border"
              />
            )}

            {!isLoadingSlots && !slotLoadError && timeSlots.length > 0 && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {timeSlots.map((slot) => {
                    const checked = selectedSlotSet.has(slot.timeSlotId);
                    return (
                      <Label
                        key={slot.timeSlotId}
                        className="flex min-h-16 cursor-pointer items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent/60"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSlot(slot.timeSlotId)}
                          className="size-4"
                        />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="font-medium text-foreground">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {checked ? 'Accepting bookings' : 'Disabled'}
                          </span>
                        </span>
                      </Label>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedSlotIds.length}/{timeSlots.length} slots selected.
                  </p>
                  <Button type="button" onClick={() => setShowTimeSlotConfirm(true)}>
                    Save and complete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 4 && createdCourt && (
        <Card className="mx-auto text-center">
          <CardHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <CardTitle className="mt-3 text-2xl">Court setup completed</CardTitle>
            <CardDescription>
              {createdCourt.name} has been created under {createdCourt.venue.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link to={getVendorCourtEditPath(createdCourt.id)}>Open court editor</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routePaths.vendorCourts}>Back to courts</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmActionDialog
        open={showCreateConfirm}
        onOpenChange={setShowCreateConfirm}
        title="Create this court?"
        description={
          <div className="space-y-2">
            <p>The court record will be saved now. Images are uploaded separately in the next step.</p>
            <p><strong className="text-foreground">Court:</strong> {formValues.name}</p>
            <p><strong className="text-foreground">Venue:</strong> {selectedVenue?.name}</p>
            <p><strong className="text-foreground">Sport:</strong> {selectedSport?.name}</p>
            <p><strong className="text-foreground">Price:</strong> {Number(formValues.pricePerHour).toLocaleString('vi-VN')} VND/hour</p>
          </div>
        }
        confirmLabel="Create court"
        onConfirm={() => void confirmCreate()}
        isConfirming={isSubmitting}
      />

      <ConfirmActionDialog
        open={showImageStepConfirm}
        onOpenChange={setShowImageStepConfirm}
        title="Continue to time configuration?"
        description="Uploaded images are already saved. You can manage them later from the Court Editor."
        confirmLabel="Continue"
        onConfirm={() => {
          setShowImageStepConfirm(false);
          setStep(3);
        }}
      />

      <ConfirmActionDialog
        open={showTimeSlotConfirm}
        onOpenChange={setShowTimeSlotConfirm}
        title="Save court time configuration?"
        description={
          <>
            <strong className="text-foreground">{selectedSlotIds.length}</strong> of{' '}
            <strong className="text-foreground">{timeSlots.length}</strong> time slots will be enabled for this court.
          </>
        }
        confirmLabel="Save configuration"
        onConfirm={() => void confirmTimeSlots()}
        isConfirming={isSavingSlots}
      />
    </div>
  );
}
