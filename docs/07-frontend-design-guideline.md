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

The product should not look like a corporate dashboard. The visual identity should be dark-first, high contrast, booking-friendly, and energetic enough for a multi-sport platform.

Recommended direction:

```text
Dark + Electric Orange
```

This means:

- use real venue and court images as the main visual signal,
- use a near-black base for fast scanning and a stronger sport-booking mood,
- use dark neutral surfaces for cards, filters, and page sections,
- use electric orange as the primary action and brand color,
- use softer orange accent only for hover, selected, and high-intent moments,
- use off-white text for strong readability,
- avoid green as a brand or interface color,
- avoid blue as the main identity,
- keep information dense enough for comparison,
- avoid decorative blobs, heavy gradients, and oversized marketing sections.

## 3. Color System

### Primary Palette

Use these colors as the product baseline:

| Token | Purpose | Suggested color |
| --- | --- | --- |
| Deep Base | Main app background and default page base | `#0F0F0F` |
| Dark Surface | Cards, filter bands, secondary sections, muted blocks | `#1A1A1A` |
| Electric Orange | Primary buttons, active navigation, main brand color | `#FF5722` |
| Soft Orange | Hover states, selected filters, small high-intent highlights | `#FF865C` |
| Warm Text | Main text, headings, strong UI anchors | `#F5F5F0` |
| Muted Text | Secondary text, metadata, placeholders | `#AAA8A2` |
| Line Charcoal | Borders, inputs, separators | `#383838` |
| Warning Amber | Price emphasis, pending states, booking notes | `#F59E0B` |
| Info Cyan | Available or informational status only | `#0E7490` |
| Danger Red | Destructive actions and error states | `#B91C1C` |

### Usage Rules

- Primary actions should use Electric Orange.
- Hover states, selected filters, and small high-intent emphasis should use Soft Orange.
- Price emphasis and pending states can use Warning Amber only when orange would not be clear enough.
- Info Cyan is allowed only for semantic states such as available, paid, or informational. It should not become the brand color.
- Do not use green as a core brand, navigation, CTA, or page background color.
- Avoid large blue surfaces as the main identity.
- Avoid a one-color UI made only from orange shades. Use Deep Base, Dark Surface, Line Charcoal, Warm Text, and restrained semantic colors to keep the interface balanced.
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
- Use consistent spacing: 16px mobile, 24px desktop, 32px for major section gaps.
- Keep card radius at 8px or less.
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

Use a clean sans-serif style. The current frontend uses Inter and should continue using it.

Guidelines:

- Page titles: strong but not oversized.
- Card titles: compact, readable, and limited to 1-2 lines.
- Prices: visually clear, but not loud.
- Supporting text: muted, short, and scannable.
- Avoid negative letter spacing.
- Do not scale font size directly with viewport width.

## 7. Components

### Buttons

- Primary buttons: Electric Orange background.
- Booking or high-intent CTA should usually use Electric Orange. Use Warning Amber only for price or pending-state emphasis.
- Secondary actions should be outline or ghost buttons.
- Icon buttons should use recognizable icons when available.

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

## 10. Current Frontend Alignment

The current frontend already uses:

- React,
- Tailwind CSS,
- shadcn-style component primitives,
- CSS variables for theme colors.

Future frontend tasks should update the theme tokens in `frontend/src/styles/index.css` to match this guideline before building public browsing pages.

Recommended first implementation step:

1. Update theme color variables.
2. Replace the Sprint 0 technical home screen with a discovery-focused home page.
3. Build sports, venues, and courts pages using real API data.
4. Reuse shared list/card/filter patterns.
