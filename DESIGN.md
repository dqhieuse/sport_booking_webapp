# DESIGN.md — SportZone Booking Platform
> AI Design System Document — Inspired by Mobbin's visual language, adapted for a Sports Facility Booking Web App

---

## 1. PROJECT BRIEF

**Product:** Sports facility booking platform (court, gym, pitch reservation)
**Audience:** Urban Vietnamese millennials (20–35), active lifestyle, mobile-first but desktop-comfortable
**Page's single job:** Let users discover, preview, and book sports venues with zero friction — the way Mobbin lets designers discover apps with zero friction
**Core aesthetic inspiration:** Mobbin.com — dense but breathable grid, dark-mode-first, thumbnail-forward, surgical use of color only for meaning

---

## 2. DESIGN PHILOSOPHY

Mobbin's genius is **information density without visual noise**. Everything is either content or navigation — never decoration.

Translate this to SportZone:

| Mobbin pattern | SportZone equivalent |
|---|---|
| App thumbnails as the hero content | Venue photo cards as primary content unit |
| Filter chips across top | Sport category chips (Cầu lông, Bóng đá, Gym, Bơi lội…) |
| Dark sidebar + light card grid | Dark shell + card grid with photo-first thumbnails |
| Minimal color → only accent for CTAs | Minimal color → accent only on "Book Now" and active states |
| Search is always visible, always prominent | Search is pinned, never hidden |
| Tag system (iOS, Android, Web) | Tag system (Indoor, Outdoor, Covered, Lighting, Parking) |

---

## 3. TOKEN SYSTEM

### 3.1 Color Palette

```
--color-bg-base:       #0F0F10   /* True dark shell — deeper than Mobbin's #111 */
--color-bg-surface:    #1A1A1C   /* Card backgrounds, sidebar panels */
--color-bg-elevated:   #242427   /* Hover states, dropdowns, modals */
--color-bg-subtle:     #2E2E32   /* Input fields, chip backgrounds */

--color-border-default: #2E2E32  /* Subtle structural dividers */
--color-border-strong:  #48484F  /* Active borders, focus rings */

--color-text-primary:   #F2F2F3  /* Headlines, card titles */
--color-text-secondary: #9898A3  /* Labels, metadata, timestamps */
--color-text-disabled:  #56565F  /* Placeholder text */

--color-accent-primary: #4ADE80  /* Electric Green — CTA buttons, active filters, booking confirm */
--color-accent-hover:   #22C55E  /* Hover/pressed state for accent */
--color-accent-muted:   #14532D30 /* Accent tint for backgrounds — subtle availability indicator */

--color-semantic-warning: #FBBF24 /* Peak hours badge */
--color-semantic-error:   #F87171 /* Fully booked state */
--color-semantic-info:    #60A5FA /* New venue badge */
```

**Why Electric Green?**
- Mobbin uses a near-white accent on dark — works for a neutral tool
- SportZone needs energy and action → Green signals "go", availability, health/fitness
- Not the overused neon lime — this is a calmer, more refined `#4ADE80`

---

### 3.2 Typography

```
Display face:  "Geist" (Vercel's typeface — geometric, technical, modern, free via Google Fonts CDN)
               → Used for hero headline, venue names, section titles
               → Weight range: 400 / 600 / 800

Body face:     "Inter" (Figma's typeface — hyper-legible at small sizes, pairs perfectly with geometric display)
               → Used for all UI text, labels, descriptions, metadata
               → Weight range: 400 / 500

Mono face:     "Geist Mono"
               → Used sparingly: prices, time slots, coordinates
               → Gives a "data readout" feeling to numbers
```

**Type scale:**

```
--text-4xl:  3rem / 800 weight    → Hero headline only
--text-3xl:  2rem / 700 weight    → Section headers
--text-2xl:  1.5rem / 600 weight  → Card venue names (large)
--text-xl:   1.25rem / 600 weight → Modal titles, panel headers
--text-lg:   1.125rem / 500 weight→ Primary body, selected states
--text-base: 1rem / 400 weight    → Default body, descriptions
--text-sm:   0.875rem / 400 weight→ Metadata, timestamps, tags
--text-xs:   0.75rem / 500 weight → Chip labels, badges — slightly weighted for legibility
```

---

### 3.3 Spacing System (8-point grid)

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
```

---

### 3.4 Border Radius

```
--radius-sm:  6px   → Chips, badges, input fields
--radius-md:  10px  → Cards, buttons
--radius-lg:  14px  → Modal panels, sidebars
--radius-xl:  20px  → Full-bleed hero cards, featured venue
--radius-full: 9999px → Pill buttons, avatar, round icons
```

---

### 3.5 Shadows & Elevation

```css
/* Card resting */
--shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);

