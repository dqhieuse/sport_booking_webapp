import { ArrowRight, MapPin } from '@mynaui/icons-react';
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
    <Card className="group overflow-hidden">
      <div className="grid h-full gap-0 sm:grid-cols-[160px_1fr]">
        <div className="relative min-h-36 overflow-hidden bg-muted">
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
        </div>

        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{court.sport.name}</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="line-clamp-1 font-display text-xl font-semibold text-foreground">{court.name}</h3>
            <p className="line-clamp-1 text-sm text-muted-foreground">{court.venue.name}</p>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              <MapPin className="mr-1 inline size-4 text-muted-foreground" aria-hidden="true" />
              {court.venue.address}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-lg font-semibold text-primary">
              {currencyFormatter.format(court.pricePerHour)}
              <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">/ hour</span>
            </p>
            <Button asChild size="sm">
              <Link to={`/courts/${court.id}`}>
                View
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
