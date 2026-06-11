import {
  CheckCircle,
  Home,
  Info,
  MapPin,
  Refresh,
} from '@mynaui/icons-react';
import { CalendarDays, Clock3, MessageSquare, Receipt, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getBookingDetail } from '@/features/bookings/api/bookingsApi';
import type { BookingDetailResponse } from '@/features/bookings/types';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatTime(time: string) {
  return time.slice(0, 5);
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function BookingNoticePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const parsedId = Number(bookingId);

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isValidId = Number.isFinite(parsedId) && parsedId > 0;

  useEffect(() => {
    if (!isValidId) return;

    const controller = new AbortController();

    async function loadBookingDetails() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getBookingDetail(parsedId, controller.signal);
        setBooking(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setBooking(null);
        setErrorMessage(
          error instanceof Error ? error.message : 'Could not load booking details.',
        );
        setLoadState('error');
      }
    }

    void loadBookingDetails();

    return () => controller.abort();
  }, [isValidId, parsedId, reloadKey]);

  if (!isValidId) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-12">
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
          <h1 className="font-display text-lg font-bold text-foreground">
            Invalid Booking Code
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã đơn đặt sân trong URL không hợp lệ. Vui lòng kiểm tra lại.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link to={routePaths.home}>
              <Home className="size-4" /> Quay lại Trang chủ
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = loadState === 'idle' || loadState === 'loading';
  const isError = loadState === 'error';
  const hasData = loadState === 'success' && booking !== null;

  return (
    <div className="page-shell max-w-2xl mx-auto py-8">
      {isLoading && (
        <div className="space-y-6 text-center py-12">
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/2" />
          <Card className="mt-8">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      )}

      {isError && (
        <ApiErrorMessage
          title="Không thể tải thông tin đặt sân"
          message={errorMessage}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {hasData && booking && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Section: Thông báo trạng thái đặt sân & thanh toán */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="size-10" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {booking.payment.method === 'VNPAY'
                  ? 'Đặt sân & Thanh toán thành công!'
                  : 'Đặt sân thành công!'}
              </h1>
              <p className="text-base text-muted-foreground max-w-lg mx-auto">
                {booking.payment.method === 'VNPAY'
                  ? 'Đơn đặt sân của bạn đã được thanh toán online thành công qua cổng VNPay (Giả lập thanh toán thành công ở client).'
                  : 'Đơn đặt sân đã được hệ thống ghi nhận. Vui lòng thanh toán tiền mặt trực tiếp tại cơ sở khi đến nhận sân.'}
              </p>
            </div>
          </div>

          {/* Section: Chi tiết đơn đặt sân */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <Receipt className="size-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Chi tiết đơn đặt sân #{booking.id}
                </h2>
              </div>

              {/* Thông tin sân & cơ sở */}
              <div className="flex items-start gap-3 bg-muted/20 p-4 rounded-lg border border-border">
                <MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{booking.court.name}</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {booking.venue.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{booking.venue.address}</p>
                </div>
              </div>

              {/* Chi tiết lịch & giá */}
              <div className="grid gap-4 sm:grid-cols-2 text-sm text-foreground">
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày đặt sân</p>
                    <p className="font-medium">
                      {fullDateFormatter.format(parseLocalDate(booking.bookingDate))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Thời gian đặt</p>
                    <p className="font-medium">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Wallet className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hình thức thanh toán</p>
                    <p className="font-medium">
                      {booking.payment.method === 'VNPAY'
                        ? 'VNPay (Online)'
                        : 'Tiền mặt tại sân'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Info className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Trạng thái thanh toán</p>
                    <p className="font-semibold text-primary">
                      {booking.payment.method === 'VNPAY'
                        ? 'Đã thanh toán (Giả lập)'
                        : 'Chưa thanh toán (Tiền mặt)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ghi chú nếu có */}
              {booking.note && (
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="size-4" />
                    <span>Ghi chú của bạn:</span>
                  </div>
                  <p className="bg-muted/10 p-3 rounded border border-border text-muted-foreground italic leading-relaxed">
                    "{booking.note}"
                  </p>
                </div>
              )}

              {/* Số tiền thanh toán */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-medium text-foreground">Tổng tiền</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {currencyFormatter.format(booking.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Các nút hành động */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto font-semibold gap-2">
              <Link to={routePaths.home}>
                <Home className="size-4" /> Quay lại Trang chủ
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-semibold gap-2"
            >
              <Link to={routePaths.bookingHistory}>
                Quản lý đặt sân
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
