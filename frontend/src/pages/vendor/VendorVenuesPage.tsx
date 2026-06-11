import { MapPinHouse, Refresh, Search } from "@mynaui/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/empty-state";
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
import {
    deactivateVendorVenue,
    getVendorVenues,
} from "@/features/vendor/api/vendorApi";
import type { VendorVenue } from "@/features/vendor/types";
import { routePaths } from "@/routes/routePaths";
import { CheckIcon, PlusIcon, Power, XIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type LoadState = "idle" | "loading" | "success" | "error";

const ALL_VALUE = "all";

function getErrorMessage(error: unknown) {
    return error instanceof Error
        ? error.message
        : "Could not load vendor venues.";
}

export function VendorVenuesPage() {
    const [venues, setVenues] = useState<VendorVenue[]>([]);
    const [loadState, setLoadState] = useState<LoadState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
    const [isMutating, setIsMutating] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadVenues() {
            setLoadState("loading");
            setErrorMessage(null);

            try {
                const response = await getVendorVenues(
                    {
                        status:
                            statusFilter === ALL_VALUE
                                ? undefined
                                : (statusFilter as "ACTIVE" | "INACTIVE"),
                        page: 0,
                        size: 100,
                    },
                    controller.signal,
                );
                setVenues(response.data.items);
                setLoadState("success");
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setErrorMessage(getErrorMessage(error));
                setLoadState("error");
            }
        }

        void loadVenues();

        return () => controller.abort();
    }, [reloadKey, statusFilter]);

    const isLoading = loadState === "idle" || loadState === "loading";

    async function handleDeactivate(venueId: number) {
        setIsMutating(true);

        try {
            await deactivateVendorVenue(venueId);
            toast.success("Venue deactivated.", {
                description: "The venue has been deactivated.",
            });
            setReloadKey((current) => current + 1);
        } catch (error) {
            toast.error("Failed to deactivate venue.", {
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
                        <MapPinHouse className="size-3.5" aria-hidden="true" />
                        SB-067
                    </Badge>
                    <div className="space-y-2">
                        <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                            Quản lý venue của vendor.
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                            Xem, lọc và quản lý trạng thái venue. Tạo venue mới
                            ở trang riêng.
                        </p>
                    </div>
                </div>
                <Button className="size-fit px-3 !no-underline" asChild>
                    <Link to={routePaths.vendorVenueCreate}>
                        <PlusIcon aria-hidden="true" size={16} />
                        Create venue
                    </Link>
                </Button>
            </section>

            {loadState === "error" && (
                <ApiErrorMessage
                    title="Unable to load venues"
                    message={errorMessage}
                    onRetry={() => setReloadKey((current) => current + 1)}
                />
            )}

            {isLoading && <VenuesSkeleton />}

            {loadState === "success" && (
                <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div>
                            <CardTitle className="text-xl">Venues</CardTitle>
                            <CardDescription>
                                Lọc theo trạng thái để kiểm tra venue
                                active/inactive.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger
                                    className="w-36"
                                    aria-label="Status filter"
                                >
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
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setReloadKey((current) => current + 1)
                                }
                            >
                                <Refresh
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {venues.length === 0 && (
                            <EmptyState
                                icon={
                                    <Search
                                        className="size-6"
                                        aria-hidden="true"
                                    />
                                }
                                title="Không có venue phù hợp"
                                description="Thử đổi bộ lọc hoặc tạo venue mới."
                                className="max-w-none border"
                            />
                        )}

                        {venues.length > 0 && (
                            <div className="overflow-hidden rounded-lg border bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-foreground font-semibold ps-2.5">Name</TableHead>
                                            <TableHead className="text-foreground font-semibold">Address</TableHead>
                                            <TableHead className="text-foreground font-semibold">Phone</TableHead>
                                            <TableHead className="text-foreground font-semibold">Open</TableHead>
                                            <TableHead className="text-foreground font-semibold">Close</TableHead>
                                            <TableHead className="text-foreground font-semibold">Courts</TableHead>
                                            <TableHead className="text-foreground font-semibold">Status</TableHead>
                                            <TableHead className="text-right text-foreground font-semibold">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {venues.map((venue) => (
                                            <TableRow key={venue.id}>
                                                <TooltipProvider
                                                    delayDuration={0}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-medium text-foreground line-clamp-1">
                                                                            {
                                                                                venue.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-secondary rounded-xl p-1" side="right">
                                                            <div className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                                {venue.primaryImageUrl ? (
                                                                    <img
                                                                        src={
                                                                            venue.primaryImageUrl
                                                                        }
                                                                        alt={
                                                                            venue.name
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
                                                <TableCell className="max-w-48 truncate">
                                                    {venue.address}
                                                </TableCell>
                                                <TableCell>
                                                    {venue.phone}
                                                </TableCell>
                                                <TableCell>
                                                    {venue.openingTime}
                                                </TableCell>
                                                <TableCell>
                                                    {venue.closingTime}
                                                </TableCell>
                                                <TableCell>
                                                    {venue.courtCount}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {venue.status ===
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
                                                        {venue.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button disabled={ isMutating || venue.status === "INACTIVE" } variant="destructive_ghost">
                                                                Deactivate
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="!rounded-2xl p-5">
                                                                <DialogHeader>
                                                                <DialogTitle className="">Deactivate Venue</DialogTitle>
                                                                <DialogDescription>
                                                                    Are you sure you want to permanently deactivate venue name <span className="font-medium text-foreground">{venue.name}</span>?
                                                                </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter className="flex flex-row-reverse gap-2">
                                                                    <DialogClose asChild>
                                                                        <Button onClick={() => {void handleDeactivate(venue.id)}} variant="destructive_ghost">
                                                                            <Power className="font-bold" size={16} />
                                                                            Deactivate
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function VenuesSkeleton() {
    return (
        <Card aria-busy="true">
            <CardHeader>
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-72 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}