/* Card hover — lifts slightly */
--shadow-card-hover: 0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);

/* Modal */
--shadow-modal: 0 24px 64px rgba(0,0,0,0.7);

/* Accent glow — use ONLY on "Book Now" CTA */
--shadow-accent-glow: 0 0 20px rgba(74, 222, 128, 0.25);
```

---

## 4. LAYOUT ARCHITECTURE

### 4.1 Page Shell

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR (64px fixed)                                            │
│  Logo left │ Search center (prominent, 480px min) │ Auth right  │
├──────────┬──────────────────────────────────────────────────────┤
│          │  FILTER BAR (48px sticky below navbar)               │
│ SIDEBAR  │  [Tất cả] [Cầu lông] [Bóng đá] [Gym] [Bơi] [Tennis]│
│ (240px)  ├──────────────────────────────────────────────────────┤
│          │                                                       │
│ Filters  │  VENUE GRID                                          │
│ by:      │  Auto-fill grid, 280px min card width                │
│ - Quận   │  Fills available width responsively                  │
│ - Price  │                                                       │
│ - Rating │  [Card] [Card] [Card] [Card]                         │
│ - Time   │  [Card] [Card] [Card] [Card]                         │
│ - Indoor │  [Card] [Card] [Card] ...                            │
│ - Sport  │                                                       │
│          │  (Infinite scroll or paginated — recommend paginated) │
└──────────┴──────────────────────────────────────────────────────┘
```

**Responsive breakpoints:**
- `< 768px` — Sidebar collapses to bottom sheet modal; grid → single column
- `768–1024px` — Sidebar hidden by default, toggle icon shows it; grid → 2 cols
- `1024–1440px` — Sidebar visible (200px); grid → 3 cols
- `> 1440px` — Sidebar visible (240px); grid → 4 cols

---

### 4.2 Venue Card — The Primary Content Unit

```
┌──────────────────────────────┐
│                              │  ← Venue photo, 16:9 ratio
│    [photo]              ★    │     Star icon top-right (saves)
│                              │
│  [Indoor] [Lighting]         │  ← Tag chips, overlap photo bottom
├──────────────────────────────┤
│  Sân Cầu Lông Victory        │  ← Venue name, text-lg / 600
│  Cầu Giấy · Hà Nội           │  ← Location, text-sm secondary
│                              │
│  ⭐ 4.8  (124 đánh giá)       │  ← Rating + review count
│  Từ 80.000₫ / giờ            │  ← Price, Geist Mono, accent color
│                              │
│  ● Còn 3 sân trống hôm nay   │  ← Availability dot (green/red/yellow)
└──────────────────────────────┘
```

**Card states:**
- **Default** → bg-surface, subtle border
- **Hover** → bg-elevated, shadow-card-hover, slight translateY(-2px) on photo, border-strong
- **Saved** → star icon fills accent green
- **Fully booked** → photo has a 40% dark overlay, red "Hết sân" badge top-left
- **Featured** → thin accent-primary border, "Nổi bật" badge

---

### 4.3 Search Experience

Mobbin's search is **instant and visual** — results appear as thumbnails, not a list of text links. Replicate this:

```
┌────────────────────────────────────────────────────────┐
│  🔍  Tìm sân, môn thể thao, khu vực...          ⌘K   │
└────────────────────────────────────────────────────────┘
         ↓ on focus
┌────────────────────────────────────────────────────────┐
│  Gần đây                                               │
│  [thumb] Sân cầu lông Victory · Cầu Giấy              │
│  [thumb] Sân bóng Mỹ Đình Arena · Nam Từ Liêm          │
│                                                        │
│  Tìm kiếm phổ biến                                     │
│  🏸 Cầu lông Hoàn Kiếm    ⚽ Bóng đá Tây Hồ          │
│  🏊 Bể bơi Đống Đa         🎾 Tennis Cầu Giấy         │
└────────────────────────────────────────────────────────┘
```

- Keyboard shortcut `⌘K` / `Ctrl+K` → opens search modal (Mobbin pattern)
- Search modal = full dark overlay, search prominent, results below
- Results show photo thumbnails + venue name + distance — never text-only lists

---

### 4.4 Venue Detail Page

