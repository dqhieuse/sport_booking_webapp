import {
  ArrowLeft,
  Banknote,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hourglass,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  StickyNote,
  Timer,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cancelBooking, getBookingDetail } from '@/features/bookings/api/bookingsApi';
import type {
  BookingDetailResponse,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/features/bookings/types';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

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

const createdAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: 'Pending confirmation',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Unpaid',
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUND_PENDING: 'Refund pending',
  REFUNDED: 'Refunded',
  REFUND_FAILED: 'Refund failed',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  VNPAY: 'VNPay',
  CASH_AT_COURT: 'Pay at court',
};

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

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${minutes}m`;
}

function getBookingStatusStyle(status: BookingStatus) {
  switch (status) {
    case 'CONFIRMED':
      return {
        badge: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400',
        panel: 'border-sky-500/20 bg-sky-500/5',
        icon: CheckCircle2,
        description: 'The venue has confirmed this reservation.',
      };
    case 'COMPLETED':
      return {
        badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        panel: 'border-emerald-500/20 bg-emerald-500/5',
        icon: CheckCircle2,
        description: 'This booking has been completed.',
      };
    case 'CANCELLED':
      return {
        badge: 'border-destructive/20 bg-destructive/10 text-destructive',
        panel: 'border-destructive/20 bg-destructive/5',
        icon: XCircle,
        description: 'This booking was cancelled and is no longer active.',
      };
    case 'REJECTED':
      return {
        badge: 'border-destructive/20 bg-destructive/10 text-destructive',
        panel: 'border-destructive/20 bg-destructive/5',
        icon: XCircle,
        description: 'The venue could not accept this booking request.',
      };
    default:
      return {
        badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        panel: 'border-amber-500/20 bg-amber-500/5',
        icon: Hourglass,
        description: 'Your selected time is reserved while waiting for venue confirmation.',
      };
  }
}

function getPaymentStatusStyle(status: PaymentStatus) {
  if (status === 'PAID' || status === 'REFUNDED') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  }

  if (status === 'FAILED' || status === 'REFUND_FAILED') {
    return 'border-destructive/20 bg-destructive/10 text-destructive';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading booking details">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <Skeleton className="h-[430px] rounded-2xl" />
      </div>
    </div>
  );
}

export function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const parsedId = Number(bookingId);
  const isValidId = Number.isFinite(parsedId) && parsedId > 0;

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isValidId) return;

    const controller = new AbortController();

    async function loadBooking() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getBookingDetail(parsedId, controller.signal);
        setBooking(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setBooking(null);
        setErrorMessage(error instanceof Error ? error.message : 'Could not load booking details.');
        setLoadState('error');
      }
    }

    void loadBooking();
    return () => controller.abort();
  }, [isValidId, parsedId, reloadKey]);

  const durationMinutes = useMemo(() => {
    if (!booking) return 0;

    return booking.slots.reduce(
      (total, slot) => total + timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime),
      0,
    );
  }, [booking]);

  async function handleCancelBooking() {
    setIsCancelling(true);

    try {
      await cancelBooking(parsedId);
      toast.success('Booking cancelled successfully');
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('Booking could not be cancelled', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsCancelling(false);
    }
  }

  if (!isValidId) {
    return (
      <div className="page-shell">
        <ApiErrorMessage title="Invalid booking ID" message="The requested booking could not be found." />
      </div>
    );
  }

  const courtDetailPath = booking
    ? routePaths.courtDetail.replace(':courtId', String(booking.court.id))
    : routePaths.courts;
  const venueDetailPath = booking
    ? routePaths.venueDetail.replace(':venueId', String(booking.venue.id))
    : routePaths.venues;

  return (
    <div className="page-shell pb-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
          <Link to={routePaths.bookingHistory} className="no-underline hover:no-underline">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Booking history
          </Link>
        </Button>

        {(loadState === 'idle' || loadState === 'loading') && <BookingDetailSkeleton />}

        {loadState === 'error' && (
          <ApiErrorMessage
            title="Unable to load booking"
            message={errorMessage}
            onRetry={() => setReloadKey((current) => current + 1)}
          />
        )}

        {loadState === 'success' && booking && (
          <>
            <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Booking #{booking.id}</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {booking.court.name}
                </h1>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground sm:text-base">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {booking.venue.name} · {booking.venue.address}
                  </span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {createdAtFormatter.format(new Date(booking.createdAt))}
              </p>
            </header>

            {(() => {
              const statusStyle = getBookingStatusStyle(booking.status);
              const StatusIcon = statusStyle.icon;

              return (
                <div className={cn('flex items-start gap-4 rounded-2xl border p-5', statusStyle.panel)}>
                  <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl border', statusStyle.badge)}>
                    <StatusIcon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <Badge variant="outline" className={cn('rounded-full', statusStyle.badge)}>
                      {bookingStatusLabels[booking.status]}
                    </Badge>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {statusStyle.description}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <Card className="rounded-2xl">
                  <CardHeader className="border-b">
                    <CardTitle className="text-xl">Schedule</CardTitle>
                    <CardDescription>Date, duration, and reserved time slots.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-muted/50 p-4">
                        <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                        <p className="mt-3 text-xs text-muted-foreground">Booking date</p>
                        <p className="mt-1 text-sm font-semibold leading-5">
                          {dateFormatter.format(parseLocalDate(booking.bookingDate))}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <Clock3 className="size-5 text-primary" aria-hidden="true" />
                        <p className="mt-3 text-xs text-muted-foreground">Time</p>
                        <p className="mt-1 text-sm font-semibold">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <Timer className="size-5 text-primary" aria-hidden="true" />
                        <p className="mt-3 text-xs text-muted-foreground">Duration</p>
                        <p className="mt-1 text-sm font-semibold">{formatDuration(durationMinutes)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium">Reserved time slots</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {booking.slots.map((slot, index) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {currencyFormatter.format(slot.slotPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Venue & court</CardTitle>
                    <CardDescription>Where this booking will take place.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4 rounded-xl border bg-muted/30 p-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{booking.venue.name}</p>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {booking.venue.address}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button asChild variant="outline" size="sm">
                            <Link to={courtDetailPath} className="no-underline hover:no-underline">
                              View court
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={venueDetailPath} className="no-underline hover:no-underline">
                              View venue
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Booking contact</CardTitle>
                    <CardDescription>Contact information attached to this reservation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <UserRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <p className="text-xs text-muted-foreground">Customer</p>
                          <p className="mt-1 text-sm font-medium">{booking.user.fullName}</p>
                        </div>
                      </div>
                      {booking.user.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="mt-1 break-all text-sm font-medium">{booking.user.email}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="mt-1 text-sm font-medium">{booking.user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {booking.note && (
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <StickyNote className="size-5 text-primary" aria-hidden="true" />
                        Note for the venue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                        {booking.note}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24">
                <Card className="overflow-hidden rounded-2xl border-primary/20 shadow-md">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ReceiptText className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <CardTitle className="text-xl">Payment summary</CardTitle>
                        <CardDescription>Booking and payment information</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="text-right font-medium">
                          {currencyFormatter.format(booking.court.pricePerHour)}/hour
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{formatDuration(durationMinutes)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Payment method</span>
                        <span className="flex items-center gap-2 font-medium">
                          {booking.payment.method === 'VNPAY' ? (
                            <CreditCard className="size-4 text-primary" aria-hidden="true" />
                          ) : (
                            <Banknote className="size-4 text-primary" aria-hidden="true" />
                          )}
                          {paymentMethodLabels[booking.payment.method]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Payment status</span>
                        <Badge
                          variant="outline"
                          className={cn('rounded-full', getPaymentStatusStyle(booking.payment.status))}
                        >
                          {paymentStatusLabels[booking.payment.status]}
                        </Badge>
                      </div>
                      {booking.payment.paidAt && (
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Paid at</span>
                          <span className="text-right font-medium">
                            {createdAtFormatter.format(new Date(booking.payment.paidAt))}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="font-medium">Total</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {booking.slots.length} selected {booking.slots.length === 1 ? 'slot' : 'slots'}
                          </p>
                        </div>
                        <p className="text-2xl font-semibold text-primary">
                          {currencyFormatter.format(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive_ghost"
                        size="lg"
                        className="w-full"
                        disabled={isCancelling}
                      >
                        <Ban className="size-4" aria-hidden="true" />
                        Cancel booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-6">
                      <AlertDialogHeader>
                        <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <Ban className="size-5" aria-hidden="true" />
                        </span>
                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                        <AlertDialogDescription className="leading-6">
                          Booking #{booking.id} for {dateFormatter.format(parseLocalDate(booking.bookingDate))},{' '}
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)} will be cancelled.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep booking</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleCancelBooking}
                        >
                          Yes, cancel booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to={routePaths.bookingHistory} className="no-underline hover:no-underline">
                    View all bookings
                  </Link>
                </Button>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
