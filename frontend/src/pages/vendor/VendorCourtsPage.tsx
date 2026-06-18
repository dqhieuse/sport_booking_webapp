import {
    Calendar,
    ExternalLink,
    Plus,
    Power,
    Refresh,
    Search,
} from "@mynaui/icons-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/empty-state";
import { PaginationControls } from "@/components/pagination-controls";
import { ApiErrorMessage } from "@/components/ui/api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getPublicSports } from "@/features/sports/api/sportsApi";
import type { Sport } from "@/features/sports/types";
import {
    deactivateVendorCourt,
    getVendorCourts,
    getVendorVenues,
} from "@/features/vendor/api/vendorApi";
import type { VendorCourt, VendorVenue } from "@/features/vendor/types";
import { getVendorCourtEditPath, routePaths } from "@/routes/routePaths";
import type { PageResponse } from "@/types/api";
import { CheckIcon, MapPinHouse, XIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogHeader,
    DialogClose,
} from "@/components/ui/dialog";

type LoadState = "idle" | "loading" | "success" | "error";

const ALL_VALUE = "all";
const PAGE_SIZE = 10;

function getErrorMessage(error: unknown) {
    return error instanceof Error
        ? error.message
        : "Could not load vendor courts.";
}

export function VendorCourtsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParam = searchParams.get("status");
    const venueParam = searchParams.get("venueId");
    const sportParam = searchParams.get("sportId");
    const statusFilter =
        statusParam === "ACTIVE" || statusParam === "INACTIVE"
            ? statusParam
            : ALL_VALUE;
    const venueFilter =
        venueParam && /^\d+$/.test(venueParam) ? venueParam : ALL_VALUE;
    const sportFilter =
        sportParam && /^\d+$/.test(sportParam) ? sportParam : ALL_VALUE;
    const pageParam = Number(searchParams.get("page"));
    const requestedPage =
        Number.isInteger(pageParam) && pageParam > 0 ? pageParam - 1 : 0;
    const [courts, setCourts] = useState<VendorCourt[]>([]);
    const [courtsPage, setCourtsPage] = useState<PageResponse<VendorCourt> | null>(null);
    const [venues, setVenues] = useState<VendorVenue[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [loadState, setLoadState] = useState<LoadState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isMutating, setIsMutating] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isActive = true;

        async function loadFilterOptions() {
            try {
                const [venueResponse, sportResponse] = await Promise.all([
                    getVendorVenues({ status: "ACTIVE", page: 0, size: 100 }),
                    getPublicSports(),
                ]);

                if (!isActive) {
                    return;
                }
                setVenues(venueResponse.data.items);
                setSports(
                    sportResponse.data.filter(
                        (sport) => sport.status === "ACTIVE",
                    ),
                );
            } catch {
                if (isActive) {
                    setVenues([]);
                    setSports([]);
                }
            }
        }

        void loadFilterOptions();
        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPage() {
            setLoadState("loading");
            setErrorMessage(null);

            try {
                const courtResponse = await getVendorCourts(
                    {
                        status:
                            statusFilter === ALL_VALUE
                                ? undefined
                                : (statusFilter as
                                      | "ACTIVE"
                                      | "INACTIVE"),
                        venueId:
                            venueFilter === ALL_VALUE
                                ? undefined
                                : Number(venueFilter),
                        sportId:
                            sportFilter === ALL_VALUE
                                ? undefined
                                : Number(sportFilter),
                        page: requestedPage,
                        size: PAGE_SIZE,
                    },
                    controller.signal,
                );

                setCourts(courtResponse.data.items);
                setCourtsPage(courtResponse.data);
                setLoadState("success");
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setErrorMessage(getErrorMessage(error));
                setLoadState("error");
            }
        }

        void loadPage();

        return () => controller.abort();
    }, [reloadKey, requestedPage, sportFilter, statusFilter, venueFilter]);

    const isLoading = loadState === "idle" || loadState === "loading";

    useEffect(() => {
        if (!courtsPage || requestedPage === 0) {
            return;
        }

        const nextPage =
            courtsPage.totalPages === 0
                ? 0
                : Math.max(courtsPage.totalPages - 1, 0);
        if (courtsPage.totalPages === 0 || requestedPage >= courtsPage.totalPages) {
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (nextPage <= 0) {
                    next.delete("page");
                } else {
                    next.set("page", String(nextPage + 1));
                }
                return next;
            }, { replace: true });
        }
    }, [courtsPage, requestedPage, setSearchParams]);

    function updateFilter(
        key: "status" | "venueId" | "sportId",
        value: string,
    ) {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            if (value === ALL_VALUE) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            next.delete("page");
            return next;
        });
    }

    function handlePageChange(page: number) {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            if (page <= 0) {
                next.delete("page");
            } else {
                next.set("page", String(page + 1));
            }
            return next;
        });
    }

    async function handleDeactivate(courtId: number) {
        setIsMutating(true);

        try {
            await deactivateVendorCourt(courtId);
            toast.success("Court deactivated.", {
                description: "The court has been successfully deactivated.",
            });
            setReloadKey((current) => current + 1);
        } catch (error) {
            toast.error("Failed to deactivate court.", {
                description: getErrorMessage(error),
            });
        } finally {
            setIsMutating(false);
        }
    }

    return (
        <div className="page-shell">
            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
                        <Calendar className="size-3.5" aria-hidden="true" />
                        SB-068
                    </Badge>
                    <div className="space-y-2">
                        <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                            Quản lý court của vendor.
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                            Xem, lọc và quản lý trạng thái court. Tạo court mới
                            ở trang riêng.
                        </p>
                    </div>
                </div>
                <Button className="size-fit px-3 !no-underline" asChild>
                    <Link to={routePaths.vendorCourtCreate}>
                        <Plus className="size-4" aria-hidden="true" />
                        Create court
                    </Link>
                </Button>
            </section>

            {loadState === "error" && (
                <ApiErrorMessage
                    title="Unable to load courts"
                    message={errorMessage}
                    onRetry={() => setReloadKey((current) => current + 1)}
                />
            )}

            {isLoading && <CourtsSkeleton />}

            {loadState === "success" && (
                <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div>
                            <CardTitle className="text-xl">Courts</CardTitle>
                            <CardDescription>
                                Lọc theo venue, sport hoặc trạng thái.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setReloadKey((current) => current + 1)
                            }
                        >
                            <Refresh className="size-4" aria-hidden="true" />
                            Refresh
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-3">
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    updateFilter("status", value)
                                }
                            >
                                <SelectTrigger aria-label="Status filter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>
                                        All status
                                    </SelectItem>
                                    <SelectItem value="ACTIVE">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="INACTIVE">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={venueFilter}
                                onValueChange={(value) =>
                                    updateFilter("venueId", value)
                                }
                            >
                                <SelectTrigger aria-label="Venue filter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>
                                        All venues
                                    </SelectItem>
                                    {venues.map((venue) => (
                                        <SelectItem
                                            key={venue.id}
                                            value={String(venue.id)}
                                        >
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={sportFilter}
                                onValueChange={(value) =>
                                    updateFilter("sportId", value)
                                }
                            >
                                <SelectTrigger aria-label="Sport filter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>
                                        All sports
                                    </SelectItem>
                                    {sports.map((sport) => (
                                        <SelectItem
                                            key={sport.id}
                                            value={String(sport.id)}
                                        >
                                            {sport.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {courts.length === 0 && (
                            <EmptyState
                                icon={
                                    <Search
                                        className="size-6"
                                        aria-hidden="true"
                                    />
                                }
                                title="Không có court phù hợp"
                                description="Thử đổi bộ lọc hoặc tạo court mới."
                                className="max-w-none border"
                            />
                        )}

                        {courts.length > 0 && (
                            <div className="overflow-hidden rounded-lg border bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-foreground font-semibold ps-2.5">
                                                Court
                                            </TableHead>
                                            <TableHead className="text-foreground font-semibold">
                                                Venue
                                            </TableHead>
                                            <TableHead className="text-foreground font-semibold">
                                                Sport
                                            </TableHead>
                                            <TableHead className="text-foreground font-semibold">
                                                Price (VND/hr)
                                            </TableHead>
                                            <TableHead className="text-foreground font-semibold">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right text-foreground font-semibold">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courts.map((court) => (
                                            <TableRow key={court.id}>
                                                <TooltipProvider
                                                    delayDuration={0}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <TableCell className="group">
                                                                <div className="min-w-0 flex flex-col items-start">
                                                                    <Link
                                                                        to={getVendorCourtEditPath(court.id)}
                                                                        className="inline-flex items-center gap-1 !no-underline"
                                                                    >
                                                                        <p className="font-medium text-foreground text-start">
                                                                            {
                                                                                court.name
                                                                            }
                                                                        </p>
                                                                        <ExternalLink
                                                                            className="size-3.5 inline-block text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </Link>
                                                                    <p className="text-xs text-muted-foreground text-start">
                                                                        {
                                                                            court.activeTimeSlotCount
                                                                        }{" "}
                                                                        active
                                                                        slots
                                                                    </p>
                                                                </div>
                                                            </TableCell>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            className="bg-secondary rounded-xl p-1"
                                                            side="right"
                                                        >
                                                            <div className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                                {court.primaryImageUrl ? (
                                                                    <img
                                                                        src={
                                                                            court.primaryImageUrl
                                                                        }
                                                                        alt={
                                                                            court.name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <MapPinHouse
                                                                        className="size-5 text-muted-foreground"
                                                                        aria-hidden="true"
                                                                    />
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TableCell>
                                                    <p className="text-sm text-muted-foreground">
                                                        {court.venue.name}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm text-muted-foreground">
                                                        {court.sport.name}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm font-medium">
                                                        {court.pricePerHour.toLocaleString(
                                                            "vi-VN",
                                                        )}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={"outline"}>
                                                        {court.status ===
                                                        "ACTIVE" ? (
                                                            <CheckIcon
                                                                className="size-4 text-green-500 mr-1"
                                                                aria-hidden="true"
                                                            />
                                                        ) : (
                                                            <XIcon
                                                                className="size-4 text-red-500 mr-1"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                        {court.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <Link to={getVendorCourtEditPath(court.id)}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Dialog>
                                                            <DialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    disabled={
                                                                        isMutating ||
                                                                        court.status ===
                                                                            "INACTIVE"
                                                                    }
                                                                    variant="destructive_ghost"
                                                                >
                                                                    Deactivate
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="!rounded-2xl p-5">
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Deactivate
                                                                        Court
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        Are you
                                                                        sure you
                                                                        want to
                                                                        permanently
                                                                        deactivate
                                                                        court
                                                                        name{" "}
                                                                        <span className="font-medium text-foreground">
                                                                            {
                                                                                court.name
                                                                            }
                                                                        </span>
                                                                        ?
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter className="flex flex-row-reverse gap-2">
                                                                    <DialogClose
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            onClick={() => {
                                                                                void handleDeactivate(
                                                                                    court.id,
                                                                                );
                                                                            }}
                                                                            variant="destructive_ghost"
                                                                        >
                                                                            <Power
                                                                                className="font-bold"
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                            Deactivate
                                                                        </Button>
                                                                    </DialogClose>
                                                                    <DialogClose
                                                                        asChild
                                                                    >
                                                                        <Button variant="outline">
                                                                            Cancel
                                                                        </Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {courtsPage && courtsPage.totalPages > 0 && (
                            <PaginationControls
                                page={courtsPage.page}
                                totalPages={courtsPage.totalPages}
                                totalItems={courtsPage.totalItems}
                                itemLabel="courts"
                                onPageChange={handlePageChange}
                            />
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function CourtsSkeleton() {
    return (
        <Card aria-busy="true">
            <CardHeader>
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}
