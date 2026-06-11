import { DangerCircle, Refresh } from '@mynaui/icons-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ApiErrorMessageProps = {
  title: string;
  message: string | null;
  onRetry?: () => void;
};

export function ApiErrorMessage({ title, message, onRetry }: ApiErrorMessageProps) {
  return (
    <Alert variant="destructive_ghost">
      <DangerCircle className="size-4" aria-hidden="true" />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {message || 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </div>
        {onRetry && (
          <Button type="button" onClick={onRetry}>
            <Refresh className="mr-2 size-4" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
}
