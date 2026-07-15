import { Magnifier } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { Link } from "react-router";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-8 text-center">
      <Magnifier className="mx-auto size-10 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionTo ? (
        <Button className="mt-5" variant="primary">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
    </section>
  );
}
