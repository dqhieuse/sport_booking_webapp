import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { Court } from '../types';

type CourtSuggestionCardProps = {
  court: Court;
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function CourtSuggestionCard({ court }: CourtSuggestionCardProps) {
  return (
    <Card className="sportzone-panel group overflow-hidden">
      <div className="grid h-full gap-0 sm:grid-cols-[160px_1fr]">
        <div className="relative min-h-36 overflow-hidden bg-muted">
          {court.primaryImageUrl ? (
            <img
              src={court.primaryImageUrl}
              alt={court.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary text-sm text-muted-foreground">
              Court
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{court.sport.name}</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="line-clamp-1 font-display text-xl font-bold text-foreground">{court.name}</h3>
            <p className="line-clamp-1 text-sm text-muted-foreground">{court.venue.name}</p>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              <MapPin className="mr-1 inline h-4 w-4 text-primary" aria-hidden="true" />
              {court.venue.address}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-lg font-black text-primary">
              {currencyFormatter.format(court.pricePerHour)}
              <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">/ hour</span>
            </p>
            <Button asChild size="sm" className="rounded-full">
              <Link to={`/courts/${court.id}`}>
                View
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
