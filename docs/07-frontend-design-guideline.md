# Sport Booking WebApp - Frontend Design Guideline

## 1. Document Purpose

This document defines the visual direction and frontend UI style for Sport Booking WebApp.

It should be used when building public browsing pages, booking flows, vendor tools, and admin screens so the product feels consistent across the MVP.

## 2. Design Direction

The frontend should feel:

- modern and visual,
- simple to scan,
- sport-oriented without looking childish,
- practical for browsing courts, venues, prices, images, and booking slots,
- clean enough for repeated use by users, vendors, and admins.

The product should not look like a corporate dashboard. The visual identity should be clean, booking-friendly, and energetic enough for a multi-sport platform while staying close to Hero UI's default visual system.

Recommended direction:

```text
SportZone HeroUI Default
```

This means:

- use real venue and court images as the main visual signal,
- use Hero UI default background, surface, border, accent, and semantic tokens,
- use Hero UI default primary/accent color for main actions,
- keep page-level colors minimal and only override them when matching a specific Figma screen,
- avoid introducing a separate custom brand palette,
- avoid creating a custom light/dark theme system in the current phase,
- keep information dense enough for comparison,
- avoid decorative blobs, heavy gradients, and oversized marketing sections.

## 3. Color System

The frontend should use Hero UI's default theme in the current phase.

- Do not add a light/dark theme toggle yet.
- Do not store theme preferences in browser local storage yet.
- Do not override Hero UI's default accent color with a custom brand palette.
- Use Hero UI semantic tokens such as `background`, `foreground`, `surface`, `border`, `default`, `accent`, `success`, `warning`, and `danger`.
- Page-level hard-coded colors are allowed only when translating a specific Figma screen and should stay local to that screen.

### Primary Palette

Use Hero UI's default tokens as the product baseline:

| Token | Purpose | Suggested color |
| --- | --- | --- |
| Background | Main app background | Hero UI `background` |
| Surface | Cards and primary panels | Hero UI `surface` |
| Surface Secondary | Filter bars, muted blocks, skeletons | Hero UI `surface-secondary` |
| Border | Borders, inputs, separators | Hero UI `border` / `separator` |
| Accent | Primary buttons and active navigation | Hero UI `accent` |
| Default | Secondary controls and neutral UI | Hero UI `default` |
| Muted | Secondary text and metadata | Hero UI `muted` |
| Success | Positive semantic states only | Hero UI `success` |
| Warning | Price emphasis, pending states, booking notes | Hero UI `warning` |
| Danger | Destructive actions and error states | Hero UI `danger` |

### Usage Rules

- Primary actions should use Hero UI `Button` with `variant="primary"` unless the Figma screen specifies otherwise.
- Hover states and selected filters should use Hero UI component variants first.
- Price emphasis and pending states can use `warning`.
- Do not introduce a separate custom brand color in new code.
- Avoid a one-color UI made from one hue only. Use Hero UI surfaces, borders, default controls, and semantic colors to keep the interface balanced.
- Text must remain high contrast on all backgrounds.

## 4. Layout Principles

Public browsing pages should prioritize the content users compare:

- court image,
- sport,
- venue,
- address,
- price,
- status,
- primary action.

Recommended layout:

- Use a top search/filter band for public list pages.
- Use card grids for venue and court browsing.
- Use compact but image-forward cards.
- Use list/detail pages as actual app screens, not marketing landing pages.
- Use consistent spacing based on 4px steps: 16px mobile, 24px desktop, 32px for major section gaps.
- Use softer rounded UI: 10px controls, 14px cards, 20px panels, and full pill badges/buttons when appropriate.
- Avoid cards inside cards.
- Avoid large empty hero blocks unless they directly support discovery.

## 5. Visual Asset Rules

Sport Booking is a visual product. Public pages should use images whenever available.

Rules:

- Court and venue cards should show `primaryImageUrl`.
- Detail pages should show the primary image first, then gallery images when available.
- Avoid dark, blurred, or overly cropped images when users need to inspect the court.
- Empty image states should still feel polished, using a clean sport-court placeholder style.
- Do not rely only on text lists for public browsing.

## 6. Typography

Use Google Sans as the default app font for a clean booking interface and readable numeric UI.