When a card is clicked → **slide-in right panel** (like Mobbin's app detail panel) OR navigate to full page. Recommended: slide panel for desktop, full page for mobile.

```
┌──────────────────────────────┬────────────────────────────────────┐
│                              │  Sân Cầu Lông Victory              │
│   PHOTO GALLERY              │  Cầu Giấy · Hà Nội · 1.2km        │
│   (swipeable, full width     │  ⭐ 4.8 · 124 đánh giá            │
│    of panel)                 │  ─────────────────────────────────  │
│                              │  CHỌN NGÀY                         │
│                              │  [Mon] [Tue] [Wed] [Thu] [Fri]     │
│                              │                                    │
│                              │  CHỌN GIỜ  (time slots grid)      │
│                              │  [7:00] [8:00] [9:00✓] [10:00]    │
│                              │  [11:00] [12:00●] [13:00] ...      │
│                              │  ✓ = available  ● = booked         │
│                              │                                    │
│                              │  CHỌN SÂN                         │
│                              │  ◉ Sân 1   ○ Sân 2   ○ Sân 3     │
│                              │  ─────────────────────────────────  │
│                              │  Tổng cộng:  120.000₫              │
│                              │                                    │
│                              │  [    ĐẶT SÂN NGAY    ]  ← CTA   │
└──────────────────────────────┴────────────────────────────────────┘
```

---

## 5. COMPONENT LIBRARY

### 5.1 Buttons

```css
/* Primary CTA — "Đặt sân ngay" */
.btn-primary {
  background: var(--color-accent-primary);
  color: #0F0F10;                          /* Dark text on green */
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  box-shadow: var(--shadow-accent-glow);
  transition: all 150ms ease;
}
.btn-primary:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 0 28px rgba(74, 222, 128, 0.35);
}

/* Secondary — outline style */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  padding: 11px 24px;
}
.btn-secondary:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-text-secondary);
}

/* Ghost — for icon buttons, saves, etc. */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  padding: 8px;
}
.btn-ghost:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}
```

---

### 5.2 Filter Chips (Category bar)

```css
.chip {
  background: var(--color-bg-subtle);
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
  transition: all 120ms ease;
}
.chip:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}
.chip.active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}
```

---

### 5.3 Time Slot Grid

```css
.time-slot {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-family: 'Geist Mono', monospace;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 100ms ease;
}
.time-slot:hover { border-color: var(--color-accent-primary); color: var(--color-text-primary); }
.time-slot.selected { background: var(--color-accent-muted); border-color: var(--color-accent-primary); color: var(--color-accent-primary); }
.time-slot.booked { opacity: 0.3; cursor: not-allowed; text-decoration: line-through; }
.time-slot.peak { border-color: var(--color-semantic-warning); }
```

---

### 5.4 Availability Badge

```
● Còn 3 sân          → green dot + text-sm secondary
● Còn 1 sân          → yellow dot (warning)
● Hết sân hôm nay    → red dot (error)
● Mở lại lúc 15:00   → info text, no dot
```

---

### 5.5 Navbar

```
[Logo]          [🔍 Search bar — min 400px, grows]          [Đặt sân | Ảnh Avatar ▾]
```

- Background: `#0F0F10` + `border-bottom: 1px solid var(--color-border-default)`
- Sticky, `backdrop-filter: blur(12px)` when scrolled
- Search bar in navbar: pill shape, `--color-bg-subtle` background
- Auth logged in: avatar + dropdown (Đặt sân của tôi / Cài đặt / Đăng xuất)

---

### 5.6 Empty States

```
[Icon: subtle outline, 48px]
Không tìm thấy sân nào
Thử thay đổi bộ lọc hoặc tìm kiếm khu vực khác.
[Xóa bộ lọc]
```

Design: center-aligned, icon muted color, no illustrations (too heavy)

---

### 5.7 Skeleton Loading

- Cards load with skeleton shimmer (dark → slightly lighter pulse)
- Photo area: shimmer block
- Text lines: 2 shimmer lines at different widths
- Never use spinners for card grids — always skeleton

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--color-bg-elevated) 0%,
    var(--color-bg-subtle) 50%,
    var(--color-bg-elevated) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: var(--radius-sm);
}
```

---

## 6. SIGNATURE ELEMENT

**The Time Slot Heatmap View**

SportZone's single memorable element: on the venue detail panel, instead of just a list of slots, the daily schedule is rendered as a **visual heatmap strip** — a horizontal timeline from 6:00 to 22:00 where:

- Available = `--color-bg-subtle` segments
- Booked = `--color-bg-elevated` dark segments (slightly blocked)
- Your selected = `--color-accent-primary` green glow segment
- Peak hours (17:00–20:00) = subtle warm tint behind the strip

This is visible at a glance — the user immediately understands when the facility is busy, like a GitHub contribution graph but for sports courts. No other local competitor does this.

```
6:00  8:00  10:00 12:00 14:00 16:00 18:00 20:00 22:00
 ▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▒▒▒▒▒▒░░░░░░████░░░░░░▒▒▒▒▒▒
  booked          avail     selected peak         close

