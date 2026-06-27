import { useMemo, useState } from "react"
import { Boxes, CheckCircle2, Search } from "lucide-react"

import { ComponentSection } from "@/components/design-system/ComponentSection"
import { ComponentPreview } from "@/components/design-system/ComponentPreview"
import { ThemeToggle } from "@/components/design-system/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type ComponentGroup = {
  id: string
  title: string
  purpose: string
  guideline: string
  components: string[]
}

const componentGroups: ComponentGroup[] = [
  {
    id: "actions",
    title: "Actions",
    purpose: "Thao tác, lựa chọn nhanh và menu hành động.",
    guideline: "Xác định rõ cấp độ primary, secondary và destructive; thiết kế đủ hover, focus, active và disabled.",
    components: ["button", "button-group", "toggle", "toggle-group", "dropdown-menu", "context-menu"],
  },
  {
    id: "forms",
    title: "Forms & Inputs",
    purpose: "Thu thập, lựa chọn và kiểm tra dữ liệu người dùng.",
    guideline: "Giữ label luôn rõ, bổ sung validation/error state và không làm mất hành vi bàn phím gốc.",
    components: ["calendar", "checkbox", "field", "form", "input", "input-group", "input-otp", "label", "native-select", "radio-group", "select", "slider", "switch", "textarea"],
  },
  {
    id: "navigation",
    title: "Navigation",
    purpose: "Điều hướng giữa trang, vùng nội dung và tập dữ liệu.",
    guideline: "Làm rõ trạng thái current/active, hỗ trợ keyboard navigation và giữ nhãn ngắn gọn.",
    components: ["breadcrumb", "command", "menubar", "navigation-menu", "pagination", "sidebar", "tabs"],
  },
  {
    id: "feedback",
    title: "Feedback",
    purpose: "Phản hồi tiến trình, trạng thái rỗng và kết quả thao tác.",
    guideline: "Không truyền đạt trạng thái chỉ bằng màu; luôn có nội dung, icon hoặc hành động tiếp theo phù hợp.",
    components: ["alert", "alert-dialog", "empty", "progress", "skeleton", "sonner", "spinner"],
  },
  {
    id: "data-display",
    title: "Data Display",
    purpose: "Trình bày nội dung, dữ liệu và thông tin nhận diện.",
    guideline: "Kiểm tra với nội dung dài, dữ liệu rỗng và kích thước responsive trước khi chốt thiết kế.",
    components: ["aspect-ratio", "avatar", "badge", "card", "carousel", "chart", "item", "kbd", "table"],
  },
  {
    id: "disclosure",
    title: "Disclosure",
    purpose: "Ẩn/hiện thông tin bổ sung mà không làm nặng màn hình.",
    guideline: "Dấu hiệu mở/đóng phải rõ ràng; nội dung vẫn truy cập được bằng bàn phím và screen reader.",
    components: ["accordion", "collapsible", "hover-card", "tooltip"],
  },
  {
    id: "overlays",
    title: "Overlays",
    purpose: "Hiển thị tác vụ hoặc nội dung nổi phía trên luồng chính.",
    guideline: "Giữ focus trap, nút đóng, Escape và kích thước mobile; không lồng nhiều lớp overlay.",
    components: ["dialog", "direction", "drawer", "popover", "sheet"],
  },
  {
    id: "layout",
    title: "Layout Utilities",
    purpose: "Chia vùng, cuộn và tạo cấu trúc hiển thị linh hoạt.",
    guideline: "Kiểm tra overflow ở 320px, 768px và desktop; không dùng kích thước cố định làm vỡ nội dung.",
    components: ["resizable", "scroll-area", "separator"],
  },
]

const uniqueComponentNames = Array.from(new Set(componentGroups.flatMap((group) => group.components)))

function toTitle(componentName: string) {
  return componentName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function DesignSystemPage() {
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLowerCase()

  const filteredGroups = useMemo(
    () => componentGroups
      .map((group) => ({
        ...group,
        components: group.components.filter((name) => name.includes(normalizedQuery)),
      }))
      .filter((group) => group.components.length > 0),
    [normalizedQuery],
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2 font-semibold no-underline">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">SZ</span>
            <span>SportZone <span className="hidden text-muted-foreground sm:inline">/ Design System</span></span>
          </a>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">{uniqueComponentNames.length} components</Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto grid max-w-[1600px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden border-r lg:block">
          <nav aria-label="Nhóm component" className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Danh mục</p>
            <ul className="space-y-1">
              {componentGroups.map((group) => (
                <li key={group.id}>
                  <a className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground no-underline hover:bg-accent hover:text-accent-foreground" href={`#group-${group.id}`}>
                    <span>{group.title}</span><span className="font-mono text-xs">{group.components.length}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl border bg-muted/40 p-4 text-xs leading-5 text-muted-foreground">
              <p className="font-semibold text-foreground">Quy ước trang</p>
              <p className="mt-2">Hướng dẫn luôn nằm trên canvas. Canvas render trực tiếp component gốc để mọi chỉnh sửa được cập nhật ngay.</p>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 px-4 sm:px-6 lg:px-10 xl:px-14">
          <section className="py-14 sm:py-20">
            <div className="max-w-4xl">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium text-primary"><Boxes className="size-4" /> Component workspace</div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Toàn bộ shadcn/ui trong một workspace.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Tất cả component hiện có được nhóm theo chức năng, có hướng dẫn trước và preview mặc định bên dưới. Khi bạn sửa component gốc, preview sẽ cập nhật trực tiếp qua Vite HMR.</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> {uniqueComponentNames.length} component đã kiểm kê</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Light / Dark</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Responsive layout</span>
              </div>
            </div>

            <div className="relative mt-10 max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-10" placeholder="Tìm component, ví dụ: dialog, table..." aria-label="Tìm component" />
            </div>
          </section>

          {filteredGroups.map((group) => (
            <section key={group.id} id={`group-${group.id}`} className="scroll-mt-20 border-t py-14">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{group.id}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{group.title}</h2><p className="mt-2 text-sm text-muted-foreground">{group.purpose}</p></div>
                <Badge variant="secondary">{group.components.length} components</Badge>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                {group.components.map((componentName) => {
                  return (
                    <ComponentSection
                      key={`${group.id}-${componentName}`}
                      id={`${group.id}-${componentName}`}
                      index={String(uniqueComponentNames.indexOf(componentName) + 1).padStart(2, "0")}
                      title={toTitle(componentName)}
                      description={`Primitive ${toTitle(componentName)} từ shadcn/ui, sẵn sàng để thiết kế phiên bản phù hợp với website.`}
                      guidelines={[
                        group.guideline,
                        "Giữ nguyên API, semantic HTML và hành vi accessibility của component gốc.",
                        "Dùng token light/dark và Sport Blue, không hard-code màu theo từng màn hình.",
                      ]}
                      sourcePath={`src/components/ui/${componentName}.tsx`}
                      preview={<ComponentPreview name={componentName} />}
                    />
                  )
                })}
              </div>
            </section>
          ))}

          {filteredGroups.length === 0 && (
            <div className="mb-20 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">Không tìm thấy component phù hợp với “{query}”.</div>
          )}

          <footer className="flex flex-col gap-3 border-t py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>SportZone Design System Workspace</p><p>{uniqueComponentNames.length} shadcn/ui components · React + Tailwind CSS</p></footer>
        </main>
      </div>
    </div>
  )
}
