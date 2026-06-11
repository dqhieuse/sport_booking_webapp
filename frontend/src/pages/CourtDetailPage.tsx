import {
  ChevronRight,
  ClockCircle,
  MapPin,
  Refresh,
} from '@mynaui/icons-react';
import { CalendarDays, CheckCircle2, Clock3, RefreshCw, Settings, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { BackBreadcrumb } from '@/components/back-breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { DetailImageCarousel } from '@/components/detail-image-carousel';
import {
  getCourtAvailableSlots,
  getPublicCourtById,
  getPublicCourtImages,
} from '@/features/courts/api/courtsApi';
import type {
  AvailableTimeSlot,
  AvailableTimeSlotStatus,
  CourtDetail,
  CourtImage,
} from '@/features/courts/types';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type SlotPeriod = 'Morning' | 'Afternoon' | 'Evening';

const MAX_BOOKING_MINUTES = 180;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getBookingWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastBookableDate = new Date(today);
  lastBookableDate.setDate(today.getDate() + 13);
  return { today, lastBookableDate };
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
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  if (hours === 0) return `${minutes} minutes`;
  return `${hours}h ${minutes}m`;
}

function getSlotPeriod(slot: AvailableTimeSlot): SlotPeriod {
  const hour = Number(slot.startTime.slice(0, 2));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

const slotStatusConfig: Record<
  AvailableTimeSlotStatus,
  {
    label: string;
    description: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  AVAILABLE: {
    label: 'Available',
    description: 'Ready to book',
    className: 'border-border bg-background hover:border-primary/50 hover:bg-primary/5',
    icon: CheckCircle2,
  },
  BOOKED: {
    label: 'Booked',
    description: 'Already reserved',
    className: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
    icon: XCircle,
  },
  EXPIRED: {
    label: 'Expired',
    description: 'Booking time passed',
    className: 'border-border bg-muted/60 text-muted-foreground',
    icon: Clock3,
  },
  MAINTENANCE: {
    label: 'Maintenance',
    description: 'Temporarily unavailable',
    className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    icon: Settings,
  },
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Could not load court details.';
}

function getSlotErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Could not load available time slots.';
}

function SlotPickerSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Loading available time slots">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-lg" />
      ))}
    </div>
  );
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { courtId } = useParams<{ courtId: string }>();
  const parsedId = Number(courtId);

  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [images, setImages] = useState<CourtImage[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [slots, setSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [selectionMessage, setSelectionMessage] = useState(
    'Select a start time, then add consecutive slots up to 3 hours.',
  );
  const [slotLoadState, setSlotLoadState] = useState<LoadState>('idle');
  const [slotErrorMessage, setSlotErrorMessage] = useState<string | null>(null);
  const [slotReloadKey, setSlotReloadKey] = useState(0);

  const isValidId = Number.isFinite(parsedId) && parsedId > 0;
  const { today, lastBookableDate } = getBookingWindow();

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

  useEffect(() => {
    if (!isValidId) return;

    const controller = new AbortController();

    async function loadAvailableSlots() {
      setSlotLoadState('loading');
      setSlotErrorMessage(null);
      setSelectedSlotIds([]);
      setSelectionMessage('Select a start time, then add consecutive slots up to 3 hours.');

      try {
        const response = await getCourtAvailableSlots(parsedId, selectedDate, controller.signal);
        setSlots(response.data.items);
        setSlotLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setSlots([]);
        setSlotErrorMessage(getSlotErrorMessage(error));
        setSlotLoadState('error');
      }
    }

    void loadAvailableSlots();

    return () => controller.abort();
  }, [isValidId, parsedId, selectedDate, slotReloadKey]);

  const isLoading = loadState === 'idle' || loadState === 'loading';
  const isError = loadState === 'error';
  const hasData = loadState === 'success' && court !== null;
  const sortedSlots = [...slots].sort(
    (firstSlot, secondSlot) => timeToMinutes(firstSlot.startTime) - timeToMinutes(secondSlot.startTime),
  );
  const selectedSlots = sortedSlots.filter((slot) => selectedSlotIds.includes(slot.id));
  const firstSelectedSlot = selectedSlots[0] ?? null;
  const lastSelectedSlot = selectedSlots[selectedSlots.length - 1] ?? null;
  const selectedDurationMinutes = selectedSlots.reduce(
    (totalMinutes, slot) => totalMinutes + getSlotDurationMinutes(slot),
    0,
  );
  const bookingPreviewTotal = court ? court.pricePerHour * (selectedDurationMinutes / 60) : 0;
  const availableSlotCount = slots.filter((slot) => slot.status === 'AVAILABLE').length;
  const groupedSlots = slots.reduce<Partial<Record<SlotPeriod, AvailableTimeSlot[]>>>((groups, slot) => {
    const period = getSlotPeriod(slot);
    groups[period] = [...(groups[period] ?? []), slot];
    return groups;
  }, {});

  function handleSlotSelect(slot: AvailableTimeSlot) {
    if (slot.status !== 'AVAILABLE') return;

    const selectedIndex = selectedSlots.findIndex((selectedSlot) => selectedSlot.id === slot.id);

    if (selectedIndex >= 0) {
      if (selectedIndex === selectedSlots.length - 1) {
        const nextSelection = selectedSlots.slice(0, -1).map((selectedSlot) => selectedSlot.id);
        setSelectedSlotIds(nextSelection);
        setSelectionMessage(
          nextSelection.length === 0
            ? 'Select a start time, then add consecutive slots up to 3 hours.'
            : 'The booking preview has been shortened.',
        );
        return;
      }

      setSelectedSlotIds([slot.id]);
      setSelectionMessage('Started a new booking preview from this time.');
      return;
    }

    if (!lastSelectedSlot) {
      setSelectedSlotIds([slot.id]);
      setSelectionMessage('Select the next consecutive slot to extend this booking.');
      return;
    }

    const isConsecutive = formatTime(lastSelectedSlot.endTime) === formatTime(slot.startTime);
    const nextDurationMinutes = selectedDurationMinutes + getSlotDurationMinutes(slot);

    if (!isConsecutive) {
      setSelectedSlotIds([slot.id]);
      setSelectionMessage('Slots must be consecutive. A new preview was started from this time.');
      return;
    }

    if (nextDurationMinutes > MAX_BOOKING_MINUTES) {
      setSelectionMessage('A booking preview can include a maximum of 3 consecutive hours.');
      return;
    }

    setSelectedSlotIds((currentIds) => [...currentIds, slot.id]);
    setSelectionMessage(
      nextDurationMinutes === MAX_BOOKING_MINUTES
        ? 'Maximum booking duration reached.'
        : 'Consecutive slot added to the booking preview.',
    );
  }

  function handleBookClick() {
    if (selectedSlots.length === 0) return;
    const checkoutSearch = `?date=${selectedDate}&slots=${selectedSlotIds.join(',')}`;
    const checkoutPath = `/courts/${parsedId}/checkout`;

    if (!isAuthenticated) {
      navigate(routePaths.login, {
        state: {
          from: {
            pathname: checkoutPath,
            search: checkoutSearch,
          },
        },
      });
    } else {
      navigate(`${checkoutPath}${checkoutSearch}`);
    }
  }

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

              <section className="space-y-5" aria-labelledby="available-slots-heading">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Booking time</p>
                    <h2 id="available-slots-heading" className="section-title mt-1">
                      Choose an available time
                    </h2>
                  </div>
                  {slotLoadState === 'success' && (
                    <Badge variant="secondary" className="w-fit">
                      {availableSlotCount} {availableSlotCount === 1 ? 'slot' : 'slots'} available
                    </Badge>
                  )}
                </div>

                <Card>
                  <CardContent className="space-y-6 p-5 sm:p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground">Select a date</h3>
                        <p className="text-xs text-muted-foreground">Bookings are available within the next 14 days.</p>
                      </div>

                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-auto w-full max-w-sm justify-between px-4 py-3 text-left sm:w-80"
                          >
                            <span className="flex items-center gap-3">
                              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                              <span>
                                <span className="block text-xs font-normal text-muted-foreground">Booking date</span>
                                <span className="mt-0.5 block font-semibold text-foreground">
                                  {fullDateFormatter.format(parseLocalDate(selectedDate))}
                                </span>
                              </span>
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">Change</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0"
                        >
                          <Calendar
                            mode="single"
                            selected={parseLocalDate(selectedDate)}
                            defaultMonth={parseLocalDate(selectedDate)}
                            startMonth={today}
                            endMonth={lastBookableDate}
                            disabled={{ before: today, after: lastBookableDate }}
                            onSelect={(date) => {
                              if (!date) return;
                              setSelectedDate(toDateInputValue(date));
                              setIsCalendarOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="border-t pt-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">Available time slots</h3>
                          <p className="text-xs text-muted-foreground">You can select 1 to 3 consecutive hours.</p>
                        </div>
                        {slotLoadState === 'error' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSlotReloadKey((current) => current + 1)}
                          >
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Retry
                          </Button>
                        )}
                      </div>

                      {(slotLoadState === 'idle' || slotLoadState === 'loading') && <SlotPickerSkeleton />}

                      {slotLoadState === 'error' && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                          <p className="font-medium text-destructive">Unable to load time slots</p>
                          <p className="mt-1 text-sm text-muted-foreground">{slotErrorMessage}</p>
                        </div>
                      )}

                      {slotLoadState === 'success' && slots.length === 0 && (
                        <div className="rounded-lg border border-dashed bg-muted/30 px-5 py-8 text-center">
                          <ClockCircle className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
                          <p className="mt-2 font-medium text-foreground">No bookable times for this date</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try another date to see the court's available schedule.
                          </p>
                        </div>
                      )}

                      {slotLoadState === 'success' && slots.length > 0 && (
                        <div className="space-y-5">
                          <div className="flex flex-wrap gap-x-4 gap-y-2 border-b pb-4">
                            {(Object.entries(slotStatusConfig) as [AvailableTimeSlotStatus, typeof slotStatusConfig[AvailableTimeSlotStatus]][]).map(
                              ([status, config]) => {
                                const StatusIcon = config.icon;
                                return (
                                  <span key={status} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <StatusIcon className="size-3.5" aria-hidden="true" />
                                    {config.label}
                                  </span>
                                );
                              },
                            )}
                          </div>

                          {(['Morning', 'Afternoon', 'Evening'] as SlotPeriod[]).map((period) => {
                            const periodSlots = groupedSlots[period];
                            if (!periodSlots?.length) return null;

                            return (
                              <div key={period}>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {period}
                                </p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  {periodSlots.map((slot) => {
                                    const selectedIndex = selectedSlots.findIndex((selectedSlot) => selectedSlot.id === slot.id);
                                    const isSelected = selectedIndex >= 0;
                                    const isAvailable = slot.status === 'AVAILABLE';
                                    const statusConfig = slotStatusConfig[slot.status];
                                    const StatusIcon = statusConfig.icon;
                                    return (
                                      <button
                                        key={slot.id}
                                        type="button"
                                        disabled={!isAvailable}
                                        aria-pressed={isSelected}
                                        onClick={() => handleSlotSelect(slot)}
                                        title={statusConfig.description}
                                        className={cn(
                                          'relative min-h-16 rounded-lg border px-3 py-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                          isSelected
                                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                            : statusConfig.className,
                                          !isAvailable && 'cursor-not-allowed',
                                        )}
                                      >
                                        <span className={cn('block font-semibold', isAvailable && 'text-foreground')}>
                                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </span>
                                        <span className="mt-1 flex items-center gap-1 text-xs">
                                          <StatusIcon className="size-3.5" aria-hidden="true" />
                                          {statusConfig.label}
                                        </span>
                                        {isSelected && (
                                          <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                            {selectedIndex + 1}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>

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
                        <p className="font-medium text-foreground">Venue opening hours</p>
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
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-right font-medium text-foreground">
                      {dateFormatter.format(parseLocalDate(selectedDate))}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className={cn('text-right font-medium', firstSelectedSlot ? 'text-foreground' : 'text-muted-foreground')}>
                      {firstSelectedSlot && lastSelectedSlot
                        ? `${formatTime(firstSelectedSlot.startTime)} - ${formatTime(lastSelectedSlot.endTime)}`
                        : 'Select a slot'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className={cn('text-right font-medium', selectedDurationMinutes > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                      {selectedDurationMinutes > 0 ? formatDuration(selectedDurationMinutes) : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Selected slots</span>
                    <span className={cn('text-right font-medium', selectedSlots.length > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                      {selectedSlots.length > 0 ? selectedSlots.length : 'None'}
                    </span>
                  </div>
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
                      <span className="text-muted-foreground">Venue opening hours</span>
                      <span className="font-medium text-foreground">
                        {court.venue.openingTime} - {court.venue.closingTime}
                      </span>
                    </div>
                  )}
                </div>

                {selectedSlots.length > 0 && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated total</span>
                      <span className="font-display text-2xl font-semibold text-primary">
                        {currencyFormatter.format(bookingPreviewTotal)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Client preview only. Availability and price must be checked again when booking is submitted.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setSelectedSlotIds([]);
                        setSelectionMessage('Select a start time, then add consecutive slots up to 3 hours.');
                      }}
                    >
                      <Refresh size={16} />
                      Clear selected time
                    </Button>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  disabled={court.status !== 'ACTIVE' || selectedSlots.length === 0}
                  onClick={handleBookClick}
                >
                  {!isAuthenticated
                    ? 'Log in to book'
                    : selectedSlots.length > 0
                    ? 'Book now'
                    : 'Select a time slot'}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>

                <p className="text-center text-xs text-muted-foreground" aria-live="polite">
                  {court.status !== 'ACTIVE' ? (
                    'This court is currently unavailable for booking.'
                  ) : firstSelectedSlot && lastSelectedSlot ? (
                    <>
                      {formatDuration(selectedDurationMinutes)} from {formatTime(firstSelectedSlot.startTime)} to{' '}
                      {formatTime(lastSelectedSlot.endTime)} on {dateFormatter.format(parseLocalDate(selectedDate))}.
                    </>
                  ) : (
                    'Choose a date and available time to continue.'
                  )}
                </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
