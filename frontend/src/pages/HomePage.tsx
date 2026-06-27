import { FormEvent, useState } from "react";
import { AlertCircle, MapPin, Search } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CompactCourtCard,
    CourtCard,
    VenueCard,
} from "@/features/home/DiscoveryCards";
import { HomeHeader } from "@/features/home/HomeHeader";
import { useHomeDiscovery } from "@/features/home/use-home-discovery";
import type { CourtFilters } from "@/types/public-api";

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
            </p>
        </div>
    );
}

function CardsSkeleton({ count = 3 }: { count?: number }) {
    return Array.from({ length: count }).map((_, index) => (
        <div
            key={index}
            className="overflow-hidden rounded-2xl border bg-card"
            aria-hidden="true"
        >
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    ));
}

function CompactCardsSkeleton() {
    return Array.from({ length: 3 }).map((_, index) => (
        <div
            key={index}
            className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 rounded-2xl bg-muted/80 p-3"
            aria-hidden="true"
        >
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <div className="space-y-3 py-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    ));
}

function ResourceError({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <Alert
            variant="destructive"
            className="sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <AlertTitle className="flex items-center gap-2">
                    <AlertCircle className="size-4" aria-hidden="true" /> Không
                    thể tải dữ liệu
                </AlertTitle>
                <AlertDescription className="mt-1">{message}</AlertDescription>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 sm:mt-0"
                onClick={onRetry}
            >
                Thử lại
            </Button>
        </Alert>
    );
}

export function HomePage() {
    const {
        sports,
        venues,
        courts,
        searchCourts,
        retrySports,
        retryVenues,
        retryCourts,
    } = useHomeDiscovery();
    const [keyword, setKeyword] = useState("");
    const [sportId, setSportId] = useState("");
    const compactCourts =
        keyword || sportId ? courts.data : courts.data.slice(0, 3);
    const discoveryCourts = keyword || sportId ? [] : courts.data.slice(3);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const filters: CourtFilters = {
            keyword: keyword.trim() || undefined,
            sportId: sportId ? Number(sportId) : undefined,
        };
        void searchCourts(filters);
        document
            .querySelector("#courts")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const selectSport = (selectedSportId: number) => {
        const value = String(selectedSportId);
        setSportId(value);
        void searchCourts({
            keyword: keyword.trim() || undefined,
            sportId: selectedSportId,
        });
        document
            .querySelector("#courts")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div id="top" className="min-h-screen bg-background">
            <HomeHeader />
            <main>
                <section id="sports" className="scroll-mt-28">
                    <div className="mx-auto max-w-5xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8">
                        <h1 className="sr-only">
                            Tìm và đặt sân thể thao cùng SportZone
                        </h1>
                        <form
                            onSubmit={submitSearch}
                            className="gap-2 rounded-3xl border bg-background p-2 shadow-sm flex justify-center items-center"
                            aria-label="Tìm sân thể thao"
                        >
                            <div className="w-full">
                                <label
                                    className="sr-only"
                                    htmlFor="court-keyword"
                                >
                                    Tên sân hoặc địa điểm
                                </label>
                                <div className="relative border-border sm:border-r pr-2">
                                    <span className="pointer-events-none absolute left-5 top-2 text-xs font-medium text-muted-foreground">
                                        Tìm kiếm sân phù hợp
                                    </span>
                                    <Input
                                        id="court-keyword"
                                        value={keyword}
                                        onChange={(event) =>
                                            setKeyword(event.target.value)
                                        }
                                        className="h-16 px-5 pb-2 pt-7 focus-visible:bg-muted font-medium"
                                        placeholder="Nhập các từ khoá như: Sân cầu lông Cầu Giấy, sân bóng Mỹ Đình,..."
                                    />
                                </div>
                            </div>
                            <Select
                                value={sportId || "all"}
                                onValueChange={(value) =>
                                    setSportId(value === "all" ? "" : value)
                                }
                                disabled={sports.isLoading}
                            >
                                <SelectTrigger
                                    id="sport-filter"
                                    aria-label="Chọn môn thể thao"
                                    className="h-16 w-fit min-w-40"
                                >
                                    <SelectValue placeholder="Chọn môn thể thao" />
                                </SelectTrigger>
                                <SelectContent position="popper" align="end">
                                    <SelectItem value="all">Tất cả môn</SelectItem>
                                    {sports.data.map((sport) => (
                                        <SelectItem
                                            key={sport.id}
                                            value={String(sport.id)}
                                        >
                                            {sport.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                size="icon"
                                className="size-16 justify-self-stretch rounded-xl sm:justify-self-auto"
                                disabled={courts.isLoading}
                                aria-label={
                                    courts.isLoading
                                        ? "Đang tìm sân"
                                        : "Tìm sân"
                                }
                            >
                                <Search className="size-6" aria-hidden="true" />
                            </Button>
                        </form>

                        <div
                            className="mt-7 flex gap-2 overflow-x-auto pb-2"
                            aria-label="Bộ lọc môn thể thao nhanh"
                        >
                            <Button
                                variant={"outline"}
                                onClick={() => {
                                    setSportId("");
                                    void searchCourts({
                                        keyword: keyword.trim() || undefined,
                                    });
                                }}
                                className={!sportId ? "bg-accent text-primary" : ""}
                            >
                              Tất cả
                            </Button>
                            {sports.isLoading &&
                                Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-11 w-28 shrink-0 rounded-xl"
                                    />
                                ))}
                            {sports.data.map((sport) => (
                                <Button
                                    key={sport.id}
                                    variant={"outline"}
                                    onClick={() => selectSport(sport.id)}
                                    className={`${sportId === String(sport.id) ? "bg-accent text-primary" : ""}`}
                                >
                                    {sport.name}
                                </Button>
                            ))}
                        </div>
                        {sports.error && (
                            <div className="mt-4">
                                <ResourceError
                                    message={sports.error}
                                    onRetry={() => void retrySports()}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <section
                    id="courts"
                    className="scroll-mt-28 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
                >
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {keyword || sportId
                            ? "Sân phù hợp với tìm kiếm"
                            : "Gợi ý sân cho bạn"}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        So sánh nhanh môn chơi, địa điểm và giá theo giờ.
                    </p>
                    <div
                        className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        aria-live="polite"
                        aria-busy={courts.isLoading}
                    >
                        {courts.isLoading && <CompactCardsSkeleton />}
                        {courts.error && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <ResourceError
                                    message={courts.error}
                                    onRetry={() =>
                                        void retryCourts({
                                            keyword:
                                                keyword.trim() || undefined,
                                            sportId: sportId
                                                ? Number(sportId)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>
                        )}
                        {!courts.isLoading &&
                            !courts.error &&
                            compactCourts.map((court) => (
                                <CompactCourtCard
                                    key={court.id}
                                    court={court}
                                />
                            ))}
                        {!courts.isLoading &&
                            !courts.error &&
                            courts.data.length === 0 && (
                                <Empty className="border sm:col-span-2 lg:col-span-3">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Search />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            Chưa tìm thấy sân phù hợp
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Thử bỏ bớt bộ lọc hoặc tìm bằng tên
                                            sân, địa điểm khác.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setKeyword("");
                                            setSportId("");
                                            void searchCourts();
                                        }}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </Empty>
                            )}
                    </div>
                </section>

                {!courts.isLoading &&
                    !courts.error &&
                    discoveryCourts.length > 0 && (
                        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                            <SectionHeading
                                eyebrow="Khám phá"
                                title="Sân đang hoạt động"
                                description="Danh sách sân công khai từ hệ thống SportZone."
                            />
                            <div className="mt-7 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                                {discoveryCourts.map((court) => (
                                    <CourtCard
                                        key={`featured-${court.id}`}
                                        court={court}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                <section id="venues" className="scroll-mt-28 border-t mb-32">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <SectionHeading
                            eyebrow="Địa điểm"
                            title="Cụm sân nổi bật"
                            description="Xem địa chỉ và giờ hoạt động trước khi chọn sân."
                        />
                        <div className="mt-7 grid gap-4 lg:grid-cols-3">
                            {venues.isLoading && <CardsSkeleton count={3} />}
                            {venues.error && (
                                <div className="lg:col-span-3">
                                    <ResourceError
                                        message={venues.error}
                                        onRetry={() => void retryVenues()}
                                    />
                                </div>
                            )}
                            {!venues.isLoading &&
                                !venues.error &&
                                venues.data.map((venue) => (
                                    <VenueCard key={venue.id} venue={venue} />
                                ))}
                            {!venues.isLoading &&
                                !venues.error &&
                                venues.data.length === 0 && (
                                    <Empty className="border lg:col-span-3">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <MapPin />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                Chưa có địa điểm hoạt động
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                Các địa điểm mới sẽ xuất hiện
                                                tại đây khi được mở.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t bg-foreground rounded-t-4xl">
                <div className="mx-auto flex max-w-7xl flex-col md:flex-row gap-16 md:gap-4 px-4 py-16 text-sm text-muted-foreground md:items-center md:justify-between md:px-6 lg:px-8">
                    <div>
                        <p className="font-medium text-background text-8xl">
                            SportZone<span className="text-primary">.</span>
                        </p>
                        <p className="mt-2 font-medium">
                            Tìm và đặt sân thể thao thuận tiện hơn.
                        </p>
                    </div>
                    <div className="flex gap-24 text-base font-medium text-background">
                      <ul className="flex flex-col gap-2">
                          <li>Home</li>
                          <li>Venues</li> 
                          <li>Courts</li>
                          <li>Your Bookings</li>
                          <li>Sports</li>
                      </ul>
                      <ul className="flex flex-col gap-2">
                          <li>Profile</li>
                          <li>Vendor Management</li> 
                          <li>Admin Management</li>
                      </ul>
                    </div>
                </div>
                <div className="mx-auto flex max-w-7xl px-4 pt-32 pb-16 justify-between text-muted-foreground text-sm">
                  <p>© 2025-2026 SportZone</p>
                  <p>Privacy policy</p>
                  <p>Terms</p>
                </div>
            </footer>
        </div>
    );
}
