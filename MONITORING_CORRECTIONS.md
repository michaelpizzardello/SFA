> **SUPERSEDED by /DESIGN_SPEC.md (2026-07-07) — kept as history.**
> This file is no longer design/IA authority; where it conflicts with DESIGN_SPEC.md, DESIGN_SPEC.md wins.

# Sydney Art Finder - Monitoring Corrections (2026-02-13)

These notes were produced from live monitoring of current implementation progress.
They are mandatory correction tasks for the next iteration.

## Scope Reviewed
- `components/SiteNav.js`
- `app/globals.css`
- `components/MapPageClient.js`
- `components/WhatsOnPageClient.js`

## Priority Fixes

1. P0 - Reduce map pre-content density
- Current state: map route has page title/subtitle, full filter bar, active filter pills, and a separate map toolbar before/around the map.
- Why this is wrong: violates the minimal map interaction model and increases cognitive load before first useful interaction.
- Required change:
  - Use one compact map control rail only (search + precinct + one contextual action).
  - Move non-critical status text below map or into compact inline metadata.
  - Keep the map as the first dominant interactive surface.

2. P0 - Fix map results row semantics
- Current state: map result rows are interactive `li` elements with `role="button"` and keyboard handlers.
- Why this is wrong: weaker semantics/accessibility than native interactive elements.
- Required change:
  - Use `<button>` inside each list item for row selection interaction, or convert each row to an `<a>` when navigation is primary.
  - Keep focus styles visible and consistent.

3. P1 - Enforce single primary map action
- Current state: map toolbar can show multiple actionable buttons near the primary search-area action.
- Why this is wrong: weakens the “Search this area” affordance from the Airbnb-style flow.
- Required change:
  - When map has moved and viewport is not applied, show only one primary action: `Search this area` (or `Update this area` if already area-scoped).
  - Secondary actions (`Clear area`, `Reset map`) must be visually subordinate.

4. P1 - Prevent desktop nav wrap and maintain header compactness
- Current state: better than before, but nav wrap/overflow protection is not explicit enough.
- Why this is wrong: wrapping nav breaks perceived polish and can reintroduce header height instability.
- Required change:
  - Enforce no-wrap for desktop nav and labels.
  - Keep mobile header at compact height with no secondary text.

5. P2 - Reduce separator noise
- Current state: frequent top borders across multiple stacked sections create a segmented look.
- Why this is wrong: conflicts with restrained editorial look and “clean app” requirement.
- Required change:
  - Limit separators to meaningful transitions.
  - Avoid repeating border-heavy section starts on every block.

## Validation Required in Next Handoff
Implementation handoff must include:
1. Updated routes/components touched.
2. Which correction IDs (P0/P1/P2) were resolved.
3. Before/after screenshots at 390px and 1280px.
4. Confirmation that map flow still passes:
- pan/zoom -> `Search this area` -> synced markers + list -> open gallery -> back restores state.

## Follow-up Monitoring Update (2026-02-13, 17:26)
Status after latest implementation pass:
- Improved:
  - Map results now use native interactive elements (`button`) instead of `li` role emulation.
  - Header/nav compactness and no-wrap behavior improved.
  - Map control rail is more consolidated than previous version.
- Still required:
  1. P0 - Remove duplicate map actions.
  - Current issue: when `areaEnabled` and map is idle, both a primary `Clear area` button and a `Clear area filter` text action are shown.
  - Current issue: when map is idle without area mode, both `Reset map` primary button and `Reset map view` text action are shown.
  - Required: one clear primary action only when context demands it (`Search this area` / `Update this area`); keep reset/clear as secondary and non-duplicated.

  2. P1 - Keep map action hierarchy strict.
  - `Search this area` should be the only prominent primary action after map movement.
  - Do not display equally weighted competing primary controls.

  3. P1 - Verify mobile tab readability at 320-375px.
  - Ensure labels do not clip or collide at narrow widths.
  - If needed, shorten labels or add icons while preserving clarity.

  4. P0 - Enforce progressive disclosure sitewide.
  - Current issue pattern: too many controls/details are still visible inline by default.
  - Required:
    - Filters open from a dedicated `Filters` trigger (sheet/modal/drawer), not always-expanded inline blocks.
    - Index lists show only critical summary fields by default.
    - Extra details appear only after explicit user action (preview sheet/popup or detail route).
    - Map marker clicks must open local preview state (popup/sheet), never force long-page scroll jumps.

  5. P0 - Add dedicated exhibition detail route.
  - Current requirement: each exhibition must have its own page.
  - Required:
    - Implement `/exhibition/[slug]`.
    - Every exhibition row/card must include navigation to that route.
    - Keep list rows concise and move extended exhibition content to this detail page.

  6. P0 - Enforce exhibition card hierarchy.
  - Current requirement: cards must prioritize what/when/where with clear typography hierarchy.
  - Required:
    - Use concise default row content only (title, artist, gallery+precinct, date/opening, primary CTA).
    - Remove summary paragraphs from default list rows.
    - Apply consistent type scale so title is clearly primary and metadata clearly secondary.

  7. P1 - Increase default map zoom for first-load marker visibility.
  - Current requirement: map should feel immediately useful on open.
  - Required:
    - Set default map zoom to a tighter level (target `12`) with Sydney-centered view.
    - Validate that first load shows clear bubbles/clusters without immediate user zoom-in.

  8. P0 - Switch map route to full-screen top-bar + bottom-sheet interaction model.
  - Current requirement: avoid long-page map/list stack.
  - Required:
    - Use compact persistent top bar on `/map`: back (left), search (center), `Filters` button (right).
    - Hide bottom tab/menu while map route is active.
    - Move results to draggable bottom sheet with detents:
      - collapsed: `{count} galleries in this area`
      - half: scrollable list while map remains visible above
      - full: list-dominant state
    - Marker/list interactions must update local map/sheet state, not trigger page scroll jumps.

  9. P0 - Polish `/whats-on` filter/list hierarchy to professional app standard.
  - Current issue pattern: control stack and spacing can feel visually disconnected and less professional.
  - Required:
    - Keep filters collapsed by default behind `Filters`.
    - Ensure control order is compact and predictable (title -> subtitle -> controls -> active filters -> result count -> list).
    - Reduce dead space before first list item.
    - Keep date-window control integrated (segmented control or concise active chip pattern).
    - Keep rows concise and hierarchy-driven (no default long detail blocks).

  10. P0 - Screenshot-specific `/whats-on` fixes (current mobile view).
  - Observed issues:
    - `Filters` button appears visually oversized relative to surrounding controls.
    - `Date window: All dates` appears as a detached chip instead of part of a cohesive control system.
    - Too much vertical gap between controls and first result item.
    - Count text and filter state are not grouped tightly enough as one status block.
  - Required:
    - Convert top controls to one compact control row: search + filter trigger.
    - Represent date window via compact segmented control or integrated active chip row (not standalone oversized pill).
    - Place active filter chips and results count in one tight block immediately above the list.
    - Ensure first exhibition item appears quickly with minimal dead space.

  11. P1 - Use icon-first back controls in compact headers.
  - Current requirement: avoid text-only `Back` controls in fixed compact top bars.
  - Required:
    - Use chevron-style back icon button on map/detail compact headers.
    - Keep minimum 44px touch target.
    - Provide `aria-label="Back"` for accessibility.
