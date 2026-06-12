import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock3,
    Clock4,
    Image,
    MapPin,
    XCircle,
} from "@mynaui/icons-react";
import { ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/empty-state";
import { PaginationControls } from "@/components/pagination-controls";
import { ApiErrorMessage } from "@/components/ui/api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyBookings } from "@/features/bookings/api/bookingsApi";
import type {
    BookingStatus,
    MyBookingResponse,
} from "@/features/bookings/types";
import { cn } from "@/lib/utils";
import { getBookingDetailPath, routePaths } from "@/routes/routePaths";
import type { PageResponse } from "@/types/api";

type LoadState = "idle" | "loading" | "success" | "error";
type BookingFilter = "all" | "upcoming" | "completed" | "cancelled";

const PAGE_SIZE = 10;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
});

const statusLabels: Record<BookingStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
};

function parseLocalDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatTime(time: string) {
    return time.slice(0, 5);
}

function getPageParam(searchParams: URLSearchParams) {
    const page = Number(searchParams.get("page"));
    return Number.isInteger(page) && page > 0 ? page - 1 : 0;
}

function getFilterParam(searchParams: URLSearchParams): BookingFilter {
    const filter = searchParams.get("filter");
    return filter === "upcoming" ||
        filter === "completed" ||
        filter === "cancelled"
        ? filter
        : "all";
}

function matchesFilter(booking: MyBookingResponse, filter: BookingFilter) {
    if (filter === "all") return true;
    if (filter === "completed") return booking.status === "COMPLETED";
    if (filter === "cancelled")
        return booking.status === "CANCELLED" || booking.status === "REJECTED";

    return booking.status === "PENDING" || booking.status === "CONFIRMED";
}

function getStatusStyles(status: BookingStatus) {
    switch (status) {
        case "CONFIRMED":
            return {
                badge: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
                icon: CheckCircle,
            };
        case "COMPLETED":
            return {
                badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                icon: CheckCircle,
            };
        case "CANCELLED":
        case "REJECTED":
            return {
                badge: "border-destructive/20 bg-destructive/10 text-destructive",
                icon: XCircle,
            };
        default:
            return {
                badge: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                icon: Clock3,
            };
    }
}

