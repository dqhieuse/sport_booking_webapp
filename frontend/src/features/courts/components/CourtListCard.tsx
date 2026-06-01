import { ArrowRight, MapPin } from '@mynaui/icons-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { routePaths } from '@/routes/routePaths';

import type { Court } from '../types';

type CourtListCardProps = {
  court: Court;
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function CourtListCard({ court }: CourtListCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/8] shrink-0 overflow-hidden bg-muted">
        {court.primaryImageUrl ? (
          <img
            src={court.primaryImageUrl}
            alt={court.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary text-sm text-muted-foreground">
            Court
          </div>
        )}
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
          <Badge className="max-w-full gap-2 border bg-background text-foreground shadow-sm">
            <span className="min-w-0 truncate">{court.sport.name}</span>
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-5 p-5">
        <div className="space-y-2">
          <h2 className="line-clamp-1 font-display text-xl font-semibold text-foreground">{court.name}</h2>
          <p className="line-clamp-1 text-sm font-medium text-foreground/80">{court.venue.name}</p>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            <MapPin className="mr-1 inline size-4 text-muted-foreground" aria-hidden="true" />
            {court.venue.address}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="font-display text-xl font-semibold text-primary">
              {currencyFormatter.format(court.pricePerHour)}
            </p>
            <p className="text-xs text-muted-foreground">per hour</p>
          </div>
          <Button asChild size="sm">
            <Link to={routePaths.courtDetail.replace(':courtId', String(court.id))}>
              View
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
