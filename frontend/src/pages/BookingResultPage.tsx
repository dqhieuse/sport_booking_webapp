import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hourglass,
  ReceiptText,
} from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateBookingResponse } from '@/features/bookings/types';
import { getBookingDetailPath, routePaths } from '@/routes/routePaths';

type LocationState = {
  booking: CreateBookingResponse;
};

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

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${minutes}m`;
}

export function BookingResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.booking) {
    return <Navigate to={routePaths.bookingHistory} replace />;
  }

  const { booking } = state;
  const isOnlinePayment = booking.payment.method === 'VNPAY';
  const hasPaymentUrl = isOnlinePayment && Boolean(booking.payment.paymentUrl);
  const paymentAmount = booking.payment.amount > 0 ? booking.payment.amount : booking.totalPrice;

  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center py-8">
      <Card className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-lg">
        <CardHeader className="items-center border-b bg-muted/30 px-6 py-8 text-center sm:px-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>
          <Badge variant="outline" className="mt-4 rounded-full border-primary/20 bg-primary/5 text-primary">
            Booking #{booking.id}
          </Badge>
          <CardTitle className="mt-3 text-2xl sm:text-3xl">Booking request created</CardTitle>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            Your selected time has been reserved. The booking is pending confirmation from the venue.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                Date
              </p>
              <p className="mt-2 text-sm font-semibold">
                {dateFormatter.format(parseLocalDate(booking.bookingDate))}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-4 text-primary" aria-hidden="true" />
                Time
              </p>
              <p className="mt-2 text-sm font-semibold">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)} ·{' '}
                {formatDuration(booking.durationMinutes)}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Court</p>
                <p className="mt-1 font-semibold">{booking.courtName}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {booking.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4 border-t pt-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <ReceiptText className="size-4" aria-hidden="true" />
                Total
              </span>
              <span className="text-lg font-semibold text-primary">
                {currencyFormatter.format(paymentAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t pt-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="size-4" aria-hidden="true" />
                Payment
              </span>
              <span className="text-right font-medium">
                {isOnlinePayment ? 'VNPay' : 'Pay at court'} · {booking.payment.status}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4 text-sm">
            <Hourglass className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">
                {isOnlinePayment ? 'Online payment is pending' : 'Payment will be collected at the court'}
              </p>
              <p className="mt-1 leading-5 text-muted-foreground">
                {isOnlinePayment
                  ? hasPaymentUrl
                    ? 'Continue to VNPay to finish payment for this booking.'
                    : 'The payment request was created, but no VNPay checkout URL is available yet.'
                  : 'Keep your booking details and pay the venue when you arrive.'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {hasPaymentUrl ? (
              <Button asChild size="lg" className="sm:col-span-2">
                <a href={booking.payment.paymentUrl}>
                  Continue to VNPay
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
            <Button asChild size="lg">
              <Link
                to={getBookingDetailPath(booking.id)}
                className="no-underline hover:no-underline"
              >
                View booking details
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={routePaths.bookingHistory} className="no-underline hover:no-underline">
                Booking history
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
