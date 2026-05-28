import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { routePaths } from '@/routes/routePaths';

import type { Venue } from '../types';

type VenueHighlightCardProps = {
  venue: Venue;
};

export function VenueHighlightCard({ venue }: VenueHighlightCardProps) {
  const detailPath = routePaths.venueDetail.replace(':venueId', String(venue.id));

  return (
    <Card className="sportzone-panel group overflow-hidden">
      <Link to={detailPath} className="block h-full no-underline">
        <div className="relative h-36 overflow-hidden">
          {venue.primaryImageUrl ? (
            <img
              src={venue.primaryImageUrl}
              alt={venue.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary text-sm text-muted-foreground">
              Venue
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        </div>

        <CardContent className="space-y-4 p-5">
          <div>
            <h3 className="line-clamp-1 font-display text-lg font-semibold text-foreground">{venue.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              <MapPin className="mr-1 inline h-4 w-4 text-primary" aria-hidden="true" />
              {venue.address}
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            {venue.openingTime} - {venue.closingTime}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
