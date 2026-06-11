import { Calendar, ClockSquare, Grid, Image, MapPinHouse } from '@mynaui/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/empty-state';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getVendorCourts, getVendorVenues } from '@/features/vendor/api/vendorApi';
import type { VendorCourt, VendorVenue } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load vendor dashboard.';
}

export function VendorDashboardPage() {
  const [venues, setVenues] = useState<VendorVenue[]>([]);
  const [courts, setCourts] = useState<VendorCourt[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [venueResponse, courtResponse] = await Promise.all([
          getVendorVenues({ page: 0, size: 100 }, controller.signal),
          getVendorCourts({ page: 0, size: 100 }, controller.signal),
        ]);

        setVenues(venueResponse.data.items);
        setCourts(courtResponse.data.items);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [reloadKey]);

  const stats = useMemo(() => {
    const activeVenues = venues.filter((venue) => venue.status === 'ACTIVE').length;
    const activeCourts = courts.filter((court) => court.status === 'ACTIVE').length;
    const configuredSlots = courts.reduce((total, court) => total + court.activeTimeSlotCount, 0);
    const withImages = [...venues, ...courts].filter((item) => Boolean(item.primaryImageUrl)).length;

    return { activeVenues, activeCourts, configuredSlots, withImages };
  }, [courts, venues]);

  const isLoading = loadState === 'loading' || loadState === 'idle';
  const hasNoData = loadState === 'success' && venues.length === 0 && courts.length === 0;

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
          <Grid className="size-3.5" aria-hidden="true" />
          Vendor workspace
        </Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Quản lý sân, cụm sân, hình ảnh và khung giờ.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Dashboard giúp vendor đi nhanh đến các màn hình quản lý chính và kiểm tra nhanh trạng thái dữ liệu hiện tại.
          </p>
        </div>
      </section>

      {isLoading && <DashboardSkeleton />}

      {loadState === 'error' && (
        <ApiErrorMessage
          title="Unable to load vendor dashboard"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {hasNoData && (
        <EmptyState
          icon={<MapPinHouse className="size-6" aria-hidden="true" />}
          title="Chưa có dữ liệu vendor"
          description="Hãy tạo venue đầu tiên, sau đó thêm court, ảnh và cấu hình slot."
          className="max-w-none rounded-lg border bg-card"
        />
      )}

      {loadState === 'success' && !hasNoData && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Active venues" value={stats.activeVenues} icon={<MapPinHouse className="size-5" />} />
            <StatCard title="Active courts" value={stats.activeCourts} icon={<Calendar className="size-5" />} />
            <StatCard title="Configured slots" value={stats.configuredSlots} icon={<ClockSquare className="size-5" />} />
            <StatCard title="Primary images" value={stats.withImages} icon={<Image className="size-5" />} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <WorkspaceCard
              title="Venue management"
              description="Cập nhật thông tin địa điểm, giờ mở cửa và trạng thái venue."
              to={routePaths.vendorVenues}
              icon={<MapPinHouse className="size-5" />}
            />
            <WorkspaceCard
              title="Court management"
              description="Quản lý court theo venue, sport, giá theo giờ và trạng thái hoạt động."
              to={routePaths.vendorCourts}
              icon={<Calendar className="size-5" />}
            />
            <WorkspaceCard
              title="Image gallery"
              description="Upload ảnh venue/court, đặt ảnh đại diện và xóa ảnh không còn dùng."
              to={routePaths.vendorImages}
              icon={<Image className="size-5" />}
            />
            <WorkspaceCard
              title="Time slot configuration"
              description="Bật tắt các khung giờ nhận booking cho từng court."
              to={routePaths.vendorSlots}
              icon={<ClockSquare className="size-5" />}
            />
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

function WorkspaceCard({
  title,
  description,
  to,
  icon,
}: {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="outline" className="w-fit gap-2">
          {icon}
          Vendor tool
        </Badge>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to={to}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-16" />
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