- Display font: `Google Sans`, then `GoogleSans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`.
- Body font: `Google Sans`, then `GoogleSans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`.

Guidelines:

- Page titles: strong but not oversized.
- Card titles: compact, readable, and limited to 1-2 lines.
- Prices: visually clear, but not loud.
- Supporting text: muted, short, and scannable.
- Keep letter spacing at normal browser spacing unless a specific component requires uppercase metadata.
- Do not scale normal UI text directly with viewport width.

## 7. Components

### UI Library Direction

The frontend should use Hero UI as the main component library.

Use Hero UI components first for common interface needs:

- Button,
- Input,
- Textarea,
- Select,
- Checkbox,
- Radio,
- Tabs,
- Modal,
- Drawer,
- Card,
- Table,
- Pagination,
- Tooltip,
- Spinner,
- Skeleton,
- Badge or Chip-style status display.

Use `@gravity-ui/icons` as the standard icon package for the frontend.

Icon usage rules:

- Use `@gravity-ui/icons` for navigation items, action buttons, status indicators, form affordances, and empty states.
- Icon-only buttons must have accessible labels.
- Keep icon size consistent within the same toolbar, table row, card, or navigation area.
- Do not mix multiple icon libraries in new frontend code unless there is a clear compatibility reason.
- Do not build custom SVG icons for standard actions when `@gravity-ui/icons` already provides a recognizable icon.

### Buttons

- Primary buttons should use Hero UI's default primary/accent styling.
- Booking or high-intent CTA should usually use Hero UI `Button` with `variant="primary"`. Use `warning` only for price or pending-state emphasis.
- Secondary actions should be outline or ghost buttons.
- Icon buttons should use recognizable icons from `@gravity-ui/icons` when available.

### Cards

Cards are appropriate for repeated items such as courts, venues, bookings, and dashboard metrics.

Court and venue cards should include:

- image,
- name,
- sport or venue context,
- address or location,
- price when relevant,
- status badge,
- clear action.

### Badges

Use badges for:

- sport names,
- status,
- availability,
- payment status,
- booking status.

Do not rely only on badge color; include text.

### Filters

Public list filters should be easy to scan:

- search input for keyword,
- sport filter,
- venue filter,
- clear/reset action,
- compact pagination.

Public filters should not expose admin-only statuses such as inactive records.

## 8. Page Guidelines

### Home / Discovery

The home page should immediately help users discover courts.

It should include:

- search or quick filter entry,
- featured sports,
- popular or available courts,
- venue highlights.

It should not be only a marketing page or technical foundation page.

### Sports Page

Sports should be shown as quick discovery options.

Each sport item should be compact and lead users toward related courts.

### Venues Page

Venue list should emphasize:

- venue image,
- name,
- address,
- opening hours,
- active status,
- primary action to view details.

Venue detail should include:

- large primary image,
- venue information,
- gallery entry,
- courts under this venue when available.

### Courts Page

Court list should emphasize:

- court image,
- sport,
- venue,
- price per hour,
- status,
- action to view details or start booking.

Court detail should include:

- primary image and gallery,
- sport and venue context,
- price,
- description,
- available slot entry when that API is ready.

## 9. Responsive Behavior

The public browsing experience must work well on mobile and desktop.

Guidelines:

- Mobile list pages use a single-column card layout.
- Tablet can use two columns.
- Desktop can use two or three columns depending on card density.
- Filters should stack on mobile and align horizontally on desktop.
- Buttons and text must not overflow their containers.
- Images should use stable aspect ratios to prevent layout shift.

## 10. Target Frontend Alignment

The frontend should be rebuilt around:

- React,
- Tailwind CSS,
- Hero UI,
- `@gravity-ui/icons`,
- Hero UI default theme tokens,
- environment-driven API configuration.

When the frontend is initialized again, configure Hero UI and Tailwind together so Hero UI components use the default Hero UI visual direction. Avoid adding a custom brand palette or a light/dark theme toggle during this phase.

Recommended first implementation step:

1. Initialize the React + Vite frontend and install Hero UI with `@gravity-ui/icons`.
2. Replace the Sprint 0 technical home screen with a discovery-focused home page.
3. Build sports, venues, and courts pages using real API data.
4. Reuse shared list/card/filter patterns.
