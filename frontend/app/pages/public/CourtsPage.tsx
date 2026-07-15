import { PageHeader } from "~/components/common/PageHeader";
import { CourtCard } from "~/features/courts/components/CourtCard";
import type { Court } from "~/features/courts/types";

const courts: Court[] = [
  {
    id: 1,
    name: "Sân bóng 5 người Quận 7",
    sportName: "Bóng đá",
    venueName: "SportZone Arena",
    pricePerHour: 350000,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Sân cầu lông trong nhà A1",
    sportName: "Cầu lông",
    venueName: "Victory Sports Hub",
    pricePerHour: 120000,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Sân tennis tiêu chuẩn T2",
    sportName: "Tennis",
    venueName: "Central Court",
    pricePerHour: 220000,
    status: "ACTIVE",
  },
];

export default function CourtsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách sân"
        description="Card sân ưu tiên ảnh, môn, địa điểm, giá và trạng thái theo guideline."
      />
      <div className="rounded-[20px] border border-border bg-card p-4">
        <input
          className="min-h-11 w-full rounded-full border border-border bg-secondary px-4 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Tìm theo tên sân, môn hoặc địa điểm"
          type="search"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courts.map((court) => (
          <CourtCard court={court} key={court.id} />
        ))}
      </div>
    </div>
  );
}
