import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export function CreationStepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <ol
      className={cn(
        'grid gap-3 sm:grid-cols-2',
        steps.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
      )}
      aria-label="Creation progress"
    >
      {steps.map((label, index) => {
        const step = index + 1;
        const isComplete = currentStep > step;
        const isCurrent = currentStep === step;

        return (
          <li
            key={label}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 text-sm',
              isCurrent && 'border-primary bg-primary/5',
              isComplete && 'bg-muted/40',
            )}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                isCurrent && 'border-primary bg-primary text-primary-foreground',
                isComplete && 'border-emerald-500 bg-emerald-500 text-white',
              )}
            >
              {isComplete ? <Check className="size-4" aria-hidden="true" /> : step}
            </span>
            <span className={cn(isCurrent && 'font-medium text-foreground')}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
