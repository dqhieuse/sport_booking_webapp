import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-32">
      <div className="space-y-2 text-center">
        <span className="font-semibold uppercase text-muted-foreground">404</span>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="text-balance text-muted-foreground">
          We could not find what you were looking for. Please check and try again.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
        <Button asChild size="sm">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
