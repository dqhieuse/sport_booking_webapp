import { ArrowRight, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
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
    <Card className="sportzone-panel group overflow-hidden">
      <CardContent className="flex h-full flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
            <Dumbbell className="h-6 w-6" aria-hidden="true" />
          </div>
          <Badge className="gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {sport.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <h2 className="line-clamp-2 font-display text-xl font-bold leading-tight text-foreground">{sport.name}</h2>
          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
            {sport.description || 'Courts and venues for this sport are ready to explore.'}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <span className="text-xs font-medium uppercase text-muted-foreground">Sport category</span>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to={courtsPath}>
              Courts
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
