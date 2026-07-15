import { PageHeader } from "~/components/common/PageHeader";
import { SportCard } from "~/features/sports/components/SportCard";
import type { Sport } from "~/features/sports/types";

const sports: Sport[] = [
  { id: 1, name: "Bóng đá", slug: "bong-da" },
  { id: 2, name: "Cầu lông", slug: "cau-long" },
  { id: 3, name: "Tennis", slug: "tennis" },
  { id: 4, name: "Bóng rổ", slug: "bong-ro" },
];

export default function SportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Môn thể thao"
        description="Danh sách discovery theo môn, sẵn sàng thay bằng dữ liệu từ API public sports."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sports.map((sport) => (
          <SportCard key={sport.id} sport={sport} />
        ))}
      </div>
    </div>
  );
}