function BookingTimelineSkeleton() {
    return (
        <div
            className="space-y-5"
            aria-busy="true"
            aria-label="Loading booking history"
        >
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="grid gap-4 sm:grid-cols-[88px_1fr] sm:gap-7"
                >
                    <div className="hidden justify-end sm:flex">
                        <Skeleton className="h-14 w-14 rounded-xl" />
                    </div>
                    <div className="relative pl-8 sm:pl-0">
                        <Skeleton className="absolute left-0 top-7 size-4 rounded-full sm:-left-[36px]" />
                        <Skeleton className="h-52 w-full rounded-2xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function BookingTimelineItem({
    booking,
    isLast,
}: {
    booking: MyBookingResponse;
    isLast: boolean;
}) {
    const bookingDate = parseLocalDate(booking.bookingDate);
    const statusStyle = getStatusStyles(booking.status);
    const StatusIcon = statusStyle.icon;

    return (
        <article className="grid gap-4 sm:grid-cols-[88px_1fr] sm:gap-7">
            <div className="hidden pt-1 text-right sm:block mr-4">
                <p className="text-2xl font-semibold leading-none text-foreground">
                    {dayFormatter.format(bookingDate)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
                    {monthFormatter.format(bookingDate)}
                </p>
            </div>

            <div className={cn("relative pl-8 sm:pl-0", !isLast && "pb-6")}>
                {!isLast && (
                    <span
                        className="absolute bottom-0 left-[7px] top-4 w-px bg-border sm:-left-[29px]"
                        aria-hidden="true"
                    />
                )}
                <span
                    className={cn(
                        "absolute left-0 top-0 z-10 bg-muted flex size-4 items-center justify-center rounded-full border-4 border-background ring-1 ring-border sm:-left-[36px]",
                    )}
                    aria-hidden="true"
                />

                <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                    <div className="grid md:grid-cols-[190px_1fr]">
                        <div className="relative min-h-36 overflow-hidden bg-muted md:min-h-full">
                            {booking.court.primaryImageUrl ? (
                                <img
                                    src={booking.court.primaryImageUrl}
                                    alt={booking.court.name}
                                    className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Image
                                        className="size-7"
                                        aria-hidden="true"
                                    />
                                    <span className="text-xs">
                                        Court image unavailable
                                    </span>
                                </div>
                            )}
                            <div className="absolute left-3 top-3 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur sm:hidden">
                                {dayFormatter.format(bookingDate)}{" "}
                                {monthFormatter.format(bookingDate)}
                            </div>
                        </div>

                        <div className="flex min-w-0 flex-col p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Booking #{booking.id}
                                    </p>
                                    <h2 className="mt-1 truncate text-lg font-semibold text-foreground">
                                        {booking.court.name}
                                    </h2>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "gap-1.5 rounded-full px-2.5 py-1",
                                        statusStyle.badge,
                                    )}
                                >
                                    <StatusIcon
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    {statusLabels[booking.status]}
                                </Badge>
                            </div>

                            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <Calendar
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">
                                        {fullDateFormatter.format(bookingDate)}
                                    </span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Clock3
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {formatTime(booking.startTime)} -{" "}
                                        {formatTime(booking.endTime)}
                                    </span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <MapPin
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">
                                        {booking.venue.name} ·{" "}
                                        {booking.venue.address}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t pt-4">
                                <div>
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ReceiptText
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                        Total payment
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        {currencyFormatter.format(
                                            booking.totalPrice,
                                        )}
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                    <Link
                                        to={getBookingDetailPath(booking.id)}
                                        className="no-underline hover:no-underline"
                                    >
                                        View details
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

export function BookingHistoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookingsPage, setBookingsPage] =
        useState<PageResponse<MyBookingResponse> | null>(null);
    const [loadState, setLoadState] = useState<LoadState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const currentPage = getPageParam(searchParams);
    const currentFilter = getFilterParam(searchParams);

    useEffect(() => {
        const controller = new AbortController();

        async function loadBookings() {
            setLoadState("loading");
            setErrorMessage(null);

            try {
                const response = await getMyBookings(
                    { page: currentPage, size: PAGE_SIZE },
                    controller.signal,
                );
                setBookingsPage(response.data);
                setLoadState("success");
            } catch (error) {
                if (controller.signal.aborted) return;
                setBookingsPage(null);
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Could not load your booking history.",
                );
                setLoadState("error");
            }
        }

        void loadBookings();
        return () => controller.abort();
    }, [currentPage, reloadKey]);

    const visibleBookings = useMemo(
        () =>
            (bookingsPage?.items ?? []).filter((booking) =>
                matchesFilter(booking, currentFilter),
            ),
        [bookingsPage, currentFilter],
    );

    function handleFilterChange(value: string) {
        const nextFilter = value as BookingFilter;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("page");

        if (nextFilter === "all") {
            nextParams.delete("filter");
        } else {
            nextParams.set("filter", nextFilter);
        }

        setSearchParams(nextParams);
    }

    function handlePageChange(page: number) {
        const nextParams = new URLSearchParams(searchParams);
        if (page > 0) nextParams.set("page", String(page + 1));
        else nextParams.delete("page");
        setSearchParams(nextParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const hasBookings = loadState === "success" && visibleBookings.length > 0;
    const isEmpty = loadState === "success" && visibleBookings.length === 0;

    return (
        <div className="page-shell pb-12">
            <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="eyebrow flex items-center gap-2">
                        <Clock4
                            className="size-4 text-primary"
                            aria-hidden="true"
                        />
                        Your activity
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        Booking history
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                        Follow every reservation from the first confirmation to
                        your latest completed match.
                    </p>
                </div>
                {bookingsPage && bookingsPage.totalItems > 0 && (
                    <div className="rounded-xl border bg-muted/40 px-4 py-3 sm:text-right">
                        <p className="text-xs text-muted-foreground">
                            Total bookings
                        </p>
                        <p className="text-xl font-semibold">
                            {bookingsPage.totalItems}
                        </p>
                    </div>
                )}
            </header>

            <Tabs value={currentFilter} onValueChange={handleFilterChange}>
                <div className="overflow-x-auto pb-1">
                    <TabsList className="w-max justify-start">
                        <TabsTrigger value="all">All bookings</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {loadState === "loading" && <BookingTimelineSkeleton />}

            {loadState === "error" && (
                <ApiErrorMessage
                    title="Unable to load booking history"
                    message={errorMessage}
                    onRetry={() => setReloadKey((current) => current + 1)}
                />
            )}

            {isEmpty && (
                <EmptyState
                    icon={<Calendar className="size-6" aria-hidden="true" />}
                    title={
                        currentFilter === "all"
                            ? "No bookings yet"
                            : `No ${currentFilter} bookings`
                    }
                    description={
                        currentFilter === "all"
                            ? "Your booking timeline will appear here after you reserve a court."
                            : "Try another filter to view the rest of your booking history."
                    }
                    action={
                        currentFilter === "all" ? (
                            <Button asChild>
                                <Link
                                    to={routePaths.courts}
                                    className="no-underline hover:no-underline"
                                >
                                    Explore courts
                                </Link>
                            </Button>
                        ) : undefined
                    }
                    className="max-w-none rounded-2xl border bg-card"
                />
            )}

            {hasBookings && bookingsPage && (
                <section aria-label="Booking timeline">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {visibleBookings.length} booking
                            {visibleBookings.length === 1 ? "" : "s"} on this
                            page
                        </p>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                            Newest first
                        </span>
                    </div>

                    <div>
                        {visibleBookings.map((booking, index) => (
                            <BookingTimelineItem
                                key={booking.id}
                                booking={booking}
                                isLast={index === visibleBookings.length - 1}
                            />
                        ))}
                    </div>

                    {bookingsPage.totalPages > 1 && (
                        <div className="mt-8">
                            <PaginationControls
                                page={bookingsPage.page}
                                totalPages={bookingsPage.totalPages}
                                totalItems={bookingsPage.totalItems}
                                itemLabel="bookings"
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
