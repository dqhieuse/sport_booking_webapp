import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  ListFilter,
  Plus,
  RefreshCw,
  Search,
  UsersRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/empty-state';
import { PaginationControls } from '@/components/pagination-controls';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getVendorBookings } from '@/features/bookings/api/bookingsApi';
import type { BookingStatus, PaymentStatus, VendorBookingResponse } from '@/features/bookings/types';
import { getVendorCourts } from '@/features/vendor/api/vendorApi';
import type { VendorCourt } from '@/features/vendor/types';
import { cn } from '@/lib/utils';
import { getVendorBookingDetailPath, routePaths } from '@/routes/routePaths';
import type { PageResponse } from '@/types/api';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const PAGE_SIZE = 10;
const ALL_VALUE = 'all';

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

const paymentLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PENDING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUND_PENDING: 'Chờ hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
  REFUND_FAILED: 'Hoàn tiền lỗi',
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function getStatusClass(status: BookingStatus) {
  if (status === 'CONFIRMED' || status === 'COMPLETED') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'PENDING') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400';
  }
  return 'border-destructive/20 bg-destructive/10 text-destructive';
}

function getPaymentClass(status: PaymentStatus) {
  if (status === 'PAID' || status === 'REFUNDED') {
    return 'text-emerald-700 dark:text-emerald-400';
  }
  if (status === 'FAILED' || status === 'REFUND_FAILED') {
    return 'text-destructive';
  }
  return 'text-amber-700 dark:text-amber-400';
}

function BookingListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Đang tải danh sách booking">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[440px] rounded-xl" />
    </div>
  );
}

