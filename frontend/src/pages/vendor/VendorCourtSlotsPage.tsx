import { Calendar, Check, ClockSquare, Refresh, Save } from '@mynaui/icons-react';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/empty-state';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getVendorCourts,
  getVendorCourtTimeSlots,
  updateVendorCourtTimeSlots,
} from '@/features/vendor/api/vendorApi';
import type { VendorCourt, VendorCourtTimeSlot } from '@/features/vendor/types';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
const NO_COURT_VALUE = 'no-court';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load time slot configuration.';
}

export function VendorCourtSlotsPage() {
  const [courts, setCourts] = useState<VendorCourt[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>(NO_COURT_VALUE);
  const [slots, setSlots] = useState<VendorCourtTimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [courtLoadState, setCourtLoadState] = useState<LoadState>('idle');
  const [slotLoadState, setSlotLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourts() {
      setCourtLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getVendorCourts({ page: 0, size: 100, status: 'ACTIVE' }, controller.signal);
        setCourts(response.data.items);
        setSelectedCourtId((current) => {
          if (current !== NO_COURT_VALUE && response.data.items.some((court) => String(court.id) === current)) {
            return current;
          }

          return response.data.items[0] ? String(response.data.items[0].id) : NO_COURT_VALUE;
        });
        setCourtLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setCourtLoadState('error');
      }
    }

    void loadCourts();

    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    if (selectedCourtId === NO_COURT_VALUE) {
      setSlots([]);
      setSelectedSlotIds([]);
      return;
    }

    const controller = new AbortController();

    async function loadSlots() {
      setSlotLoadState('loading');
      setErrorMessage(null);

      try {
        const response = await getVendorCourtTimeSlots(Number(selectedCourtId), controller.signal);
        setSlots(response.data);
        setSelectedSlotIds(response.data.filter((slot) => slot.status === 'ACTIVE').map((slot) => slot.timeSlotId));
        setSlotLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setSlotLoadState('error');
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [selectedCourtId]);

  const selectedCourt = courts.find((court) => String(court.id) === selectedCourtId) || null;
  const selectedSlotSet = useMemo(() => new Set(selectedSlotIds), [selectedSlotIds]);
  const isLoadingCourts = courtLoadState === 'idle' || courtLoadState === 'loading';
  const isLoadingSlots = slotLoadState === 'idle' || slotLoadState === 'loading';
  const hasNoCourts = courtLoadState === 'success' && courts.length === 0;

  function toggleSlot(slotId: number) {
    setSelectedSlotIds((current) =>
      current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId],
    );
  }

  function selectAllSlots() {
    setSelectedSlotIds(slots.map((slot) => slot.timeSlotId));
  }

  function clearSlots() {
    setSelectedSlotIds([]);
  }

  async function handleSave() {
    if (!selectedCourt) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateVendorCourtTimeSlots(selectedCourt.id, selectedSlotIds);
      setSlots(response.data);
      setSelectedSlotIds(response.data.filter((slot) => slot.status === 'ACTIVE').map((slot) => slot.timeSlotId));
      toast.success('Saved court time slots.', {
        description: 'The time slots have been successfully saved.',
      });
    } catch (error) {
      toast.error('Failed to save court time slots.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Configure time slots for each court.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Vendor selects active courts, enables slots that can receive bookings, and saves the configuration directly via the vendor API.
          </p>
        </div>
      </section>

      {courtLoadState === 'error' && (
        <ApiErrorMessage
          title="Unable to load vendor courts"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {isLoadingCourts && (
        <Card aria-busy="true">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full max-w-lg" />
          </CardContent>
        </Card>
      )}

      {hasNoCourts && (
        <EmptyState
          icon={<Calendar className="size-6" aria-hidden="true" />}
          title="Chưa có court active"
          description="Tạo court active trước khi cấu hình khung giờ nhận booking."
          className="max-w-none rounded-lg border bg-card"
        />
      )}

      {courtLoadState === 'success' && courts.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl">Chọn court</CardTitle>
              <CardDescription>Court inactive không hiển thị trong danh sách cấu hình.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="court-select">Court</Label>
                <Select value={selectedCourtId} onValueChange={setSelectedCourtId}>
                  <SelectTrigger id="court-select">
                    <SelectValue placeholder="Choose court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={String(court.id)}>
                        {court.name} - {court.venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourt && (
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="font-medium text-foreground">{selectedCourt.name}</p>
                  <p className="mt-1 text-muted-foreground">{selectedCourt.venue.name}</p>
                  <p className="mt-2 text-muted-foreground">{selectedSlotIds.length} slots selected</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="text-xl">Time slots</CardTitle>
                <CardDescription>Bật slot ACTIVE cho court đã chọn.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllSlots} disabled={isLoadingSlots}>
                  <Check className="size-4" aria-hidden="true" />
                  Select all
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={clearSlots} disabled={isLoadingSlots}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {slotLoadState === 'error' && (
                <ApiErrorMessage
                  title="Unable to load court time slots"
                  message={errorMessage}
                  onRetry={() => setSelectedCourtId((current) => current)}
                />
              )}

              {isLoadingSlots && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <Skeleton key={index} className="h-16" />
                  ))}
                </div>
              )}

              {slotLoadState === 'success' && slots.length === 0 && (
                <EmptyState
                  icon={<ClockSquare className="size-6" aria-hidden="true" />}
                  title="Không có time slot active"
                  description="Backend chưa có time slot active để gán cho court."
                  className="max-w-none border"
                />
              )}

              {slotLoadState === 'success' && slots.length > 0 && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {slots.map((slot) => {
                      const checked = selectedSlotSet.has(slot.timeSlotId);

                      return (
                        <Label
                          key={slot.timeSlotId}
                          className="flex min-h-16 cursor-pointer items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent/60"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggleSlot(slot.timeSlotId)} className="size-4" />
                          <span className="min-w-0 flex flex-col space-y-1">
                            <span className="block font-medium text-foreground">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {checked ? 'Đang nhận booking' : 'Tạm tắt'}
                            </span>
                          </span>
                        </Label>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedSlotIds.length}/{slots.length} slots đang được bật.
                    </p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" disabled={isSaving || isLoadingSlots}>
                              {isSaving ? <Refresh className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                              Save slots
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="!rounded-2xl p-5">
                            <DialogHeader>
                            <DialogTitle className="">Save Slots</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to save the changes to venue name <span className="font-medium text-foreground">{selectedCourt?.name}</span>?
                            </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex flex-row-reverse gap-2">
                                <DialogClose asChild>
                                    <Button onClick={() => {void handleSave()}}>
                                        Save
                                    </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button variant="outline">
                                    Cancel
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
