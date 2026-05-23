import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ApiErrorMessageProps = {
  title: string;
  message: string | null;
  onRetry?: () => void;
};

export function ApiErrorMessage({ title, message, onRetry }: ApiErrorMessageProps) {
  return (
    <section className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {message || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
        {onRetry && (
          <Button type="button" onClick={onRetry} className="rounded-full">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    </section>
  );
}