export function VendorBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const statusFilter = Object.keys(statusLabels).includes(statusParam ?? '')
    ? (statusParam as BookingStatus)
    : ALL_VALUE;
  const courtParam = searchParams.get('courtId');
  const courtFilter = courtParam && /^\d+$/.test(courtParam) ? courtParam : ALL_VALUE;
  const dateFilter = searchParams.get('date') ?? '';
  const pageParam = Number(searchParams.get('page'));
  const requestedPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam - 1 : 0;

  const [bookingsPage, setBookingsPage] = useState<PageResponse<VendorBookingResponse> | null>(null);
  const [courts, setCourts] = useState<VendorCourt[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadCourtOptions() {
      try {
        const response = await getVendorCourts({ page: 0, size: 100 });
        if (isActive) {
          setCourts(response.data.items);
        }
      } catch {
        if (isActive) {
          setCourts([]);
        }
      }
    }

    void loadCourtOptions();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPage() {
      setLoadState('loading');
      setErrorMessage(null);
      try {
        const bookingResponse = await getVendorBookings(
          {
            status: statusFilter === ALL_VALUE ? undefined : statusFilter,
            courtId: courtFilter === ALL_VALUE ? undefined : Number(courtFilter),
            date: dateFilter || undefined,
            sortBy: 'bookingDate',
            direction: 'desc',
            page: requestedPage,
            size: PAGE_SIZE,
          },
          controller.signal,
        );
        setBookingsPage(bookingResponse.data);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setBookingsPage(null);
        setErrorMessage(error instanceof Error ? error.message : 'Không thể tải danh sách booking.');
        setLoadState('error');
      }
    }

    void loadPage();
    return () => controller.abort();
  }, [courtFilter, dateFilter, reloadKey, requestedPage, statusFilter]);

  useEffect(() => {
    if (!bookingsPage || requestedPage === 0 || requestedPage < bookingsPage.totalPages) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      const lastPage = Math.max(bookingsPage.totalPages - 1, 0);
      if (lastPage === 0) next.delete('page');
      else next.set('page', String(lastPage + 1));
      return next;
    }, { replace: true });
  }, [bookingsPage, requestedPage, setSearchParams]);

  const pageMetrics = useMemo(() => {
    const items = bookingsPage?.items ?? [];
    return {
      pending: items.filter((booking) => booking.status === 'PENDING').length,
      confirmed: items.filter((booking) => booking.status === 'CONFIRMED').length,
      unpaidCash: items.filter(
        (booking) => booking.payment.method === 'CASH_AT_COURT' && booking.payment.status !== 'PAID',
      ).length,
    };
  }, [bookingsPage]);

  function updateFilter(key: 'status' | 'courtId' | 'date', value: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === ALL_VALUE) next.delete(key);
      else next.set(key, value);
      next.delete('page');
      return next;
    });
  }

  function clearFilters() {
    setSearchParams({});
  }

  const bookings = bookingsPage?.items ?? [];
  const hasFilters = statusFilter !== ALL_VALUE || courtFilter !== ALL_VALUE || Boolean(dateFilter);

  return (
    <div className="page-shell">
      <section className="flex flex-col gap-5 border-b pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            Vận hành booking
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Quản lý bookings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Theo dõi lịch đặt sân, xử lý yêu cầu chờ duyệt và kiểm soát thanh toán tại sân.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link to={routePaths.vendorBookingCreate} className="no-underline hover:no-underline">
            <Plus className="size-4" aria-hidden="true" />
            Tạo booking
          </Link>
        </Button>
      </section>

      {(loadState === 'idle' || loadState === 'loading') && <BookingListSkeleton />}

      {loadState === 'error' && (
        <ApiErrorMessage
          title="Không thể tải bookings"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {loadState === 'success' && bookingsPage && (
        <>
          <section className="grid gap-4 sm:grid-cols-3" aria-label="Tổng quan trang hiện tại">
            {[
              { label: 'Chờ phê duyệt', value: pageMetrics.pending, icon: Clock3, tone: 'text-amber-600 bg-amber-500/10' },
              { label: 'Đã xác nhận', value: pageMetrics.confirmed, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-500/10' },
              { label: 'Tiền mặt chưa thu', value: pageMetrics.unpaidCash, icon: Banknote, tone: 'text-sky-600 bg-sky-500/10' },
            ].map((metric) => (
              <Card key={metric.label}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Trên trang hiện tại</p>
                  </div>
                  <span className={cn('flex size-11 items-center justify-center rounded-xl', metric.tone)}>
                    <metric.icon className="size-5" aria-hidden="true" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card>
            <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
              <div>
                <CardTitle>Danh sách booking</CardTitle>
                <CardDescription>
                  {bookingsPage.totalItems} booking phù hợp với bộ lọc hiện tại.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setReloadKey((current) => current + 1)}>
                <RefreshCw className="size-4" aria-hidden="true" />
                Làm mới
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1fr_auto]">
                <Select value={statusFilter} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger aria-label="Lọc trạng thái booking">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Tất cả trạng thái</SelectItem>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={courtFilter} onValueChange={(value) => updateFilter('courtId', value)}>
                  <SelectTrigger aria-label="Lọc theo sân">
                    <SelectValue placeholder="Tất cả sân" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Tất cả sân</SelectItem>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={String(court.id)}>{court.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFilter}
                  aria-label="Lọc theo ngày booking"
                  onChange={(event) => updateFilter('date', event.target.value)}
                />
                <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters}>
                  <ListFilter className="size-4" aria-hidden="true" />
                  Xóa lọc
                </Button>
              </div>

              {bookings.length === 0 ? (
                <EmptyState
                  icon={<Search className="size-6" aria-hidden="true" />}
                  title="Không có booking phù hợp"
                  description="Thử thay đổi bộ lọc hoặc tạo booking trực tiếp cho khách hàng."
                  action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button> : undefined}
                  className="max-w-none border"
                />
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-xl border lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Lịch đặt</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thanh toán</TableHead>
                          <TableHead className="text-right">Tổng tiền</TableHead>
                          <TableHead className="w-16"><span className="sr-only">Chi tiết</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <p className="font-semibold">#{booking.id}</p>
                              <p className="mt-1 max-w-44 truncate text-xs text-muted-foreground">{booking.court.name}</p>
                            </TableCell>
                            <TableCell>
                              <p className="max-w-40 truncate font-medium">{booking.user.fullName}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{booking.user.phone || 'Chưa có SĐT'}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{dateFormatter.format(parseLocalDate(booking.bookingDate))}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('whitespace-nowrap', getStatusClass(booking.status))}>
                                {statusLabels[booking.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="flex items-center gap-1.5 text-sm font-medium">
                                {booking.payment.method === 'VNPAY'
                                  ? <CreditCard className="size-4" aria-hidden="true" />
                                  : <Banknote className="size-4" aria-hidden="true" />}
                                {booking.payment.method === 'VNPAY' ? 'VNPay' : 'Tại sân'}
                              </p>
                              <p className={cn('mt-1 text-xs font-medium', getPaymentClass(booking.payment.status))}>
                                {paymentLabels[booking.payment.status]}
                              </p>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {currencyFormatter.format(booking.totalPrice)}
                            </TableCell>
                            <TableCell>
                              <Button asChild variant="ghost" size="icon" aria-label={`Xem booking ${booking.id}`}>
                                <Link to={getVendorBookingDetailPath(booking.id)} className="no-underline hover:no-underline">
                                  <Eye className="size-4" aria-hidden="true" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid gap-3 lg:hidden">
                    {bookings.map((booking) => (
                      <article key={booking.id} className="rounded-xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Booking #{booking.id}</p>
                            <h3 className="mt-1 truncate font-semibold">{booking.court.name}</h3>
                          </div>
                          <Badge variant="outline" className={cn('shrink-0', getStatusClass(booking.status))}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <p className="flex items-center gap-2"><UsersRound className="size-4 text-primary" />{booking.user.fullName}</p>
                          <p className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{dateFormatter.format(parseLocalDate(booking.bookingDate))}</p>
                          <p className="flex items-center gap-2"><Clock3 className="size-4 text-primary" />{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                          <p className="font-semibold sm:text-right">{currencyFormatter.format(booking.totalPrice)}</p>
                        </div>
                        <Button asChild variant="outline" className="mt-4 w-full">
                          <Link to={getVendorBookingDetailPath(booking.id)} className="no-underline hover:no-underline">
                            Xem và xử lý booking
                          </Link>
                        </Button>
                      </article>
                    ))}
                  </div>

                  {bookingsPage.totalPages > 1 && (
                    <PaginationControls
                      page={bookingsPage.page}
                      totalPages={bookingsPage.totalPages}
                      totalItems={bookingsPage.totalItems}
                      itemLabel="bookings"
                      onPageChange={(page) => {
                        setSearchParams((current) => {
                          const next = new URLSearchParams(current);
                          if (page === 0) next.delete('page');
                          else next.set('page', String(page + 1));
                          return next;
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
