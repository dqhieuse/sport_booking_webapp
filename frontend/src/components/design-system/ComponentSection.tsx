import type { ReactNode } from "react"
import { BookOpen, CheckCircle2, Component } from "lucide-react"

import { Badge } from "@/components/ui/badge"

type ComponentSectionProps = {
  id: string
  index: string
  title: string
  description: string
  guidelines: string[]
  sourcePath: string
  preview: ReactNode
}

export function ComponentSection({
  id,
  index,
  title,
  description,
  guidelines,
  sourcePath,
  preview,
}: ComponentSectionProps) {
  return (
    <article id={id} className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-4 font-mono text-primary">
            {index}
            </Badge>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <Component className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <BookOpen className="size-4" aria-hidden="true" />
            Hướng dẫn trước khi thiết kế
          </div>
          <ul className="mt-3 space-y-2.5">
            {guidelines.map((guideline) => (
              <li key={guideline} className="flex gap-2 text-sm leading-5 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-muted/20 p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span>Không gian thiết kế component</span>
          <code className="normal-case tracking-normal">{sourcePath}</code>
        </div>
        <div className="flex min-h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background p-4 sm:p-6">
          <div className="w-full min-w-0">{preview}</div>
        </div>
      </div>
    </article>
  )
}
