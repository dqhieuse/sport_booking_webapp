import { PlusHexagon } from '@mynaui/icons-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <section className={cn('mx-auto flex flex-col items-center justify-center px-4 py-16 text-center', className)}>
      <div className="mx-auto rounded-full border bg-muted p-2">
        {icon || <PlusHexagon className="size-6" aria-hidden="true" />}
      </div>
      <h3 className="mt-2 text-sm font-medium">{title}</h3>
      <p className="mb-4 text-balance text-sm text-muted-foreground">{description}</p>
      {action}
    </section>
  );
}
