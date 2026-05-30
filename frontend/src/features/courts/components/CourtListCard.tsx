import { ArrowRight, MapPin } from 'lucide-react';
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
    <Card className="sportzone-panel group flex h-full flex-col overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
          <Badge className="max-w-full gap-2 rounded-full border-white/60 bg-white/90 px-3 py-1.5 text-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md dark:border-white/20 dark:bg-black/65 dark:text-white">
            <span className="min-w-0 truncate">{court.sport.name}</span>
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-5 p-5">
        <div className="space-y-2">
          <h2 className="line-clamp-1 font-display text-xl font-semibold text-foreground">{court.name}</h2>
          <p className="line-clamp-1 text-sm font-medium text-foreground/80">{court.venue.name}</p>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            <MapPin className="mr-1 inline h-4 w-4 text-primary" aria-hidden="true" />
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
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
