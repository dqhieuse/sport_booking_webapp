import { Component } from '@mynaui/icons-react';

import { EmptyState } from '@/components/empty-state';

type RoutePlaceholderPageProps = {
  title: string;
  description: string;
};

export function RoutePlaceholderPage({ title, description }: RoutePlaceholderPageProps) {
  return (
    <EmptyState
      icon={<Component className="size-6" aria-hidden="true" />}
      title={title}
      description={description}
      className="min-h-[360px]"
    />
  );
}
