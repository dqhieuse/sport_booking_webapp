import { TargetDart } from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import { Link } from "react-router";

import type { Sport } from "~/features/sports/types";
import { routePaths } from "~/routes/routePaths";

export function SportCard({ sport }: { sport: Sport }) {
  return (
    <Link to={`${routePaths.courts}?sport=${sport.slug ?? sport.id}`}>
      <Card
        className="border border-border bg-card transition hover:border-primary"
        variant="default"
      >
        <Card.Content className="flex items-center gap-4 p-4">
          <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
            <TargetDart className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">{sport.name}</h2>
            <p className="text-sm text-muted-foreground">
              Tìm sân phù hợp theo môn
            </p>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
