import { Clock3, ImageOff, MapPin } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import type { Court, Venue } from "@/types/public-api"

function Media({ src, alt }: { src: string | null; alt: string }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="grid aspect-[4/3] place-items-center bg-muted text-muted-foreground">
        <div className="flex flex-col items-center gap-2 text-sm"><ImageOff className="size-6" aria-hidden="true" /> Chưa có hình ảnh</div>
      </div>
    )
  }

  return <img src={src} alt={alt} className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" onError={() => setHasError(true)} />
}

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export function CourtCard({ court }: { court: Court }) {
  return (
    <article className="group min-w-0">
      <div className="overflow-hidden rounded-2xl"><Media src={court.primaryImageUrl} alt={`Sân ${court.name}`} /></div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-semibold tracking-tight">{court.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{court.sport.name} · {court.venue.name}</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">Đang mở</Badge>
        </div>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span className="line-clamp-1">{court.venue.address}</span></p>
        <p className="mt-4 font-semibold text-foreground">{currency.format(court.pricePerHour)}<span className="text-sm font-normal text-muted-foreground"> / giờ</span></p>
      </div>
    </article>
  )
}

export function CompactCourtCard({ court }: { court: Court }) {
  return (
    <article className="grid min-w-0 grid-cols-[120px_minmax(0,1fr)] gap-4 rounded-2xl bg-muted/80 p-3 sm:grid-cols-[140px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-xl [&>div]:aspect-[4/3] [&>img]:aspect-[4/3]"><Media src={court.primaryImageUrl} alt={`Sân ${court.name}`} /></div>
      <div className="flex min-w-0 flex-col justify-center py-1">
        <h3 className="line-clamp-1 font-semibold">{court.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{court.sport.name} · {court.venue.name}</p>
        <p className="mt-3 text-sm font-semibold">{currency.format(court.pricePerHour)}<span className="font-normal text-muted-foreground"> / giờ</span></p>
      </div>
    </article>
  )
}

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <article className="group grid overflow-hidden rounded-2xl bg-muted/70 sm:grid-cols-[180px_1fr] lg:grid-cols-[150px_1fr]">
      <div className="overflow-hidden [&>div]:h-full [&>div]:aspect-auto [&>img]:h-full [&>img]:aspect-auto"><Media src={venue.primaryImageUrl} alt={`Địa điểm ${venue.name}`} /></div>
      <div className="flex min-w-0 flex-col justify-center p-5">
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">{venue.name}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span className="line-clamp-2">{venue.address}</span></p>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4 shrink-0" aria-hidden="true" />{venue.openingTime} – {venue.closingTime}</p>
      </div>
    </article>
  )
}
