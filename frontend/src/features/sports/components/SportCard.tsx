import { Activity, ArrowRight } from '@mynaui/icons-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { routePaths } from '@/routes/routePaths';

import type { Sport } from '../types';

type SportCardProps = {
  sport: Sport;
};

export function SportCard({ sport }: SportCardProps) {
  const courtsPath = `${routePaths.courts}?sportId=${sport.id}`;

  return (
    <Card className="group relative h-full min-h-56 overflow-hidden">
      <CardContent className="flex h-full flex-col gap-5 p-5">
        <div className="absolute -bottom-14 -start-20 flex size-72 items-center justify-center rounded-full bg-primary/5">
          <div className="flex size-52 items-center justify-center rounded-full bg-primary/10">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-muted text-primary">
              <Activity className="size-24 text-primary/50" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="z-10 space-y-3">
          <h2 className="line-clamp-2 font-display text-4xl font-black uppercase leading-none text-foreground">{sport.name}</h2>
          <p className="line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6 text-muted-foreground">
            {sport.description || 'Courts and venues for this sport are ready to explore.'}
          </p>
        </div>

        <div className="z-10 mt-auto flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button asChild size="sm">
            <Link to={courtsPath}>
              Courts
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
