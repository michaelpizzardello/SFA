> **SUPERSEDED by /DESIGN_SPEC.md (2026-07-07) — kept as history.**
> This file is no longer design/IA authority; where it conflicts with DESIGN_SPEC.md, DESIGN_SPEC.md wins.

# Sydney Art Finder - UX Research Implementation Brief (Mandatory)

Audience: implementation agent.
Objective: fix core usability issues (especially header and layout density) using proven patterns.

This is not optional guidance. Treat this as a build specification.

## 1) Why the current UI fails
The current experience has these high-severity issues:
- Header consumes too much vertical space on mobile and competes with content.
- Navigation does not follow predictable mobile app patterns.
- Controls and content are mixed too densely in key screens.
- Visual hierarchy is weak: users cannot scan the screen in a few seconds.

## 2) Research-backed principles to apply
Use these as implementation constraints, not inspiration.

1. Top app bars exist to expose location and key actions, not to carry dense UI.
Source: Android app bars guidance.
Requirement: keep top bar compact and task-focused.

2. Touch targets must be reliably tappable.
Source: WCAG 2.2 Target Size (Minimum), Android accessibility, Apple accessibility guidance.
Requirement: all tappable controls >= 44px preferred (minimum 24px WCAG with spacing; do not design to minimum).

3. Filtered lists need visible applied-filter context.
Source: Baymard applied filters research.
Requirement: always show active filters near results.

4. Horizontal filter rails degrade with too many filter types.
Source: Baymard horizontal filter toolbar research.
Requirement: keep top filter rail limited; move advanced filters behind a sheet/drawer.

5. Art-platform reference pattern (Ocula/Artsy) is content-first with clear filtering and scannable lists.
Sources: Ocula exhibitions and home pages; Artsy galleries page.
Requirement: one clear content column, concise metadata, lightweight filter controls.

## 3) Header specification (fix this first)

### Mobile header (required)
- Height: 56px content area (max 64px including safe area adjustments).
- Structure:
  - Left: brand wordmark only (single line, no tagline).
  - Right: one optional utility action (e.g. search icon) only.
- No wrapped nav links in the top bar.
- No multi-row desktop nav in mobile header.
- No heavy borders, pills, or decorative styling.

### Mobile primary navigation (required)
- Use a bottom tab bar for top-level routes:
  - Home
  - What's On
  - Galleries
  - Map
- Tab bar rules:
  - fixed to viewport bottom
  - icon + label optional, label required if no icon
  - each tab target >= 44px height
  - active state obvious but minimal
- Keep top header and bottom tabs visually simple and consistent.
- Exception for `/map`: hide bottom tab bar and switch to full-screen map mode with compact top controls.

### Desktop header (required)
- Single row preferred.
- Left: brand.
- Right: primary nav links in one line.
- No wrapping nav to second row.
- Tagline should not live inside sticky header; place in page hero only.

### Scroll behavior
- Header should be pinned and compact.
- No large expansion/collapse choreography.
- Avoid stealing viewport height during scroll.

## 4) Layout system specification

### Global layout
- Mobile-first single-column flow.
- Max page width desktop: 1080-1200px.
- Section spacing must follow 8px rhythm.
- Use whitespace for separation; avoid nested boxes.

### Above-the-fold rules (mobile)
- First viewport must show:
  - page title
  - one primary action OR compact filter row
  - start of actual content list
- Hard cap: no more than 3 control groups before first result item.

### Content rails
- Home: orientation and route selection only.
- What's On: filter + results list.
- Galleries: filter + directory rows.
- Map: map-first with synced list.
- Gallery profile: details first, then grouped exhibitions.
- Exhibition profile: focused what/where/when detail for one exhibition.

## 5) Screen-by-screen execution detail

