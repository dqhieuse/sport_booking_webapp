import {
  Calendar as CalendarIcon,
  CaretRight,
  CreditCard,
  Envelope,
  Magnifier,
  PaperPlane,
} from "@gravity-ui/icons";
import {
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  Form,
  InputGroup,
  Label,
  Link,
  ListBox,
  SearchField,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { courtsApi } from "~/features/courts/api/courtsApi";
import type { Court } from "~/features/courts/types";
import { sportsApi } from "~/features/sports/api/sportsApi";
import type { Sport } from "~/features/sports/types";
import { formatCurrency } from "~/lib/utils";
import { routePaths } from "~/routes/routePaths";

type CourtPreview = {
  id: number;
  name: string;
  address: string;
  image: string;
  price: string;
  time?: string;
};

type Step = {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
};

const sportOptions = [
  { id: "all", label: "Tất cả môn thể thao" },
  { id: "bong-da", label: "Bóng đá" },
  { id: "cau-long", label: "Cầu lông" },
  { id: "tennis", label: "Tennis" },
  { id: "pickleball", label: "Pickleball" },
];

const areaOptions = [
  { id: "all", label: "Tất cả khu vực" },
  { id: "ha-noi", label: "Hà Nội" },
  { id: "ho-chi-minh", label: "TP. Hồ Chí Minh" },
  { id: "da-nang", label: "Đà Nẵng" },
];

const bookingSteps: Step[] = [
  {
    icon: <Magnifier className="size-5" aria-hidden="true" />,
    step: "BƯỚC 1",
    title: "Tìm kiếm sân phù hợp",
    description:
      "Nhập từ khóa, chọn môn thể thao và khu vực để lọc nhanh sân còn lịch phù hợp.",
  },
  {
    icon: <CalendarIcon className="size-5" aria-hidden="true" />,
    step: "BƯỚC 2",
    title: "Chọn thời gian đặt sân",
    description:
      "Xem khung giờ còn trống, giá theo giờ và thông tin địa điểm trước khi đặt.",
  },
  {
    icon: <CreditCard className="size-5" aria-hidden="true" />,
    step: "BƯỚC 3",
    title: "Thanh toán và tham gia đúng giờ",
    description:
      "Xác nhận lịch đặt, nhận thông tin sân và đến đúng giờ để bắt đầu trận đấu.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(true);
  const [homeDataError, setHomeDataError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    setIsLoadingHomeData(true);
    setHomeDataError(null);

    try {
      const [sportsResponse, courtsResponse] = await Promise.all([
        sportsApi.getSports(),
        courtsApi.getCourts({ status: "ACTIVE", page: 0, size: 12 }),
      ]);

      setSports(sportsResponse.data);
      setCourts(getItems(courtsResponse.data));
    } catch (error) {
      setHomeDataError(getErrorMessage(error));
      setSports([]);
      setCourts([]);
    } finally {
      setIsLoadingHomeData(false);
    }
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  const sportFilters = useMemo(
    () => [
      ...sports.slice(0, 4).map((sport) => ({
        label: sport.name,
        to: `${routePaths.courts}?sportId=${sport.id}`,
      })),
      { label: "Xem thêm", to: routePaths.sports },
    ],
    [sports],
  );

  const courtPreviews = useMemo(
    () => courts.map(mapCourtToPreview),
    [courts],
  );
  const nearbyCourts = courtPreviews.slice(0, 4);
  const popularCourts = courtPreviews.slice(4, 8);
  const ratedCourts = courtPreviews.slice(8, 11);

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="bg-background">
      <section className="px-2 pb-0 hidden">
        <div className="relative flex min-h-[420px] w-full overflow-hidden rounded-[32px] bg-[#111111] px-4 py-16 sm:min-h-[460px] sm:px-8 lg:min-h-[448px] lg:items-center lg:justify-center lg:px-12">
          <img
            alt="Sân bóng SportZone nhìn từ trên cao"
            className="absolute inset-0 h-full w-full object-cover"
            src="/home/hero-field.jpg"
          />
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

          <div className="relative z-10 flex w-full max-w-[1080px] flex-col items-center gap-6 text-center text-white">
            <div className="flex flex-col items-center gap-2">
              <Typography.Heading
                className="text-balance text-[28px] font-medium leading-9 text-white sm:text-[36px] sm:leading-10"
                level={1}
              >
                Đặt sân nhanh chóng với SportZone.
              </Typography.Heading>
              <Typography.Paragraph className="max-w-[760px] text-[14px] leading-5 text-white/90 sm:text-[16px] sm:leading-6">
                Dữ liệu được SportZone. cập nhật thường xuyên giúp cho người dùng
                tìm được sân một cách nhanh nhất
              </Typography.Paragraph>
            </div>

            <Card
              className="w-full border-0 bg-white/85 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md"
              variant="transparent"
            >
              <Card.Content className="grid w-full gap-3 p-4 text-left md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_198px_185px_186px_auto] xl:items-end">
                <SearchField className="w-full" fullWidth>
                  <Label>Tìm theo từ khoá</Label>
                  <SearchField.Group className="h-11 rounded-2xl">
                    <SearchField.SearchIcon>
                      <Magnifier className="size-4 text-muted" aria-hidden="true" />
                    </SearchField.SearchIcon>
                    <SearchField.Input
                      className="placeholder:text-muted"
                      placeholder="Tìm kiếm sân bóng đá, cầu lông,..."
                    />
                  </SearchField.Group>
                </SearchField>

                <FilterSelect
                  items={sportOptions}
                  label="Môn thể thao"
                  placeholder="Chọn môn thể thao"
                />
                <FilterSelect
                  items={areaOptions}
                  label="Khu vực"
                  placeholder="Chọn khu vực"
                />
                <FilterDatePicker />

                <Button
                  className="h-9 rounded-xl px-4 text-[14px]! font-medium! md:col-span-2 xl:col-span-1"
                  type="button"
                  variant="primary"
                  onPress={() => navigate(routePaths.courts)}
                >
                  <Magnifier className="size-4" aria-hidden="true" />
                  Tìm kiếm
                </Button>
              </Card.Content>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-12">
        <Typography.Heading
          className="mb-5 text-[20px] font-semibold leading-7 text-[#18181b]"
          level={2}
        >
          Lựa chọn sân phù hợp theo môn thể thao
        </Typography.Heading>
        {isLoadingHomeData ? (
          <div className="flex flex-wrap gap-3" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="h-8 w-[132px] animate-pulse rounded-3xl bg-default"
                key={index}
              />
            ))}
          </div>
        ) : sportFilters.length > 1 ? (
          <div className="flex flex-wrap gap-3">
            {sportFilters.map((sport) => (
              <Button
                className="h-8 min-w-[132px] rounded-3xl border border-border bg-white px-4 text-[13px]! font-medium! text-[#18181b] shadow-none"
                key={sport.label}
                type="button"
                variant="tertiary"
                onPress={() => navigate(sport.to)}
              >
                {sport.label}
              </Button>
            ))}
          </div>
        ) : (
          <HomeInlineState message="Chưa có môn thể thao đang hoạt động." />
        )}

        <CourtSection
          className="mt-10"
          eyebrow="Khu vực được đề xuất gần vị trí của bạn"
          title="Sân nổi bật gần bạn"
          courts={nearbyCourts}
          errorMessage={homeDataError}
          isLoading={isLoadingHomeData}
          onRetry={loadHomeData}
        />

        <CourtSection
          className="mt-12"
          eyebrow="Các sân người chơi thường xuyên lựa chọn"
          title="Được đặt nhiều"
          courts={popularCourts}
          errorMessage={homeDataError}
          isLoading={isLoadingHomeData}
          onRetry={loadHomeData}
        />

        <RatedCourtsSection
          courts={ratedCourts}
          errorMessage={homeDataError}
          isLoading={isLoadingHomeData}
          onRetry={loadHomeData}
        />

        <BookingStepsSection />
      </section>

      <section
        className="bg-[#2c2c2c] pt-0"
        id="contact"
      >
        <div className="bg-background px-6 py-12 lg:px-12 lg:py-14">
          <div className="flex max-w-[920px] flex-col gap-5">
            <Typography.Heading
              className="text-balance text-[40px] font-bold leading-[48px] text-[#1e1e1e] sm:text-[56px] sm:leading-[64px] lg:text-[72px] lg:leading-[86px]"
              level={2}
            >
              Đặt sân nhanh chóng, tiết kiệm
            </Typography.Heading>

            <Form
              className="flex w-full max-w-[560px] flex-col items-stretch gap-3 sm:flex-row sm:items-end"
              onSubmit={handleContactSubmit}
            >
              <TextField className="w-full flex-1" name="contact">
                <Label>Chúng tôi sẽ liên lạc với bạn qua email</Label>
                <InputGroup variant="primary" className="mt-2 h-12 rounded-2xl">
                  <InputGroup.Prefix>
                    <Envelope className="size-4 text-muted" aria-hidden="true" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    className="text-[14px] placeholder:text-muted"
                    placeholder="youremail@mail.com"
                    type="email"
                  />
                </InputGroup>
              </TextField>

              <Button
                className="h-12 rounded-2xl px-4 text-[14px]! font-medium!"
                type="submit"
                variant="primary"
              >
                <PaperPlane/> Submit
              </Button>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({
  items,
  label,
  placeholder,
}: {
  items: Array<{ id: string; label: string }>;
  label: string;
  placeholder: string;
}) {
  return (
    <Select className="w-full" placeholder={placeholder}>
      <Label>{label}</Label>
      <Select.Trigger className={"h-11 rounded-2xl"}>
        <Select.Value className={"my-auto text-[14px]!"}/>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map((item) => (
            <ListBox.Item id={item.id} key={item.id} textValue={item.label}>
              {item.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function FilterDatePicker() {
  return (
    <DatePicker className="w-full" name="date">
      <Label>Date</Label>
      <DateField.Group fullWidth className={"h-11 rounded-2xl"}>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

function CourtSection({
  className = "",
  courts,
  errorMessage,
  eyebrow,
  isLoading,
  onRetry,
  title,
}: {
  className?: string;
  courts: CourtPreview[];
  errorMessage?: string | null;
  eyebrow: string;
  isLoading?: boolean;
  onRetry?: () => void;
  title: string;
}) {
  return (
    <section className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} />
      {isLoading ? (
        <CourtPreviewSkeleton className="mt-5" count={4} />
      ) : errorMessage ? (
        <HomeInlineState
          className="mt-5"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : courts.length === 0 ? (
        <HomeInlineState
          className="mt-5"
          message="Chưa có sân phù hợp để hiển thị."
        />
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courts.map((court) => (
            <CourtPreviewCard court={court} key={court.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <Typography.Heading
          className="text-[20px] font-semibold leading-7 text-[#18181b]"
          level={2}
        >
          {title}
        </Typography.Heading>
        {eyebrow && (
          <Typography.Paragraph
            className="mt-1 text-[13px] leading-5 text-muted"
            size="sm"
          >
            {eyebrow}
          </Typography.Paragraph>
        )}
      </div>
      <Link
        className="shrink-0 text-[13px] font-medium text-[#18181b] hover:text-primary!"
        href={routePaths.courts}
      >
        Xem thêm
        <CaretRight className="size-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

function CourtPreviewCard({ court }: { court: CourtPreview }) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-3xl p-1.5 border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <Card.Content className="flex h-full flex-col gap-2.5 p-0">
        <div className="aspect-[1.32/1] w-full overflow-hidden rounded-2xl bg-default">
          <img
            alt={court.name}
            className="h-full w-full object-cover"
            src={court.image}
          />
        </div>
        <div className="flex min-h-[78px] flex-1 flex-col justify-between gap-2 p-2">
          <div className="space-y-2">
            <Typography className="text-lg leading-4 text-[#18181b]">
              {court.name}
            </Typography>
            <Typography.Paragraph
              className="line-clamp-1 text-[11px] leading-4 text-muted"
              size="sm"
            >
              {court.address}
            </Typography.Paragraph>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Typography className="text-xl font-medium leading-4 text-[#18181b]">
              {court.price}
            </Typography>
            <Button
              isIconOnly
              aria-label={`Xem chi tiết ${court.name}`}
              className="size-7 rounded-full"
              type="button"
              variant="tertiary"
              onPress={() => navigate(routePaths.courtDetail(String(court.id)))}
            >
              <CaretRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

function RatedCourtsSection({
  courts,
  errorMessage,
  isLoading,
  onRetry,
}: {
  courts: CourtPreview[];
  errorMessage?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <section className="mt-12">
      <SectionHeading
        eyebrow="Cụm sân được người chơi đánh giá cao"
        title="Cụm sân được đánh giá cao"
      />
      {isLoading ? (
        <CourtPreviewSkeleton className="mt-5 lg:grid-cols-3" count={3} />
      ) : errorMessage ? (
        <HomeInlineState
          className="mt-5"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : courts.length === 0 ? (
        <HomeInlineState
          className="mt-5"
          message="Chưa có cụm sân phù hợp để hiển thị."
        />
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {courts.map((court) => (
            <Card
              className="rounded-3xl p-1.5 border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              key={court.id}
            >
              <Card.Content className="flex flex-row min-h-[96px] gap-3 p-0">
                <img
                  alt={court.name}
                  className="w-[116px] shrink-0 rounded-2xl aspect-video object-cover"
                  src={court.image}
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-1">
                  <div className="min-w-0">
                    <Typography className="truncate text-base font-medium text-[#18181b]">
                      {court.name}
                    </Typography>
                    <Typography.Paragraph
                      className="text-[11px] leading-4 text-muted"
                      size="xs"
                    >
                      {court.address}
                    </Typography.Paragraph>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <Typography className="text-[12px] font-medium leading-4 text-[#18181b]">
                        {court.time ?? "Đang cập nhật"}
                      </Typography>
                      <Typography.Paragraph
                        className="text-[11px] leading-4 text-muted"
                        size="xs"
                      >
                        Thời gian mở cửa
                      </Typography.Paragraph>
                    </div>
                    <Button
                      className="h-8 shrink-0 rounded-3xl px-3 text-[12px]! font-medium!"
                      type="button"
                      variant="tertiary"
                      onPress={() => navigate(routePaths.courtDetail(String(court.id)))}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function CourtPreviewSkeleton({
  className = "",
  count,
}: {
  className?: string;
  count: number;
}) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`} aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="h-[220px] animate-pulse rounded-3xl border border-border bg-default"
          key={index}
        />
      ))}
    </div>
  );
}

function HomeInlineState({
  className = "",
  message,
  onRetry,
}: {
  className?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={`rounded-3xl border border-border bg-white p-5 ${className}`}>
      <Typography.Paragraph className="text-sm leading-5 text-muted" size="sm">
        {message}
      </Typography.Paragraph>
      {onRetry ? (
        <Button
          className="mt-3 h-9 rounded-3xl px-4 text-[13px]! font-medium!"
          type="button"
          variant="tertiary"
          onPress={onRetry}
        >
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}

function mapCourtToPreview(court: Court): CourtPreview {
  const openingTime = court.venueOpeningTime && court.venueClosingTime
    ? `${court.venueOpeningTime} - ${court.venueClosingTime}`
    : undefined;

  return {
    id: court.id,
    name: court.name,
    address: court.venueAddress ?? court.venueName ?? "Địa điểm đang cập nhật",
    image: court.primaryImageUrl ?? getFallbackCourtImage(court.sportName),
    price: `${formatCurrency(court.pricePerHour)}/h`,
    time: openingTime,
  };
}

function getFallbackCourtImage(sportName?: string) {
  const normalizedSportName = sportName?.toLocaleLowerCase("vi-VN") ?? "";

  if (normalizedSportName.includes("cầu lông") || normalizedSportName.includes("badminton")) {
    return "/home/court-badminton.png";
  }

  return "/home/court-football.png";
}

function getItems<T>(data: T[] | { items: T[] }) {
  return Array.isArray(data) ? data : data.items;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Không tải được dữ liệu trang chủ.";
}

function BookingStepsSection() {
  return (
    <section className="mt-14 border-b border-border pb-12">
      <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
          <Typography.Heading
            className="text-[20px] font-semibold leading-7 text-[#18181b]"
            level={2}
          >
            Đặt sân dễ dàng
          </Typography.Heading>
          <Typography.Paragraph
            className="mt-1 text-[13px] leading-5 text-muted"
            size="sm"
          >
            Hoàn thành đặt lịch sân bạn muốn chỉ với 3 bước
          </Typography.Paragraph>
        </div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {bookingSteps.map((step) => (
          <Card
            className="rounded-3xl border border-border bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]"
            key={step.step}
          >
            <Card.Content className="flex flex-col gap-3 p-4">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <Typography className="text-[12px] font-medium leading-4 text-[#18181b]">
                    {step.step}
                  </Typography>
                  <Typography className="text-base font-medium leading-5 text-[#18181b]">
                    {step.title}
                  </Typography>
                </div>
                <Typography.Paragraph
                  className="text-[12px] leading-4 text-muted"
                  size="xs"
                >
                  {step.description}
                </Typography.Paragraph>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  );
}
