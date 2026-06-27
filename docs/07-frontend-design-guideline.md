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

The product should not look like a corporate dashboard. The visual identity should support an equal-quality light and dark theme, stay high contrast and booking-friendly, and feel energetic enough for a multi-sport platform.

Recommended direction:

```text
SportZone Light/Dark + Sport Blue
```

This means:

- use real venue and court images as the main visual signal,
- use a clean white base in light theme and a near-black base in dark theme,
- use layered neutral surfaces for cards, filters, and page sections,
- use Sport Blue as the primary action and brand color,
- use Soft Blue only for hover, selected, and high-intent moments,
- use off-white text for strong readability,
- reserve green, yellow, and red for semantic status feedback,
- keep information dense enough for comparison,
- avoid decorative blobs, heavy gradients, and oversized marketing sections.

## 3. Color System

The frontend must support both light and dark themes from the beginning.

- Store the selected theme in browser local storage.
- Apply the theme at the root HTML level so all pages inherit the same CSS variables.
- New pages and components must use theme tokens such as `background`, `foreground`, `card`, `secondary`, `muted`, `border`, `primary`, and `accent` instead of hard-coded light or dark colors.

### Primary Palette

Use these colors as the product baseline:

| Token | Purpose | Suggested color |
| --- | --- | --- |
| Light Base | Main background in light theme | `#FFFFFF` |
| Light Surface | Cards and muted sections in light theme | `#F7F7F8` |
| Deep Base | Main background in dark theme | `#0A0A0A` |
| Dark Surface | Cards and primary panels in dark theme | `#141414` |
| Dark Elevated | Hover surfaces and elevated controls | `#1E1E1E` |
| Line Neutral | Borders, inputs, separators | `#E5E7EB` / `#2A2A2A` |
| Sport Blue | Primary buttons, active navigation, main brand color | `#2563EB` |
| Hover Blue | Primary hover color | `#1D4ED8` |
| Soft Blue | Selected filters and subtle highlights | `#DBEAFE` / `#172554` |
| Warm Text | Main text, headings, strong UI anchors | `#F0F0F0` |
| Muted Text | Secondary text, metadata, placeholders | `#A0A0A0` |
| Disabled Text | Disabled or low-priority helper text | `#555555` |
| Success | Positive semantic states only | `#1D9E75` |
| Warning | Price emphasis, pending states, booking notes | `#EF9F27` |
| Info | Informational status only | `#378ADD` |
| Danger | Destructive actions and error states | `#E24B4A` |

### Usage Rules

- Primary actions should use Sport Blue.
- Hover states, selected filters, and small high-intent emphasis should use Soft Blue.
- Price emphasis and pending states use Warning when they need semantic emphasis.
- Info is allowed only for semantic informational states. It should not become the brand color.
- Do not use green as a core brand, navigation, CTA, or page background color.
- Avoid large saturated blue backgrounds; blue should guide actions and selection, not overpower content.
- Avoid a one-color UI. Use white/black neutral layers, clear borders, readable text, and restrained semantic colors to keep the interface balanced.
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

Use an Apple-style system font stack for a cleaner booking interface and better numeric readability.

- Display font: `SF Pro Display`, then `SF Pro Text`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`.
- Body font: `SF Pro Text`, then `SF Pro Display`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`.

Guidelines:

- Page titles: strong but not oversized.
- Card titles: compact, readable, and limited to 1-2 lines.
- Prices: visually clear, but not loud.
- Supporting text: muted, short, and scannable.
- Keep letter spacing at normal browser spacing unless a specific component requires uppercase metadata.
- Do not scale normal UI text directly with viewport width.

## 7. Components

### Buttons

- Primary buttons: Sport Blue background.
- Booking or high-intent CTA should use Sport Blue. Use Warning only for price or pending-state emphasis.
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
