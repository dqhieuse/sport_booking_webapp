import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  Timer,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { createVendorBooking, lookupVendorCustomer } from '@/features/bookings/api/bookingsApi';
import type {
  CreateBookingResponse,
  PaymentMethod,
  VendorCustomerLookupResponse,
} from '@/features/bookings/types';
import { getCourtAvailableSlots } from '@/features/courts/api/courtsApi';
import type { AvailableTimeSlot } from '@/features/courts/types';
import { getVendorCourts } from '@/features/vendor/api/vendorApi';
import type { VendorCourt } from '@/features/vendor/types';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type BookingStep = 1 | 2 | 3 | 4 | 5;
type CustomerMode = 'registered' | 'walk-in';

const MAX_BOOKING_MINUTES = 180;
const MIN_BOOKING_MINUTES = 60;
const NOTE_MAX_LENGTH = 500;
const NO_COURT_VALUE = 'no-court';

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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBookingWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(today);
  lastDate.setDate(today.getDate() + 13);
  return { today, lastDate };
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(time: string) {
  return time.slice(0, 5);
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

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const steps = ['Court & date', 'Available time', 'Customer', 'Payment', 'Review'];

  return (
    <ol className="grid grid-cols-5" aria-label="Booking creation progress">
      {steps.map((label, index) => {
        const step = (index + 1) as BookingStep;
        const completed = step < currentStep;
        const active = step === currentStep;

        return (
          <li key={label} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span
                className={cn(
                  'absolute right-1/2 top-4 h-px w-full',
                  step <= currentStep ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                'relative z-10 flex size-8 items-center justify-center rounded-full border bg-background text-xs font-semibold',
                completed && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary text-primary ring-4 ring-primary/10',
                !completed && !active && 'text-muted-foreground',
              )}
            >
              {completed ? <Check className="size-4" aria-hidden="true" /> : step}
            </span>
            <span className={cn('mt-2 text-xs font-medium sm:text-sm', active ? 'text-foreground' : 'text-muted-foreground')}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true">
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-[520px] rounded-2xl" />
    </div>
  );
}

export function VendorBookingCreatePage() {
  const { today, lastDate } = getBookingWindow();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [courts, setCourts] = useState<VendorCourt[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState(NO_COURT_VALUE);
  const [bookingDate, setBookingDate] = useState<Date>(today);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [slots, setSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMode, setCustomerMode] = useState<CustomerMode>('registered');
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [linkedCustomer, setLinkedCustomer] = useState<VendorCustomerLookupResponse | null>(null);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_AT_COURT');
  const [note, setNote] = useState('');
  const [courtLoadState, setCourtLoadState] = useState<LoadState>('idle');
  const [slotLoadState, setSlotLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courtReloadKey, setCourtReloadKey] = useState(0);
  const [slotReloadKey, setSlotReloadKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<CreateBookingResponse | null>(null);

  const bookingDateValue = toDateInputValue(bookingDate);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourts() {
      setCourtLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getVendorCourts({ page: 0, size: 100, status: 'ACTIVE' }, controller.signal);
        setCourts(response.data.items);
        setSelectedCourtId((current) => {
          if (response.data.items.some((court) => String(court.id) === current)) return current;
          return response.data.items[0] ? String(response.data.items[0].id) : NO_COURT_VALUE;
        });
        setCourtLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setCourts([]);
        setErrorMessage(error instanceof Error ? error.message : 'Could not load vendor courts.');
        setCourtLoadState('error');
      }
    }

    void loadCourts();
    return () => controller.abort();
  }, [courtReloadKey]);

  useEffect(() => {
    if (selectedCourtId === NO_COURT_VALUE) return;
    const controller = new AbortController();

    async function loadSlots() {
      setSlotLoadState('loading');
      setErrorMessage(null);
      setSelectedSlotIds([]);

      try {
        const response = await getCourtAvailableSlots(
          Number(selectedCourtId),
          bookingDateValue,
          controller.signal,
        );
        setSlots(response.data.items);
        setSlotLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setSlots([]);
        setErrorMessage(error instanceof Error ? error.message : 'Could not load available time slots.');
        setSlotLoadState('error');
      }
    }

    void loadSlots();
    return () => controller.abort();
  }, [bookingDateValue, selectedCourtId, slotReloadKey]);

  const selectedCourt = courts.find((court) => String(court.id) === selectedCourtId) ?? null;
  const sortedSlots = useMemo(
    () => [...slots].sort((first, second) => first.startTime.localeCompare(second.startTime)),
    [slots],
  );
  const selectedSlots = useMemo(
    () => sortedSlots.filter((slot) => selectedSlotIds.includes(slot.id)),
    [selectedSlotIds, sortedSlots],
  );
  const selectedDurationMinutes = selectedSlots.reduce(
    (total, slot) => total + getSlotDurationMinutes(slot),
    0,
  );
  const firstSelectedSlot = selectedSlots[0];
  const lastSelectedSlot = selectedSlots[selectedSlots.length - 1];
  const totalAmount = selectedCourt ? selectedCourt.pricePerHour * (selectedDurationMinutes / 60) : 0;
  const hasValidSchedule =
    selectedDurationMinutes >= MIN_BOOKING_MINUTES &&
    selectedDurationMinutes <= MAX_BOOKING_MINUTES;
  const hasValidCustomer =
    customerMode === 'registered' ? Boolean(linkedCustomer?.found) : Boolean(customerName.trim());
  const canSubmit = Boolean(selectedCourt && hasValidSchedule && hasValidCustomer) && !isSubmitting;
  const hasNoCourts = courtLoadState === 'success' && courts.length === 0;

  function handleSlotSelect(slot: AvailableTimeSlot) {
    if (slot.status !== 'AVAILABLE') return;

    const selectedIndex = selectedSlots.findIndex((item) => item.id === slot.id);
    if (selectedIndex >= 0) {
      setSelectedSlotIds(
        selectedIndex === selectedSlots.length - 1
          ? selectedSlots.slice(0, -1).map((item) => item.id)
          : [slot.id],
      );
      return;
    }

    if (!lastSelectedSlot) {
      setSelectedSlotIds([slot.id]);
      return;
    }

    const isConsecutive = formatTime(lastSelectedSlot.endTime) === formatTime(slot.startTime);
    const nextDuration = selectedDurationMinutes + getSlotDurationMinutes(slot);

    if (!isConsecutive) {
      setSelectedSlotIds([slot.id]);
      toast.info('A new time selection was started', {
        description: 'Selected time slots must be consecutive.',
      });
      return;
    }

    if (nextDuration > MAX_BOOKING_MINUTES) {
      toast.error('Maximum booking duration is 3 hours');
      return;
    }

    setSelectedSlotIds((current) => [...current, slot.id]);
  }

  function goToNextStep() {
    if (currentStep === 1 && !selectedCourt) return;
    if (currentStep === 2 && !hasValidSchedule) {
      toast.error('Select between 1 and 3 consecutive hours');
      return;
    }
    if (currentStep === 3 && !hasValidCustomer) {
      toast.error(
        customerMode === 'registered'
          ? 'Find and select a registered customer'
          : 'Enter the walk-in customer name',
      );
      return;
    }
    setCurrentStep((current) => Math.min(5, current + 1) as BookingStep);
  }

  function handleCustomerModeChange(value: string) {
    setCustomerMode(value as CustomerMode);
    setCustomerIdentifier('');
    setLinkedCustomer(null);
    setCustomerName('');
    setCustomerPhone('');
  }

  async function handleCustomerLookup() {
    const identifier = customerIdentifier.trim();
    if (!identifier) {
      toast.error('Enter a phone number or email');
      return;
    }

    setIsLookingUpCustomer(true);
    try {
      const response = await lookupVendorCustomer(identifier);
      if (!response.data.found) {
        setLinkedCustomer(null);
        if (!identifier.includes('@')) setCustomerPhone(identifier);
        toast.info('No registered customer found', {
          description: 'Continue as a walk-in customer and enter their name.',
        });
        return;
      }
      setLinkedCustomer(response.data);
      setCustomerName(response.data.fullName ?? '');
      toast.success('Customer account linked');
    } catch (error) {
      toast.error('Could not look up customer', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLookingUpCustomer(false);
    }
  }

  async function handleCreateBooking() {
    if (currentStep !== 5) return;
    if (!canSubmit || !selectedCourt) return;

    setIsSubmitting(true);
    try {
      const response = await createVendorBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerIdentifier: linkedCustomer ? customerIdentifier.trim() : undefined,
        courtId: selectedCourt.id,
        timeSlotIds: selectedSlotIds,
        bookingDate: bookingDateValue,
        paymentMethod,
        note: note.trim() || undefined,
      });
      setCreatedBooking(response.data);
      toast.success('Vendor booking created successfully');
    } catch (error) {
      toast.error('Could not create booking', {
        description: error instanceof Error ? error.message : 'Please check the selected time.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setCreatedBooking(null);
    setCurrentStep(1);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerMode('registered');
    setCustomerIdentifier('');
    setLinkedCustomer(null);
    setPaymentMethod('CASH_AT_COURT');
    setSelectedSlotIds([]);
    setNote('');
    setSlotReloadKey((current) => current + 1);
  }

  if (createdBooking) {
    const paymentAmount =
      createdBooking.payment.amount > 0
        ? createdBooking.payment.amount
        : createdBooking.totalPrice;

    return (
      <div className="page-shell mx-auto max-w-3xl">
        <Card className="overflow-hidden rounded-2xl">
          <CardHeader className="items-center border-b bg-muted/30 py-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
            <Badge variant="outline" className="mt-3 rounded-full border-primary/20 bg-primary/5 text-primary">
              Booking #{createdBooking.id}
            </Badge>
            <CardTitle className="mt-2 text-2xl">Booking created</CardTitle>
            <CardDescription className="max-w-lg">
              {createdBooking.payment.method === 'CASH_AT_COURT'
                ? `The court is confirmed for ${customerName.trim()}. Cash payment has been recorded.`
                : `The booking for ${customerName.trim()} is pending until VNPay confirms the payment.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryItem label="Court" value={createdBooking.courtName} />
              <SummaryItem
                label="Date & time"
                value={`${dateFormatter.format(parseLocalDate(createdBooking.bookingDate))}, ${formatTime(createdBooking.startTime)} - ${formatTime(createdBooking.endTime)}`}
              />
              <SummaryItem label="Total" value={currencyFormatter.format(paymentAmount)} />
              <SummaryItem
                label="Payment"
                value={`${createdBooking.payment.method === 'CASH_AT_COURT' ? 'Cash at court' : 'VNPay'} · ${createdBooking.payment.status}`}
              />
            </div>
            {createdBooking.payment.method === 'VNPAY' && (
              <div className="rounded-xl bg-amber-500/10 p-4 text-sm leading-6">
                <p className="font-medium text-foreground">
                  VNPay amount: {currencyFormatter.format(paymentAmount)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  This amount is fixed from the created booking and must be used when generating the VNPay request.
                </p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" size="lg" onClick={resetForm}>Create another booking</Button>
              <Button asChild variant="outline" size="lg">
                <Link to={routePaths.vendorDashboard} className="no-underline hover:no-underline">
                  Return to dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <Badge variant="outline" className="w-fit gap-2">
          <WalletCards className="size-4" aria-hidden="true" />
          On-site booking
        </Badge>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Create booking for a customer
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Complete one step at a time. Customer accounts are not required.
          </p>
        </div>
      </section>

      {courtLoadState === 'error' && (
        <ApiErrorMessage
          title="Unable to load vendor courts"
          message={errorMessage}
          onRetry={() => setCourtReloadKey((current) => current + 1)}
        />
      )}

      {(courtLoadState === 'idle' || courtLoadState === 'loading') && <PageSkeleton />}

      {hasNoCourts && (
        <EmptyState
          icon={<CalendarDays className="size-6" aria-hidden="true" />}
          title="No active courts available"
          description="Create and configure an active court before creating a booking."
          action={<Button asChild><Link to={routePaths.vendorCourtCreate}>Create court</Link></Button>}
          className="max-w-none rounded-2xl border bg-card"
        />
      )}

      {courtLoadState === 'success' && courts.length > 0 && (
        <div className="mx-auto space-y-6">
          <StepIndicator currentStep={currentStep} />

          {currentStep === 1 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Court and booking date</CardTitle>
                <CardDescription>Select an active court and one date within the next 14 days.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-booking-court">Court</Label>
                    <Select value={selectedCourtId} onValueChange={setSelectedCourtId}>
                      <SelectTrigger id="vendor-booking-court">
                        <SelectValue placeholder="Select a court" />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={String(court.id)}>
                            {court.name} · {court.venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCourt && (
                    <div className="overflow-hidden rounded-xl border bg-muted/30">
                      <div className="grid sm:grid-cols-[150px_1fr]">
                        <div className="relative min-h-32 bg-muted">
                          {selectedCourt.primaryImageUrl ? (
                            <img src={selectedCourt.primaryImageUrl} alt={selectedCourt.name} className="absolute inset-0 size-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="size-7" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{selectedCourt.name}</p>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="size-4" aria-hidden="true" />
                                {selectedCourt.venue.name}
                              </p>
                            </div>
                            <Badge variant="secondary">{selectedCourt.sport.name}</Badge>
                          </div>
                          <p className="mt-4 text-sm font-medium text-primary">
                            {currencyFormatter.format(selectedCourt.pricePerHour)}/hour
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 lg:min-w-72">
                  <Label>Booking date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto w-full justify-start gap-3 px-4 py-3 text-left font-normal"
                      >
                        <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                        <span>
                          <span className="block text-xs text-muted-foreground">Selected date</span>
                          <span className="mt-0.5 block font-medium text-foreground">
                            {dateFormatter.format(bookingDate)}
                          </span>
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bookingDate}
                        defaultMonth={bookingDate}
                        startMonth={today}
                        endMonth={lastDate}
                        disabled={{ before: today, after: lastDate }}
                        onSelect={(date) => {
                          if (!date) return;
                          setBookingDate(date);
                          setIsCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">Click the button to choose another date.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="rounded-2xl">
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle>Available time</CardTitle>
                  <CardDescription>Select between 1 and 3 consecutive hours.</CardDescription>
                </div>
                <Badge variant="secondary">{dateFormatter.format(bookingDate)}</Badge>
              </CardHeader>
              <CardContent>
                {(slotLoadState === 'idle' || slotLoadState === 'loading') && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, index) => <Skeleton key={index} className="h-16" />)}
                  </div>
                )}
                {slotLoadState === 'error' && (
                  <ApiErrorMessage
                    title="Unable to load time slots"
                    message={errorMessage}
                    onRetry={() => setSlotReloadKey((current) => current + 1)}
                  />
                )}
                {slotLoadState === 'success' && slots.length === 0 && (
                  <EmptyState
                    icon={<Clock3 className="size-6" aria-hidden="true" />}
                    title="No configured time slots"
                    description="Configure time slots or choose another court and date."
                    className="max-w-none py-10"
                  />
                )}
                {slotLoadState === 'success' && slots.length > 0 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {sortedSlots.map((slot) => {
                        const selected = selectedSlotIds.includes(slot.id);
                        const available = slot.status === 'AVAILABLE';
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!available}
                            aria-pressed={selected}
                            onClick={() => handleSlotSelect(slot)}
                            className={cn(
                              'min-h-16 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                              selected && 'border-primary bg-primary/10 ring-1 ring-primary',
                              available && !selected && 'hover:border-primary/50 hover:bg-primary/5',
                              !available && 'cursor-not-allowed bg-muted/60 text-muted-foreground opacity-70',
                            )}
                          >
                            <span className="block text-sm font-semibold">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                            <span className="mt-1 block text-xs">{selected ? 'Selected' : available ? 'Available' : slot.status}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4 text-sm">
                      <span className="text-muted-foreground">Selected duration</span>
                      <span className="flex items-center gap-2 font-semibold">
                        <Timer className="size-4 text-primary" aria-hidden="true" />
                        {selectedDurationMinutes ? formatDuration(selectedDurationMinutes) : 'Not selected'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Customer information</CardTitle>
                <CardDescription>Link a system user or enter a walk-in customer.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={customerMode} onValueChange={handleCustomerModeChange}>
                  <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl">
                    <TabsTrigger value="registered" className="gap-2 rounded-lg">
                      <UserRound className="size-4" aria-hidden="true" />
                      System user
                    </TabsTrigger>
                    <TabsTrigger value="walk-in" className="gap-2 rounded-lg">
                      <Phone className="size-4" aria-hidden="true" />
                      Walk-in customer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="registered" className="mx-auto mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor-customer-identifier">Phone number or email</Label>
                      <div className="flex flex-col gap-2 sm:flex-row items-start sm:items-center">
                        <Input
                          id="vendor-customer-identifier"
                          value={customerIdentifier}
                          onChange={(event) => {
                            if (linkedCustomer) setCustomerName('');
                            setCustomerIdentifier(event.target.value);
                            setLinkedCustomer(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter') return;
                            event.preventDefault();
                            void handleCustomerLookup();
                          }}
                          placeholder="Enter registered phone number or email"
                          maxLength={150}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCustomerLookup}
                          disabled={isLookingUpCustomer}
                        >
                          {isLookingUpCustomer
                            ? <Loader2 className="size-4 animate-spin" />
                            : <Search className="size-4" />}
                          Find customer
                        </Button>
                      </div>
                    </div>
                    {linkedCustomer?.found ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <p className="flex items-center gap-2 font-medium text-primary">
                          <CheckCircle2 className="size-5" aria-hidden="true" />
                          {linkedCustomer.fullName}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Mail className="size-4" aria-hidden="true" />
                            {linkedCustomer.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="size-4" aria-hidden="true" />
                            {linkedCustomer.phone}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          This booking will be linked to the account for booking history and future rewards.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed p-5 text-center">
                        <UserRound className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
                        <p className="mt-2 text-sm font-medium">No customer selected</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Search for an account or switch to the walk-in tab.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="walk-in" className="mx-auto mt-6 max-w-2xl space-y-5">
                    <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                      Use this option when the customer does not have an account. Account-based rewards will
                      not be available for this booking.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor-customer-name">Customer name</Label>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                          id="vendor-customer-name"
                          value={customerName}
                          onChange={(event) => setCustomerName(event.target.value)}
                          placeholder="Customer full name"
                          className="pl-9"
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor-customer-phone">Phone number (optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                          id="vendor-customer-phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(event) => setCustomerPhone(event.target.value)}
                          placeholder="Customer phone number"
                          className="pl-9"
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Payment method</CardTitle>
                <CardDescription>Select how the customer will pay before reviewing the booking.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-3">
                  <Label>Available methods</Label>
                  <PaymentProvider
                    icon={<Banknote className="size-5" />}
                    name="Cash at court"
                    description="Paid now · Booking will be confirmed immediately"
                    selected={paymentMethod === 'CASH_AT_COURT'}
                    onSelect={() => setPaymentMethod('CASH_AT_COURT')}
                  />
                  <PaymentProvider
                    icon={<QrCode className="size-5" />}
                    name="VNPay"
                    description="Online · Booking remains pending until payment succeeds"
                    selected={paymentMethod === 'VNPAY'}
                    onSelect={() => setPaymentMethod('VNPAY')}
                  />
                  <PaymentProvider icon={<WalletCards className="size-5" />} name="MoMo" description="Coming soon · Provider integration required" disabled />
                  <PaymentProvider icon={<CreditCard className="size-5" />} name="PayPal" description="Coming soon · Provider integration required" disabled />
                </div>

                <div className="h-fit rounded-xl border bg-muted/30 p-5">
                  <h3 className="font-semibold">Payment summary</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <SummaryRow label="Method" value={paymentMethod === 'CASH_AT_COURT' ? 'Cash at court' : 'VNPay'} />
                    <SummaryRow
                      label="Result"
                      value={paymentMethod === 'CASH_AT_COURT' ? 'Confirmed · Paid' : 'Pending payment'}
                    />
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4 border-t pt-4">
                    <span className="font-medium">Amount</span>
                    <span className="text-2xl font-semibold text-primary">{currencyFormatter.format(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Review and confirm</CardTitle>
                <CardDescription>Review all booking data before confirming and processing payment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="rounded-xl border p-5">
                    <h3 className="font-semibold">Customer</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <SummaryRow
                        label="Type"
                        value={customerMode === 'registered' ? 'System user' : 'Walk-in customer'}
                      />
                      <SummaryRow label="Name" value={customerName.trim() || 'Not entered'} />
                      <SummaryRow
                        label="Contact"
                        value={customerMode === 'registered'
                          ? linkedCustomer?.email || linkedCustomer?.phone || '-'
                          : customerPhone.trim() || 'Not provided'}
                      />
                      {customerMode === 'registered' && (
                        <SummaryRow label="Phone" value={linkedCustomer?.phone || '-'} />
                      )}
                    </div>
                  </section>

                  <section className="rounded-xl border p-5">
                    <h3 className="font-semibold">Court</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <SummaryRow label="Court" value={selectedCourt?.name ?? 'Not selected'} />
                      <SummaryRow label="Sport" value={selectedCourt?.sport.name ?? '-'} />
                      <SummaryRow label="Venue" value={selectedCourt?.venue.name ?? '-'} />
                      <SummaryRow
                        label="Rate"
                        value={selectedCourt ? `${currencyFormatter.format(selectedCourt.pricePerHour)}/hour` : '-'}
                      />
                    </div>
                  </section>

                  <section className="rounded-xl border p-5">
                    <h3 className="font-semibold">Schedule</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <SummaryRow label="Date" value={dateFormatter.format(bookingDate)} />
                      <SummaryRow
                        label="Time"
                        value={firstSelectedSlot && lastSelectedSlot
                          ? `${formatTime(firstSelectedSlot.startTime)} - ${formatTime(lastSelectedSlot.endTime)}`
                          : 'Not selected'}
                      />
                      <SummaryRow label="Duration" value={formatDuration(selectedDurationMinutes)} />
                      <SummaryRow label="Selected slots" value={String(selectedSlotIds.length)} />
                    </div>
                  </section>

                  <section className="rounded-xl border p-5">
                    <h3 className="font-semibold">Payment</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <SummaryRow
                        label="Method"
                        value={paymentMethod === 'CASH_AT_COURT' ? 'Cash at court' : 'VNPay'}
                      />
                      <SummaryRow
                        label="Booking status"
                        value={paymentMethod === 'CASH_AT_COURT' ? 'Confirmed' : 'Pending'}
                      />
                      <SummaryRow
                        label="Payment status"
                        value={paymentMethod === 'CASH_AT_COURT' ? 'Paid' : 'Pending'}
                      />
                    </div>
                  </section>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                  <div className="space-y-2">
                    <div className="flex justify-between gap-4">
                      <Label htmlFor="vendor-booking-note">Booking note</Label>
                      <span className="text-xs text-muted-foreground">{note.length}/{NOTE_MAX_LENGTH}</span>
                    </div>
                    <Textarea
                      id="vendor-booking-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={NOTE_MAX_LENGTH}
                      rows={4}
                      placeholder="Optional note for this booking"
                      className="resize-none"
                    />
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-5">
                    <p className="text-sm text-muted-foreground">Final amount</p>
                    <span className="text-2xl font-semibold text-primary">
                      {currencyFormatter.format(totalAmount)}
                    </span>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Confirming will create the booking and record the selected payment method.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep((current) => Math.max(1, current - 1) as BookingStep)}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>
            {currentStep < 5 ? (
              <Button type="button" size="lg" onClick={goToNextStep}>
                {currentStep === 4 ? 'Review booking' : 'Continue'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                disabled={!canSubmit}
                onClick={() => void handleCreateBooking()}
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {isSubmitting
                  ? 'Creating booking...'
                  : paymentMethod === 'CASH_AT_COURT'
                    ? 'Confirm paid booking'
                    : 'Confirm & proceed to VNPay'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentProvider({
  icon,
  name,
  description,
  selected = false,
  disabled = false,
  onSelect,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected && 'border-primary bg-primary/5 ring-1 ring-primary',
        !selected && !disabled && 'hover:border-primary/50 hover:bg-primary/5',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {selected && <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-44 text-right font-medium">{value}</span>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
