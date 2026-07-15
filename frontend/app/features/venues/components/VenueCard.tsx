import { MapPin } from "@gravity-ui/icons";
import { Button, Card, Chip } from "@heroui/react";
import { Link } from "react-router";

import type { Venue } from "~/features/venues/types";
import { routePaths } from "~/routes/routePaths";

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Card className="overflow-hidden border border-border bg-card" variant="default">
      <div className="aspect-[16/10] bg-secondary">
        {venue.primaryImageUrl ? (
          <img
            alt={venue.name}
            className="h-full w-full object-cover"
            src={venue.primaryImageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Chưa có ảnh địa điểm
          </div>
        )}
      </div>
      <Card.Content className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="line-clamp-2 text-lg font-semibold">{venue.name}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {venue.address}
            </p>
          </div>
          <Chip size="sm" variant="primary">
            {venue.status ?? "ACTIVE"}
          </Chip>
        </div>
        <Button fullWidth variant="outline">
          <Link to={routePaths.venueDetail(String(venue.id))}>Xem địa điểm</Link>
        </Button>
      </Card.Content>
    </Card>
  );
}
