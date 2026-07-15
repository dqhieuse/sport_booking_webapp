import { Calendar, MapPin } from "@gravity-ui/icons";
import { Button, Card, Chip } from "@heroui/react";
import { Link } from "react-router";

import type { Court } from "~/features/courts/types";
import { formatCurrency } from "~/lib/utils";
import { routePaths } from "~/routes/routePaths";

export function CourtCard({ court }: { court: Court }) {
  return (
    <Card className="overflow-hidden border border-border bg-card" variant="default">
      <div className="aspect-[4/3] bg-secondary">
        {court.primaryImageUrl ? (
          <img
            alt={court.name}
            className="h-full w-full object-cover"
            src={court.primaryImageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Chưa có ảnh sân
          </div>
        )}
      </div>
      <Card.Content className="space-y-4 p-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="line-clamp-2 text-lg font-semibold">{court.name}</h2>
            <Chip size="sm" variant="primary">
              {court.status ?? "ACTIVE"}
            </Chip>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{court.sportName}</p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            {court.venueName ?? "Địa điểm đang cập nhật"}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" aria-hidden="true" />
            {formatCurrency(court.pricePerHour)} / giờ
          </p>
        </div>
        <Button fullWidth variant="primary">
          <Link to={routePaths.courtDetail(String(court.id))}>Xem chi tiết</Link>
        </Button>
      </Card.Content>
    </Card>
  );
}
