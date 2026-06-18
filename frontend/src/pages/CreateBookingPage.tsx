import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Timer,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/useAuth';
import { createBooking } from '@/features/bookings/api/bookingsApi';
import type { PaymentMethod } from '@/features/bookings/types';
import { getCourtAvailableSlots, getPublicCourtById } from '@/features/courts/api/courtsApi';
import type { AvailableTimeSlot, CourtAvailableSlots, CourtDetail } from '@/features/courts/types';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

const NOTE_MAX_LENGTH = 500;
const EMPTY_SLOT_IDS: number[] = [];

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

type LocationState = {
  courtId: number;
  selectedDate: string;
  selectedSlotIds: number[];
};

type LoadState = 'idle' | 'loading' | 'success' | 'error';

function formatTime(time: string) {
  return time.slice(0, 5);
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.slice(0, 5).split(':').map(Number);
  return hour * 60 + minute;
}

function getSlotDurationMinutes(slot: AvailableTimeSlot) {
  return timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${minutes}m`;
}

function formatVenueHours(openingTime: string | null, closingTime: string | null) {
  if (!openingTime && !closingTime) return null;
  return `${openingTime ? formatTime(openingTime) : '?'} - ${closingTime ? formatTime(closingTime) : '?'}`;
}

function BookingCheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <Skeleton className="h-[460px] rounded-2xl" />
    </div>
  );
}

function CheckoutSteps() {
  const steps = [
    { label: 'Choose time', completed: true },
    { label: 'Review & pay', active: true },
    { label: 'Confirmation' },
  ];

  return (
    <ol className="grid grid-cols-3" aria-label="Booking progress">
      {steps.map((step, index) => (
        <li key={step.label} className="relative flex flex-col items-center text-center">
          {index > 0 && (
            <span
              className={cn(
                'absolute right-1/2 top-4 h-px w-full',
                step.active || step.completed ? 'bg-primary' : 'bg-border',
              )}
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              'relative z-10 flex size-8 items-center justify-center rounded-full border text-xs font-semibold',
              step.completed && 'border-primary bg-primary text-primary-foreground',
              step.active && 'border-primary bg-background text-primary ring-4 ring-primary/10',
              !step.completed && !step.active && 'border-border bg-background text-muted-foreground',
            )}
          >
            {step.completed ? <Check className="size-4" aria-hidden="true" /> : index + 1}
          </span>
          <span
            className={cn(
              'mt-2 text-xs font-medium sm:text-sm',
              step.active || step.completed ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function CreateBookingPage() {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const courtId = state?.courtId;
  const selectedDate = state?.selectedDate;
  const selectedSlotIds = state?.selectedSlotIds ?? EMPTY_SLOT_IDS;

  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [slots, setSlots] = useState<CourtAvailableSlots | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [bookingNote, setBookingNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!courtId || !selectedDate) return;

    const controller = new AbortController();

    async function loadData() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [courtResponse, slotsResponse] = await Promise.all([
          getPublicCourtById(courtId as number, controller.signal),
          getCourtAvailableSlots(courtId as number, selectedDate as string, controller.signal),
        ]);

        setCourt(courtResponse.data);
        setSlots(slotsResponse.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setCourt(null);
        setSlots(null);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load booking details.');
        setLoadState('error');
      }
    }

    void loadData();
    return () => controller.abort();
  }, [courtId, selectedDate, reloadKey]);

  const selectedSlotItems = useMemo(() => {
    if (!slots) return [];

    return slots.items
      .filter((slot) => selectedSlotIds.includes(slot.id))
      .sort((first, second) => first.startTime.localeCompare(second.startTime));
  }, [selectedSlotIds, slots]);

  const unavailableSelectedSlots = useMemo(
    () => selectedSlotItems.filter((slot) => slot.status !== 'AVAILABLE'),
    [selectedSlotItems],
  );

  const selectedDurationMinutes = useMemo(
    () => selectedSlotItems.reduce((total, slot) => total + getSlotDurationMinutes(slot), 0),
    [selectedSlotItems],
  );

  const totalAmount = court
    ? court.pricePerHour * (selectedDurationMinutes / 60)
    : 0;

  const firstSlot = selectedSlotItems[0];
  const lastSlot = selectedSlotItems[selectedSlotItems.length - 1];
  const venueHours = court
    ? formatVenueHours(court.venue.openingTime, court.venue.closingTime)
    : null;
  const noteLength = bookingNote.length;
  const hasCompleteSelection = selectedSlotItems.length === selectedSlotIds.length;
  const isSelectionAvailable = hasCompleteSelection && unavailableSelectedSlots.length === 0;
  const canSubmit =
    Boolean(court && firstSlot && lastSlot) &&
    isSelectionAvailable &&
    noteLength <= NOTE_MAX_LENGTH &&
    !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || !courtId || !selectedDate) return;

    setIsSubmitting(true);
    try {
      const response = await createBooking({
        courtId,
        timeSlotIds: selectedSlotIds,
        bookingDate: selectedDate,
        paymentMethod,
        note: bookingNote.trim() || undefined,
      });

      navigate(routePaths.bookingResult, {
        replace: true,
        state: { booking: response.data },
      });
    } catch (error) {
      toast.error('Booking could not be completed', {
        description:
          error instanceof Error
            ? error.message
            : 'The selected time may no longer be available. Please try again.',
      });
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated || !state || !courtId || !selectedDate || selectedSlotIds.length === 0) {
    return <Navigate to={routePaths.courts} replace />;
  }

  const courtDetailPath = routePaths.courtDetail.replace(':courtId', String(courtId));

  return (
    <div className="page-shell pb-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
            <Link to={courtDetailPath} className="no-underline hover:no-underline">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to court
            </Link>
          </Button>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="eyebrow">Final review</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Complete your booking
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Check the court, schedule, contact details, and payment method before confirming.
              </p>
            </div>
          </div>
          
          <CheckoutSteps />
        </header>

        {(loadState === 'idle' || loadState === 'loading') && <BookingCheckoutSkeleton />}

        {loadState === 'error' && (
          <ApiErrorMessage
            title="Unable to prepare your booking"
            message={errorMessage}
            onRetry={() => setReloadKey((current) => current + 1)}
          />
        )}

        {loadState === 'success' && court && (!hasCompleteSelection || !isSelectionAvailable) && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold text-foreground">Your selected time is no longer available</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Another booking or schedule update changed one of these slots. Return to the court page and choose a new time.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link to={courtDetailPath} className="no-underline hover:no-underline">
                  Choose another time
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {loadState === 'success' && court && firstSlot && lastSlot && isSelectionAvailable && (
          <form
            onSubmit={handleSubmit}
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-2xl">
                <div className="grid sm:grid-cols-[210px_1fr]">
                  <div className="relative min-h-48 bg-muted sm:min-h-full">
                    {court.primaryImageUrl ? (
                      <img
                        src={court.primaryImageUrl}
                        alt={court.name}
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="size-8" aria-hidden="true" />
                        <span className="text-xs">Court image unavailable</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Your selected court</p>
                        <h2 className="mt-1 text-xl font-semibold text-foreground">{court.name}</h2>
                      </div>
                      <Badge variant="secondary">{court.sport.name}</Badge>
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <p className="font-medium text-foreground">{court.venue.name}</p>
                          <p className="mt-0.5 text-muted-foreground">{court.venue.address}</p>
                        </div>
                      </div>
                      {venueHours && (
                        <div className="flex items-center gap-3">
                          <Clock3 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          <p className="text-muted-foreground">
                            Venue hours: <span className="font-medium text-foreground">{venueHours}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="border-b pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">Date & selected time</CardTitle>
                      <CardDescription className="mt-1">
                        Review each time slot included in this booking.
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link to={courtDetailPath} className="no-underline hover:no-underline">
                        Change
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                      <p className="mt-3 text-xs text-muted-foreground">Booking date</p>
                      <p className="mt-1 text-sm font-semibold leading-5">
                        {dateFormatter.format(parseLocalDate(selectedDate))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <Clock3 className="size-5 text-primary" aria-hidden="true" />
                      <p className="mt-3 text-xs text-muted-foreground">Time</p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatTime(firstSlot.startTime)} - {formatTime(lastSlot.endTime)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <Timer className="size-5 text-primary" aria-hidden="true" />
                      <p className="mt-3 text-xs text-muted-foreground">Duration</p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatDuration(selectedDurationMinutes)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">Included time slots</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedSlotItems.map((slot, index) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between rounded-lg border bg-background px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(getSlotDurationMinutes(slot))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Booking contact</CardTitle>
                  <CardDescription>
                    The venue will use the information from your account for this reservation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {session?.user.fullName ?? 'Current customer'}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {session?.user.email ?? 'Contact information from your profile'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Payment method</CardTitle>
                  <CardDescription>
                    Choose how you want to pay for this reservation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    disabled={isSubmitting}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <Label
                      htmlFor="payment-vnpay"
                      className={cn(
                        'relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50',
                        paymentMethod === 'VNPAY' && 'border-primary bg-primary/5 ring-1 ring-primary',
                      )}
                    >
                      <RadioGroupItem id="payment-vnpay" value="VNPAY" className="mt-1" />
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <QrCode className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-semibold text-foreground">VNPay</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          Create an online payment request after booking confirmation.
                        </span>
                      </span>
                    </Label>

                    <Label
                      htmlFor="payment-cash"
                      className={cn(
                        'relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50',
                        paymentMethod === 'CASH_AT_COURT' && 'border-primary bg-primary/5 ring-1 ring-primary',
                      )}
                    >
                      <RadioGroupItem id="payment-cash" value="CASH_AT_COURT" className="mt-1" />
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Banknote className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-semibold text-foreground">Pay at court</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          Pay the venue directly when you arrive for your booking.
                        </span>
                      </span>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Note for the venue</CardTitle>
                  <CardDescription>
                    Add optional requests that may help the venue prepare for your visit.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Label htmlFor="booking-note" className="sr-only">
                    Note for the venue
                  </Label>
                  <Textarea
                    id="booking-note"
                    placeholder="Example: Please prepare rackets or set up lighting before arrival."
                    value={bookingNote}
                    onChange={(event) => setBookingNote(event.target.value)}
                    rows={4}
                    maxLength={NOTE_MAX_LENGTH}
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>Optional. Do not include payment or sensitive personal information.</span>
                    <span className="shrink-0">
                      {noteLength}/{NOTE_MAX_LENGTH}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="lg:sticky lg:top-24">
              <Card className="overflow-hidden rounded-2xl border-primary/20 shadow-md">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ReceiptText className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <CardTitle className="text-xl">Order summary</CardTitle>
                      <CardDescription>Final amount before confirmation</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Court</span>
                      <span className="max-w-44 text-right font-medium">{court.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">{currencyFormatter.format(court.pricePerHour)}/hour</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formatDuration(selectedDurationMinutes)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Time slots</span>
                      <span className="font-medium">{selectedSlotItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium">
                        {paymentMethod === 'VNPAY' ? 'VNPay' : 'At court'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Total</p>
                        <p className="mt-1 text-xs text-muted-foreground">Calculated from selected duration</p>
                      </div>
                      <p className="text-2xl font-semibold text-primary">
                        {currencyFormatter.format(totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      Availability and the final price are checked again securely when you confirm.
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Creating booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Confirm booking
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    By confirming, you agree to follow the venue rules and selected payment terms.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