### Home (`/`)
- Keep minimal:
  - title/value proposition
  - 2 CTAs (What's On, Galleries)
  - optional short highlights only
- Remove heavy stats/control clutter above fold.

### What's On (`/whats-on`)
- Top controls:
  - search
  - status quick-filter
  - precinct
- Advanced options (opening window, gallery selection) move to expandable bottom sheet/panel.
- Show applied filters summary above results.
- Result row template:
  - title
  - artist
  - gallery | precinct
  - date range
  - opening meta
  - primary link to exhibition detail page
  - optional secondary link to gallery profile

### Galleries (`/galleries`)
- Keep controls compact: search + precinct + sort.
- Use simple directory rows (not card stacks).
- Show result count and applied filter state.
- “Open Map” is secondary text link/button.

### Map (`/map`)
- Map runs in full-screen mode on mobile.
- Persistent compact top overlay must include:
  - back icon button (left, chevron style)
  - search field (center)
  - `Filters` trigger (right)
- Use `Search this area` flow after pan/zoom.
- Keep map filters inside dismissible filter panel/sheet (not always-expanded inline controls).
- List/map must be synchronized.
- Results list must be a draggable bottom sheet with detents:
  - collapsed: shows count (`N galleries in this area`)
  - half: list scroll while map remains visible in upper half
  - full: list-focused state
- Preserve map state on back navigation.
- Back control styling rule: in compact headers/top bars, use icon-first back affordance (chevron), with `aria-label="Back"` and optional visually-hidden text.

### Gallery Profile (`/gallery/[slug]`)
- Above fold:
  - name
  - precinct
  - address + practical contact CTA
- Then grouped exhibitions: current, upcoming, past.
- No global filter modules in profile page body.

### Exhibition Profile (`/exhibition/[slug]`)
- Above fold:
  - exhibition title + artist
  - status + date range
  - opening date/time (if available)
  - gallery link/CTA
- Keep this page focused on one exhibition, with extended detail below fold.
- Do not dump full global filter UI on this route.

## 6) Visual styling rules (strict)
- Background: flat neutral (`#f7f7f5` family), no glow overlays.
- Borders: max one border level per section.
- Radius: restrained (8-12px), no excessive pill usage.
- Shadow: none or ultra-subtle only.
- Accent color: one.
- Typography: stable hierarchy and readable line lengths.

## 7) Usability acceptance gates (must pass)
A route fails if any of these are true:
1. Header + nav consume excessive mobile height (more than ~20% viewport before content).
2. First result item is not visible without significant scrolling.
3. Navigation labels wrap or overflow.
4. More than 3 control clusters appear before first result.
5. Tap targets are below 44px.
6. Active filters are hidden from user.
7. Back navigation loses filter/map state unexpectedly.
8. Exhibition list rows have no dedicated detail page path.
9. Map route does not provide full-screen mode with top compact overlay + draggable bottom sheet behavior.

## 8) Required implementation order
1. Rebuild header/nav structure (mobile + desktop).
2. Normalize global spacing and remove decorative clutter.
3. Refactor each route to single-job layout pattern.
4. Rework filter model (compact defaults + advanced collapsed).
5. Final map UX pass (search-this-area, sync, persistence).
6. Accessibility and touch-target audit.

## 9) Handoff format required from implementation agent
For every UI PR/update, include:
1. Routes changed.
2. Which acceptance gates now pass.
3. Before/after screenshots at 390px and 1280px.
4. Remaining known UX debt.

## 10) Source links used for this brief
- Android app bars guidance: https://developer.android.com/develop/ui/compose/components/app-bars
- WCAG 2.2 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- Android accessibility touch targets: https://developer.android.com/training/accessibility/accessible-app.html
- Apple accessibility (target sizing and spacing): https://developer.apple.com/design/human-interface-guidelines/accessibility
- Baymard applied filters overview: https://baymard.com/blog/how-to-design-applied-filters
- Baymard horizontal filter caution: https://baymard.com/blog/horizontal-filtering-sorting-design
- Ocula home: https://ocula.com/
- Ocula exhibitions: https://ocula.com/art-exhibitions/
- Artsy galleries: https://www.artsy.net/galleries
