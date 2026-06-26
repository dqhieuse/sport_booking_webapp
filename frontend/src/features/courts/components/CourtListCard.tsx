import { MapPin } from '@mynaui/icons-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { routePaths } from '@/routes/routePaths';

import type { Court } from '../types';

type CourtListCardProps = {
  court: Court;
};

function formatCourtPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(1, Math.round(value / 25000)));
}

export function CourtListCard({ court }: CourtListCardProps) {
  return (
    <article className="arena-image-card group min-h-[320px]">
      {court.primaryImageUrl ? (
        <img
          src={court.primaryImageUrl}
          alt={court.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.2),transparent_28rem)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />

      <div className="relative flex min-h-[320px] flex-col justify-between p-6">
        <span className="w-fit bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground">
          {court.sport.name}
        </span>

        <div>
          <h2 className="font-display text-4xl font-black uppercase leading-none text-foreground">{court.name}</h2>
          <p className="mt-3 line-clamp-1 text-base font-semibold text-muted-foreground">{court.venue.name}</p>
          <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-primary">3 slots open</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-3xl font-black leading-none text-foreground">{formatCourtPrice(court.pricePerHour)}/hr</p>
              <p className="mt-2 line-clamp-1 text-xs font-semibold text-muted-foreground">
                <MapPin className="mr-1 inline size-3" aria-hidden="true" />
                {court.venue.address}
              </p>
            </div>
            <Button asChild size="sm">
              <Link to={routePaths.courtDetail.replace(':courtId', String(court.id))}>Book</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