Legend: ▓ booked  ▒ available  █ selected  ░ peak hours
```

---

## 7. INTERACTION & MOTION

Keep motion **functional, not decorative**. Mobbin uses almost no ambient animation — every motion serves navigation.

```
Card hover:        translateY(-2px) on photo — 150ms ease-out
Filter chip click: background swap + scale(0.97) pulse — 100ms
Slide panel open:  translateX(100% → 0) + opacity 0→1 — 250ms cubic-bezier(0.25, 0, 0, 1)
Search expand:     height: 0 → auto — 200ms ease
Slot select:       background fill from center — 120ms
Booking confirm:   green checkmark scale(0→1) with slight bounce — 400ms spring
Page transitions:  opacity only, no slide — 200ms (Mobbin does this)
```

**Respect `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. IMAGERY GUIDELINES

- All venue photos: **16:9 ratio**, minimum 600×338px display
- Photo tone: cool, slightly desaturated — don't clash with the dark UI
- Overlay: always a gradient `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)` on cards — ensures text legibility
- No stock photography clichés (single person mid-air dunking). Use real venue photos
- Icons: **Lucide Icons** (consistent with React ecosystem, stroke-based, clean)
- Sport icons in category chips: use simple emoji OR Lucide equivalents — not custom illustrated icons

---

## 9. ACCESSIBILITY

- Color contrast: all text passes WCAG AA (minimum 4.5:1 for body, 3:1 for large text)
- Focus rings: `outline: 2px solid var(--color-accent-primary); outline-offset: 2px;` — never remove, only replace
- Card photos: `alt="Sân [sport] [venue name] tại [location]"`
- Time slots: `aria-label="7 giờ sáng, còn trống"` for screen readers
- Booking form: all inputs labeled, error messages tied with `aria-describedby`
- Keyboard navigation: Tab through cards → Enter opens detail → Escape closes panel

---

## 10. WHAT NOT TO DO

> These are anti-patterns — don't include them even if they seem safe.

❌ **White or light background** — This is a dark-mode-first product. Light mode feels wrong.
❌ **Colorful category cards** (each sport a different color) — Mobbin never does this; it fragments visual hierarchy
❌ **Hero banner with tagline** — Venues ARE the hero. Don't add a marketing header before the grid.
❌ **Star ratings as colored bars** — Use star icons + number. Bars take too much space.
❌ **Dropdown menus for filters** — Use chips/tags, always visible. Dropdowns hide options and add friction.
❌ **Loading spinner over whole page** — Skeleton cards only. Spinners block content.
❌ **Price with .000 suffix** — Format: `80K₫ / giờ` not `80,000 VNĐ/giờ` — cleaner, faster to scan.
❌ **Gradient backgrounds on cards** — Reserve gradients for photo overlays only.
❌ **Rounded avatars everywhere** — Only user avatar is round. Everything else uses --radius-md.

---

## 11. RESPONSIVE BEHAVIOR SUMMARY

| Element | Mobile (< 768px) | Tablet (768–1024px) | Desktop (> 1024px) |
|---|---|---|---|
| Sidebar | Bottom sheet | Collapsible toggle | Always visible |
| Card grid | 1 column | 2 columns | 3–4 columns |
| Search | Full width, top | Full width, navbar | 480px pill, navbar |
| Category chips | Horizontal scroll | Horizontal scroll | Wrap allowed |
| Detail view | Full page | Full page | Slide panel (40vw) |
| Navbar | Logo + Search + Hamburger | Logo + Search + Auth | Full navbar |

---

## 12. IMPLEMENTATION NOTES FOR DEVELOPERS

- Use **CSS custom properties** for all tokens — enables easy theme updates
- Grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));`
- Font loading: Preload Geist + Inter via `<link rel="preload">` — avoid FOUT
- Images: Use `loading="lazy"` for all card photos below the fold
- `scroll-behavior: smooth` on `html` element
- Search modal: use `<dialog>` element for native accessibility
- Time slot heatmap: render as `<div>` with CSS flex — not `<canvas>` for accessibility

---

*Document version: 1.0 — SportZone Booking Platform*
*Inspired by: Mobbin.com design language*
*Stack context: React 19 + TypeScript + Vite / Spring Boot REST API backend*