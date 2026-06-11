import {
  ArrowLeft,
  ChevronRight,
  ClockCircle,
  CreditCard,
  MapPin,
  Message,
} from '@mynaui/icons-react';
import { CalendarDays, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { BackBreadcrumb } from '@/components/back-breadcrumb';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { createBooking } from '@/features/bookings/api/bookingsApi';
import type { PaymentMethod } from '@/features/bookings/types';
import {
  getCourtAvailableSlots,
  getPublicCourtById,
} from '@/features/courts/api/courtsApi';
import type { AvailableTimeSlot, CourtDetail } from '@/features/courts/types';
import { cn } from '@/lib/utils';

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

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function BookingCheckoutPage() {
  const { courtId } = useParams<{ courtId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const date = searchParams.get('date') || '';
  const slotsParam = searchParams.get('slots') || '';
  const parsedCourtId = Number(courtId);

  const slotIds = useMemo(() => {
    return slotsParam ? slotsParam.split(',').map(Number) : [];
  }, [slotsParam]);

  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [slots, setSlots] = useState<AvailableTimeSlot[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isValidParams =
    Number.isFinite(parsedCourtId) && parsedCourtId > 0 && date && slotIds.length > 0;

  useEffect(() => {
    if (!isValidParams) return;

    const controller = new AbortController();

    async function loadCheckoutData() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [courtResponse, slotsResponse] = await Promise.all([
          getPublicCourtById(parsedCourtId, controller.signal),
          getCourtAvailableSlots(parsedCourtId, date, controller.signal),
        ]);

        setCourt(courtResponse.data);
        setSlots(slotsResponse.data.items);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) return;
        setCourt(null);
        setSlots([]);
        setErrorMessage(
          error instanceof Error ? error.message : 'Could not load booking details.',
        );
        setLoadState('error');
      }
    }

    void loadCheckoutData();

    return () => controller.abort();
  }, [isValidParams, parsedCourtId, date, reloadKey]);

  // Tìm các slot người dùng đã chọn
  const selectedSlots = useMemo(() => {
    if (slots.length === 0 || slotIds.length === 0) return [];
    return slots
      .filter((slot) => slotIds.includes(slot.id))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [slots, slotIds]);

  const firstSelectedSlot = selectedSlots[0] ?? null;
  const lastSelectedSlot = selectedSlots[selectedSlots.length - 1] ?? null;

  const durationMinutes = useMemo(() => {
    return selectedSlots.reduce(
      (total, slot) => total + getSlotDurationMinutes(slot),
      0,
    );
  }, [selectedSlots]);

  const totalPrice = useMemo(() => {
    if (!court) return 0;
    return court.pricePerHour * (durationMinutes / 60);
  }, [court, durationMinutes]);

  async function handleBookConfirm() {
    if (!isValidParams || selectedSlots.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await createBooking({
        courtId: parsedCourtId,
        timeSlotIds: slotIds,
        bookingDate: date,
        paymentMethod,
        note: note.trim() || undefined,
      });

      const newBooking = response.data;
      // Chuyển sang trang thông báo trạng thái
      navigate(`/bookings/${newBooking.id}/notice`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create booking. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isValidParams) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
          <h1 className="font-display text-lg font-bold text-foreground">
            Invalid Booking Information
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The booking parameters are missing or incorrect. Please return to the court details page and select your time slot again.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = loadState === 'idle' || loadState === 'loading';
  const isError = loadState === 'error';
  const hasData = loadState === 'success' && court !== null && selectedSlots.length > 0;

  return (
    <div className="page-shell">
      <BackBreadcrumb
        parentLabel="Court Details"
        parentTo={`/courts/${parsedCourtId}`}
        currentLabel="Checkout"
      />

      <header className="space-y-2">
        <p className="eyebrow text-primary font-semibold tracking-wide">Đặt sân</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Booking Checkout
        </h1>
      </header>

      {isLoading && (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      )}

      {isError && (
        <ApiErrorMessage
          title="Unable to load booking configuration"
          message={errorMessage}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {hasData && court && (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cột trái: Form cấu hình thanh toán & ghi chú */}
          <div className="space-y-6">
            {submitError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                <p className="font-medium text-destructive">Không thể tạo đơn đặt sân</p>
                <p className="mt-1 text-sm text-muted-foreground">{submitError}</p>
              </div>
            )}

            {/* Phương thức thanh toán */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Payment Method
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    paymentMethod === 'VNPAY'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-background',
                  )}
                >
                  <img
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"
                    alt="VNPay Logo"
                    className="mt-0.5 h-5 w-auto shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-foreground">VNPay Online</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Thanh toán qua ví VNPay, quét mã QR hoặc thẻ ngân hàng nội địa.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_AT_COURT')}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    paymentMethod === 'CASH_AT_COURT'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-background',
                  )}
                >
                  <Wallet className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Cash at Venue</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Thanh toán tiền mặt trực tiếp cho nhân viên khi đến nhận sân.
                    </p>
                  </div>
                </button>
              </div>
            </section>

            {/* Ghi chú */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Message className="size-5 text-muted-foreground" />
                <Label htmlFor="note" className="text-base font-semibold text-foreground">
                  Ghi chú đặt sân (Tùy chọn)
                </Label>
              </div>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập yêu cầu đặc biệt của bạn (ví dụ: cần thuê thêm vợt, nước uống...)"
                className="min-h-24 resize-none bg-background text-foreground placeholder:text-muted-foreground"
                maxLength={300}
              />
            </section>
          </div>

          {/* Cột phải: Summary hóa đơn (Sidebar) */}
          <aside>
            <Card className="sticky top-24 border-border">
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Booking Summary
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kiểm tra kỹ thông tin đặt sân trước khi thanh toán.
                  </p>
                </div>

                {/* Chi tiết sân */}
                <div className="space-y-3 rounded-lg bg-muted/30 p-4 border border-border">
                  <div>
                    <h4 className="font-bold text-foreground">{court.name}</h4>
                    <p className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      {court.venue.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground pl-4">
                      {court.venue.address}
                    </p>
                  </div>
                  <div className="border-t border-border pt-3 space-y-2 text-sm text-foreground">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-primary" /> Ngày đặt
                      </span>
                      <span className="font-medium">
                        {fullDateFormatter.format(parseLocalDate(date))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ClockCircle className="size-4 text-primary" /> Khung giờ
                      </span>
                      <span className="font-medium">
                        {firstSelectedSlot && lastSelectedSlot
                          ? `${formatTime(firstSelectedSlot.startTime)} - ${formatTime(lastSelectedSlot.endTime)}`
                          : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời lượng</span>
                      <span className="font-medium">
                        {formatDuration(durationMinutes)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn giá/giờ</span>
                      <span className="font-medium">
                        {currencyFormatter.format(court.pricePerHour)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Tổng thanh toán
                    </span>
                    <span className="font-display text-3xl font-semibold text-primary">
                      {currencyFormatter.format(totalPrice)}
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleBookConfirm}
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isSubmitting ? (
                      'Processing...'
                    ) : (
                      <>
                        Confirm and Book
                        <ChevronRight className="size-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
