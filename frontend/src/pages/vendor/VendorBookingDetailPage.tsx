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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  cancelVendorBooking,
  confirmVendorBooking,
  getVendorBookingDetail,
  markVendorBookingCashPaid,
  rejectVendorBooking,
} from '@/features/bookings/api/bookingsApi';
import type {
  BookingDetailResponse,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/features/bookings/types';
import { ConfirmActionDialog } from '@/features/vendor/components/ConfirmActionDialog';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type BookingAction = 'confirm' | 'reject' | 'cancel' | 'mark-paid';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Chờ phê duyệt',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PENDING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUND_PENDING: 'Đang chờ hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
  REFUND_FAILED: 'Hoàn tiền thất bại',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  VNPAY: 'VNPay',
  CASH_AT_COURT: 'Thanh toán tại sân',
};

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(':').map(Number);
  return hour * 60 + minute;
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours} giờ`;
  if (hours === 0) return `${minutes} phút`;
  return `${hours} giờ ${minutes} phút`;
}

function getStatusPresentation(status: BookingStatus) {
  if (status === 'CONFIRMED') {
    return {
      icon: CheckCircle2,
      className: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
      panel: 'border-sky-500/20 bg-sky-500/5',
      description: 'Booking đã được xác nhận và lịch sân đang được giữ cho khách.',
    };
  }
  if (status === 'COMPLETED') {
    return {
      icon: CheckCircle2,
      className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      panel: 'border-emerald-500/20 bg-emerald-500/5',
      description: 'Booking đã hoàn thành, không còn thao tác vận hành cần xử lý.',
    };
  }
  if (status === 'PENDING') {
    return {
      icon: Hourglass,
      className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      panel: 'border-amber-500/20 bg-amber-500/5',
      description: 'Booking đang chờ vendor kiểm tra lịch và phê duyệt hoặc từ chối.',
    };
  }
  return {
    icon: XCircle,
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
    panel: 'border-destructive/20 bg-destructive/5',
    description: status === 'REJECTED'
      ? 'Vendor đã từ chối yêu cầu booking này.'
      : 'Booking đã bị hủy và khung giờ không còn được giữ.',
  };
}

function getPaymentClass(status: PaymentStatus) {
  if (status === 'PAID' || status === 'REFUNDED') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'FAILED' || status === 'REFUND_FAILED') {
    return 'border-destructive/20 bg-destructive/10 text-destructive';
  }
  return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400';
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Đang tải chi tiết booking">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    </div>
  );
}

export function VendorBookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const parsedId = Number(bookingId);
  const isValidId = Number.isInteger(parsedId) && parsedId > 0;
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedAction, setSelectedAction] = useState<BookingAction | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    if (!isValidId) return;
    const controller = new AbortController();

    async function loadBooking() {
      setLoadState('loading');
      setErrorMessage(null);
      try {
        const response = await getVendorBookingDetail(parsedId, controller.signal);
        setBooking(response.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setBooking(null);
        setErrorMessage(error instanceof Error ? error.message : 'Không thể tải chi tiết booking.');
        setLoadState('error');
      }
    }

    void loadBooking();
    return () => controller.abort();
  }, [isValidId, parsedId, reloadKey]);

  const durationMinutes = useMemo(
    () => booking?.slots.reduce(
      (total, slot) => total + timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime),
      0,
    ) ?? 0,
    [booking],
  );

  const actionContent = useMemo(() => {
    if (!booking || !selectedAction) return null;
    const schedule = `${dateFormatter.format(parseLocalDate(booking.bookingDate))}, ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`;
    const content: Record<BookingAction, {
      title: string;
      description: string;
      confirmLabel: string;
      success: string;
      destructive?: boolean;
    }> = {
      confirm: {
        title: 'Phê duyệt booking?',
        description: `Xác nhận booking #${booking.id} vào ${schedule}. Khách hàng sẽ được giữ lịch sân này.`,
        confirmLabel: 'Phê duyệt booking',
        success: 'Đã phê duyệt booking',
      },
      reject: {
        title: 'Từ chối booking?',
        description: `Booking #${booking.id} sẽ bị từ chối và khung giờ được mở lại. Nếu khách đã thanh toán, hệ thống chuyển sang chờ hoàn tiền.`,
        confirmLabel: 'Từ chối booking',
        success: 'Đã từ chối booking',
        destructive: true,
      },
      cancel: {
        title: 'Hủy booking?',
        description: `Booking #${booking.id} vào ${schedule} sẽ bị hủy. Thao tác này không thể hoàn tác.`,
        confirmLabel: 'Hủy booking',
        success: 'Đã hủy booking',
        destructive: true,
      },
      'mark-paid': {
        title: 'Xác nhận đã thu tiền mặt?',
        description: `Xác nhận đã nhận đủ ${currencyFormatter.format(booking.payment.amount)} từ khách hàng. Chỉ thực hiện sau khi đã kiểm tra tiền thực tế.`,
        confirmLabel: 'Đánh dấu đã thanh toán',
        success: 'Đã ghi nhận thanh toán tiền mặt',
      },
    };
    return content[selectedAction];
  }, [booking, selectedAction]);

  async function handleAction() {
    if (!selectedAction) return;
    setIsMutating(true);
    try {
      if (selectedAction === 'confirm') await confirmVendorBooking(parsedId);
      if (selectedAction === 'reject') await rejectVendorBooking(parsedId);
      if (selectedAction === 'cancel') await cancelVendorBooking(parsedId);
      if (selectedAction === 'mark-paid') await markVendorBookingCashPaid(parsedId);
      toast.success(actionContent?.success);
      setSelectedAction(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('Không thể cập nhật booking', {
        description: error instanceof Error ? error.message : 'Vui lòng thử lại.',
      });
    } finally {
      setIsMutating(false);
    }
  }

  if (!isValidId) {
    return (
      <div className="page-shell">
        <ApiErrorMessage title="Booking ID không hợp lệ" message="Không tìm thấy booking được yêu cầu." />
      </div>
    );
  }

  const canApprove = booking?.status === 'PENDING';
  const canCancel = booking?.status === 'PENDING' || booking?.status === 'CONFIRMED';
  const canMarkPaid = booking?.payment.method === 'CASH_AT_COURT'
    && booking.payment.status !== 'PAID'
    && booking.status !== 'CANCELLED'
    && booking.status !== 'REJECTED';

  return (
    <div className="page-shell pb-12">
      <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
        <Link to={routePaths.vendorBookings} className="no-underline hover:no-underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Danh sách bookings
        </Link>
      </Button>

      {(loadState === 'idle' || loadState === 'loading') && <DetailSkeleton />}

      {loadState === 'error' && (
        <ApiErrorMessage
          title="Không thể tải booking"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {loadState === 'success' && booking && (() => {
        const status = getStatusPresentation(booking.status);
        const StatusIcon = status.icon;

        return (
          <>
            <header className="flex flex-col gap-5 border-b pb-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Booking #{booking.id}</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {booking.court.name}
                </h1>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground sm:text-base">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{booking.venue.name} · {booking.venue.address}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Tạo lúc {dateTimeFormatter.format(new Date(booking.createdAt))}
              </p>
            </header>

            <div className={cn('flex items-start gap-4 rounded-xl border p-5', status.panel)}>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl border', status.className)}>
                <StatusIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <Badge variant="outline" className={status.className}>{statusLabels[booking.status]}</Badge>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.description}</p>
              </div>
            </div>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Lịch đặt sân</CardTitle>
                    <CardDescription>Ngày, thời lượng và các khung giờ đã đặt.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Ngày booking', value: dateFormatter.format(parseLocalDate(booking.bookingDate)), icon: CalendarDays },
                        { label: 'Khung giờ', value: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`, icon: Clock3 },
                        { label: 'Thời lượng', value: formatDuration(durationMinutes), icon: Timer },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-muted/50 p-4">
                          <item.icon className="size-5 text-primary" aria-hidden="true" />
                          <p className="mt-3 text-xs text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-medium">Chi tiết khung giờ</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {booking.slots.map((slot, index) => (
                          <div key={slot.id} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{currencyFormatter.format(slot.slotPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Khách hàng</CardTitle>
                    <CardDescription>Thông tin liên hệ gắn với booking.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-5 rounded-xl border bg-muted/20 p-5 sm:grid-cols-2">
                      <div className="flex gap-3 sm:col-span-2">
                        <UserRound className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                        <div>
                          <p className="text-xs text-muted-foreground">Họ tên</p>
                          <p className="mt-1 font-medium">{booking.user.fullName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {booking.user.id ? `Tài khoản #${booking.user.id}` : 'Khách vãng lai'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Phone className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                        <div>
                          <p className="text-xs text-muted-foreground">Số điện thoại</p>
                          <p className="mt-1 text-sm font-medium">{booking.user.phone || 'Chưa cung cấp'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Mail className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="mt-1 break-all text-sm font-medium">{booking.user.email || 'Chưa cung cấp'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Địa điểm</CardTitle>
                    <CardDescription>Thông tin sân và venue phục vụ booking.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4 rounded-xl border bg-muted/20 p-5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold">{booking.court.name}</p>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">{booking.venue.name}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{booking.venue.address}</p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Giá niêm yết: {currencyFormatter.format(booking.court.pricePerHour)}/giờ
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {booking.note && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <StickyNote className="size-5 text-primary" aria-hidden="true" />
                        Ghi chú booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="rounded-xl border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                        {booking.note}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <aside className="space-y-4 xl:sticky xl:top-20">
                <Card className="overflow-hidden border-primary/20 shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ReceiptText className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <CardTitle>Thanh toán</CardTitle>
                        <CardDescription>Thông tin thu tiền booking</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Phương thức</span>
                        <span className="flex items-center gap-2 text-right font-medium">
                          {booking.payment.method === 'VNPAY'
                            ? <CreditCard className="size-4 text-primary" aria-hidden="true" />
                            : <Banknote className="size-4 text-primary" aria-hidden="true" />}
                          {paymentMethodLabels[booking.payment.method]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Trạng thái</span>
                        <Badge variant="outline" className={getPaymentClass(booking.payment.status)}>
                          {paymentStatusLabels[booking.payment.status]}
                        </Badge>
                      </div>
                      {booking.payment.paidAt && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Thanh toán lúc</span>
                          <span className="text-right font-medium">{dateTimeFormatter.format(new Date(booking.payment.paidAt))}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="font-medium">Tổng cộng</p>
                          <p className="mt-1 text-xs text-muted-foreground">{booking.slots.length} khung giờ</p>
                        </div>
                        <p className="text-2xl font-semibold text-primary">{currencyFormatter.format(booking.totalPrice)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(canApprove || canCancel) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Thao tác booking</CardTitle>
                      <CardDescription>Thay đổi trạng thái và lịch giữ sân của booking.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {canApprove && (
                        <>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">Phê duyệt booking</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Xác nhận vendor có thể phục vụ và tiếp tục giữ lịch sân cho khách.
                              </p>
                            </div>
                            <Button className="w-full" onClick={() => setSelectedAction('confirm')}>
                              <CheckCircle2 className="size-4" aria-hidden="true" />
                              Phê duyệt booking
                            </Button>
                          </div>
                          <div className="border-t pt-4">
                            <div>
                              <p className="text-sm font-medium">Từ chối booking</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Từ chối yêu cầu và mở lại khung giờ. Khoản đã thanh toán sẽ chuyển sang chờ hoàn tiền.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="mt-2 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setSelectedAction('reject')}
                            >
                              <XCircle className="size-4" aria-hidden="true" />
                              Từ chối booking
                            </Button>
                          </div>
                        </>
                      )}
                      {canCancel && (
                        <div className={cn(canApprove && 'border-t pt-4')}>
                          <div>
                            <p className="text-sm font-medium">Hủy booking</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Hủy booking đang hoạt động và giải phóng lịch sân. Thao tác này không thể hoàn tác.
                            </p>
                          </div>
                          <Button
                            variant="destructive_ghost"
                            className="mt-2 w-full"
                            onClick={() => setSelectedAction('cancel')}
                          >
                            <Ban className="size-4" aria-hidden="true" />
                            Hủy booking
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {canMarkPaid && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Thao tác thanh toán</CardTitle>
                      <CardDescription>Cập nhật khoản thanh toán được xử lý trực tiếp tại sân.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <p className="text-sm font-medium">Xác nhận đã thu tiền mặt</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Đánh dấu đã thanh toán sau khi vendor thực tế nhận đủ{' '}
                          {currencyFormatter.format(booking.payment.amount)} từ khách hàng.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => setSelectedAction('mark-paid')}
                      >
                        <Banknote className="size-4" aria-hidden="true" />
                        Xác nhận đã thu tiền mặt
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Button asChild variant="outline" className="w-full">
                  <Link to={routePaths.vendorBookings} className="no-underline hover:no-underline">
                    Xem tất cả bookings
                  </Link>
                </Button>
              </aside>
            </div>

            <ConfirmActionDialog
              open={selectedAction !== null}
              onOpenChange={(open) => {
                if (!open && !isMutating) setSelectedAction(null);
              }}
              title={actionContent?.title ?? ''}
              description={actionContent?.description ?? ''}
              confirmLabel={actionContent?.confirmLabel ?? 'Xác nhận'}
              onConfirm={handleAction}
              isConfirming={isMutating}
              variant={actionContent?.destructive ? 'destructive_ghost' : 'default'}
            />
          </>
        );
      })()}
    </div>
  );
}
