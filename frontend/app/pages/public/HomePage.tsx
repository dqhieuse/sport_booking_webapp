import {
  Calendar as CalendarIcon,
  CaretRight,
  Envelope,
  Magnifier,
  SquareCheck,
} from "@gravity-ui/icons";
import {
  Button,
  Calendar,
  Card,
  DateField,
  DatePicker,
  InputGroup,
  Label,
  Link,
  ListBox,
  SearchField,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import { useNavigate } from "react-router";

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

const sportFilters = [
  { label: "Bóng đá", to: `${routePaths.courts}?sport=bong-da` },
  { label: "Cầu lông", to: `${routePaths.courts}?sport=cau-long` },
  { label: "Tennis", to: `${routePaths.courts}?sport=tennis` },
  { label: "Pickleball", to: `${routePaths.courts}?sport=pickleball` },
  { label: "Xem thêm", to: routePaths.sports },
];

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

const nearbyCourts: CourtPreview[] = [
  {
    id: 1,
    name: "Sân cỏ nhân tạo Hòa Lạc",
    address: "Hòa Lạc, TP. Hà Nội",
    image: "/home/court-football.png",
    price: "120.000đ/h",
  },
  {
    id: 2,
    name: "Sân bóng mini Thủ Đức",
    address: "Linh Trung, TP. Hồ Chí Minh",
    image: "/home/court-football.png",
    price: "150.000đ/h",
  },
  {
    id: 3,
    name: "Sân bóng đá Phú Nhuận",
    address: "Hoàng Văn Thụ, TP. Hồ Chí Minh",
    image: "/home/court-football.png",
    price: "128.000đ/h",
  },
  {
    id: 4,
    name: "Sân bóng Celadon Tân Phú",
    address: "Sơn Kỳ, TP. Hồ Chí Minh",
    image: "/home/court-football.png",
    price: "180.000đ/h",
  },
];

const popularCourts: CourtPreview[] = [
  {
    id: 5,
    name: "Sân cầu lông Hòa Lạc",
    address: "Khu CNC Hòa Lạc, Hà Nội",
    image: "/home/court-badminton.png",
    price: "120.000đ/h",
  },
  {
    id: 6,
    name: "Sân cầu lông Bình Thạnh",
    address: "Ung Văn Khiêm, TP. Hồ Chí Minh",
    image: "/home/court-badminton.png",
    price: "110.000đ/h",
  },
  {
    id: 7,
    name: "Sân cầu lông Quận 10",
    address: "Thành Thái, TP. Hồ Chí Minh",
    image: "/home/court-badminton.png",
    price: "130.000đ/h",
  },
  {
    id: 8,
    name: "Sân cầu lông Cầu Giấy",
    address: "Dịch Vọng, Hà Nội",
    image: "/home/court-badminton.png",
    price: "125.000đ/h",
  },
];

const ratedCourts: CourtPreview[] = [
  {
    id: 9,
    name: "Cụm sân bóng đá Nam Quốc gia Hà Nội",
    address: "Lê Đức Thọ, Mỹ Đình",
    image: "/home/court-football.png",
    price: "400.000 - 500.000",
    time: "10:00 - 21:00",
  },
  {
    id: 10,
    name: "Sân vận động Mỹ Đình",
    address: "Đường Lê Đức Thọ, Hà Nội",
    image: "/home/court-football.png",
    price: "350.000 - 450.000",
    time: "06:30 - 22:30",
  },
  {
    id: 11,
    name: "Sân bóng đá Phú Nhuận",
    address: "Nguyễn Kiệm, TP. Hồ Chí Minh",
    image: "/home/court-football.png",
    price: "670.000 - 290.000",
    time: "17:00 - 21:00",
  },
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
    icon: <SquareCheck className="size-5" aria-hidden="true" />,
    step: "BƯỚC 3",
    title: "Thanh toán và tham gia đúng giờ",
    description:
      "Xác nhận lịch đặt, nhận thông tin sân và đến đúng giờ để bắt đầu trận đấu.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <section className="px-2 pb-0">
        <div className="relative flex min-h-[420px] w-full overflow-hidden rounded-[32px] bg-[#111111] px-4 py-16 sm:min-h-[460px] sm:px-8 lg:min-h-[448px] lg:items-center lg:justify-center lg:px-12">
          <img
            alt="Sân bóng SportZone nhìn từ trên cao"
            className="absolute inset-0 h-full w-full object-cover"
            src="/home/hero-field.png"
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
                  <SearchField.Group className="h-9 rounded-xl border-0 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
                    <SearchField.SearchIcon>
                      <Magnifier className="size-4 text-muted" aria-hidden="true" />
                    </SearchField.SearchIcon>
                    <SearchField.Input
                      className="text-[14px] placeholder:text-muted"
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

        <CourtSection
          className="mt-10"
          eyebrow="Khu vực được đề xuất gần vị trí của bạn"
          title="Sân nổi bật gần bạn"
          courts={nearbyCourts}
        />

        <CourtSection
          className="mt-12"
          eyebrow="Các sân người chơi thường xuyên lựa chọn"
          title="Được đặt nhiều"
          courts={popularCourts}
        />

        <RatedCourtsSection />

        <BookingStepsSection />
      </section>

      <section
        className="bg-[#2c2c2c] pt-0"
        id="contact"
      >
        <div className="rounded-b-[48px] bg-white px-6 py-12 lg:rounded-b-[72px] lg:px-12 lg:py-14">
          <div className="flex max-w-[920px] flex-col gap-5">
            <Typography.Heading
              className="text-balance text-[40px] font-bold leading-[48px] text-[#1e1e1e] sm:text-[56px] sm:leading-[64px] lg:text-[72px] lg:leading-[86px]"
              level={2}
            >
              Đặt sân nhanh chóng, tiết kiệm
            </Typography.Heading>

            <TextField className="w-full max-w-[420px]" name="contact">
              <Label>
                Chúng tôi sẽ liên lạc với bạn qua email
              </Label>
              <InputGroup className="h-12 mt-2 rounded-2xl border-0 bg-default">
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
          </div>
        </div>
        <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden px-6">
          <Typography
            className="translate-y-10 text-[64px] font-bold leading-none text-white/0 [-webkit-text-stroke:1px_rgba(255,255,255,0.16)] sm:text-[120px] lg:text-[200px]"
          >
            SportZone.
          </Typography>
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
      <Select.Trigger>
        <Select.Value />
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
      <DateField.Group fullWidth>
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
  eyebrow,
  title,
}: {
  className?: string;
  courts: CourtPreview[];
  eyebrow: string;
  title: string;
}) {
  return (
    <section className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courts.map((court) => (
          <CourtPreviewCard court={court} key={court.id} />
        ))}
      </div>
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

function RatedCourtsSection() {
  return (
    <section className="mt-12">
      <SectionHeading
        eyebrow="Cụm sân được người chơi đánh giá cao"
        title="Cụm sân được đánh giá cao"
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {ratedCourts.map((court) => (
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
                      {court.time}
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
                  >
                    Chi tiết
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  );
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
                  <Typography className="text-[14px] font-medium leading-5 text-[#18181b]">
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
