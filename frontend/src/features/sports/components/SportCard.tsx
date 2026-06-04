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
    <Card className="group h-full overflow-hidden relative">
      <CardContent className="flex h-full flex-col gap-5 p-5">
        <div className="absolute -bottom-14 -start-20 rounded-full size-72 flex justify-center items-center bg-muted/30">
          <div className="rounded-full size-52 flex justify-center items-center bg-muted/60">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-full border bg-muted text-primary">
              <Activity className="size-24 text-primary/50" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="space-y-2 z-10">
          <h2 className="line-clamp-2 font-display text-xl font-semibold leading-tight text-foreground">{sport.name}</h2>
          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
            {sport.description || 'Courts and venues for this sport are ready to explore.'}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border/70 pt-4 z-10">
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
