import { PageHeader } from "~/components/common/PageHeader";
import { VenueCard } from "~/features/venues/components/VenueCard";
import type { Venue } from "~/features/venues/types";

const venues: Venue[] = [
  {
    id: 1,
    name: "SportZone Arena",
    address: "Quận 7, TP. Hồ Chí Minh",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Victory Sports Hub",
    address: "Thủ Đức, TP. Hồ Chí Minh",
    status: "ACTIVE",
  },
];

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Địa điểm"
        description="Danh sách địa điểm dùng layout image-forward, dễ scan địa chỉ và trạng thái."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}
