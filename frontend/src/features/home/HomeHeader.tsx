import { Menu, Search, X } from "lucide-react"
import { useState } from "react"

import { ThemeToggle } from "@/components/design-system/ThemeToggle"
import { Button } from "@/components/ui/button"

const navigation = [
  { label: "Tìm sân", href: "#courts" },
  { label: "Môn thể thao", href: "#sports" },
  { label: "Địa điểm", href: "#venues" },
]

export function HomeHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
      <div className="border-b bg-muted/60 px-4 py-2 text-center text-xs text-muted-foreground sm:text-sm">
        Khám phá sân thể thao phù hợp, giá rõ ràng và địa điểm thuận tiện.
      </div>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="font-semibold no-underline" aria-label="SportZone - Trang chủ">
          <span className="hidden text-lg tracking-tight sm:inline">SportZone</span><span className="text-primary font-black text-2xl">.</span>
        </a>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href="#courts"><Search aria-hidden="true" /> Khám phá sân</a>
          </Button>
          <ThemeToggle />
          <Button type="button" variant="outline" size="icon" className="md:hidden" aria-label={isOpen ? "Đóng menu" : "Mở menu"} aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}>
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <nav aria-label="Điều hướng di động" className="border-t bg-background px-4 py-3 md:hidden">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="block rounded-xl px-3 py-3 text-sm font-medium no-underline hover:bg-muted" onClick={() => setIsOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
