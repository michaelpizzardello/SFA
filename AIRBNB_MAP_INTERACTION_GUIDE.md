> **SUPERSEDED by /DESIGN_SPEC.md (2026-07-07) — kept as history.**
> This file is no longer design/IA authority; where it conflicts with DESIGN_SPEC.md, DESIGN_SPEC.md wins.

# Sydney Art Finder - Airbnb-Style Mobile Map Interaction Guide (Mandatory)

This guide defines how the map should *behave* on mobile.
It is Airbnb-inspired in interaction model (not visual copying or brand mimicry).

If implementation conflicts with this guide, this guide wins.

## 1) Interaction Philosophy
- Map is the primary browsing surface.
- Results are discoverable with minimal cognitive load.
- Controls are few, obvious, and context-aware.
- The user should never feel lost after panning, filtering, or opening details.

## 2) Core Mobile Flow (Must Implement)
1. User opens `/map`.
2. Map loads with current filter context.
3. User pans/zooms.
4. App reveals `Search this area` CTA.
5. User taps CTA.
6. Marker set + results count + list update together.
7. User taps marker OR list row.
8. Compact detail card appears with one primary CTA: `View gallery`.
9. User opens gallery profile.
10. On back, previous map viewport + filters + selection are restored.

## 3) Layout Contract (Mobile)
- Map route runs in full-screen map mode.
- Top overlay is persistent and compact:
  - left: chevron-style back icon button
  - center: search field
  - right: `Filters` button
- No bottom tab bar while on `/map`.
- Map canvas occupies full viewport behind overlays.
- Floating CTA: `Search this area` shown only when viewport changed and not yet applied.
- Bottom sheet/list is draggable with explicit detents:
  - collapsed: handle + results count (`N galleries in this area`)
  - half: list visible and scrollable while map remains visible in top half
  - full: list dominates viewport

Hard constraints:
- Do not show dense control walls over the map.
- Do not place long checklists above map.
- Do not show more than one primary floating action at a time.
- Do not use inline full-page list blocks under the map in map mode.
- Do not keep filters permanently expanded on map screen.

## 4) Controls Contract
Allowed controls on map screen:
- Back icon button (chevron)
- Search field (location/gallery text)
- `Filters` button that opens filter sheet/modal
- `Search this area` button
- Zoom controls
- Optional `Reset map`

Control behavior:
- `Search this area` appears after map move and disappears after apply.
- `Filters` opens secondary panel/sheet; filters are not always visible.
- Filter changes can auto-refresh results or require explicit apply, but behavior must be consistent.
- Active filters must always be visible and removable.
- Back icon accessibility: icon control must expose `aria-label="Back"` and preserve 44px minimum touch target.

## 5) Marker and List Sync (Mandatory)
- Marker tap highlights matching list row.
- List row tap centers map on marker and opens marker detail.
- Selected marker remains selected until dismissed or replaced.
- Results count always matches current visible/filter state.
- Marker tap must not force long-page scroll jumps.

## 6) Detail Card Contract (Map Selection)
Compact card content order:
1. Gallery name
2. Precinct/suburb
3. Address (single concise line)
4. Exhibition summary line (optional, short)
5. CTA: `View gallery`

Constraints:
- One CTA only.
- No long body copy.
- No unrelated controls inside card.
- Keep map context intact when opening/closing card.

## 6.1 Bottom Sheet Mechanics (Required)
- Sheet must include visible drag handle.
- Supported detents: `collapsed`, `half`, `full`.
- Collapsed state copy format: `{count} galleries in this area`.
- In `half` state:
  - list scrolls independently
  - map remains visible and usable in upper portion.
- In `full` state:
  - list consumes most/all viewport.
- If user scrolls list to top and continues pulling down, sheet should move toward lower detent (`full -> half -> collapsed`) depending on release point.
- Sheet transitions must be smooth and interruptible.

## 7) State Persistence Rules
Must persist when navigating away/back:
- map center
- map zoom
- applied map bounds query context
- search text
- precinct filter
- selected marker/gallery
- list scroll position (if feasible)

Persistence methods:
- URL params for shareable state where practical.
- Session state for transient UI state.

## 8) Performance Rules
- Debounce viewport updates (`250-400ms`).
- Do not rerender entire map tree on tiny movements.
- Cluster markers at lower zoom levels.
- Keep transitions subtle and fast (`100-180ms`).

## 9) Accessibility Rules
- All controls keyboard/focus accessible.
- Tap targets >= 44px.
- Focus outline must remain visible.
- Map fallback text and empty states required.

## 10) Empty/Error States
- No results in area: `No galleries in this area.`
- Secondary message: `Try zooming out or clearing filters.`
- Map load failure: show fallback CTA to `/galleries`.

## 11) Explicit Do/Don't
Do:
- Keep interactions simple and predictable.
- Prioritize map/list synchronization quality.
- Keep UI calm and low-noise.

Don't:
- Don't mix full "What's On" filter complexity into map screen.
- Don't hide active filtering state.
- Don't force user to repeat map moves after back navigation.
- Don't use decorative map UI chrome.

## 12) Acceptance Checklist (Must Pass)
1. `Search this area` flow works exactly after map movement.
2. Marker <-> list sync works both directions.
3. Back from profile returns user to same map context.
4. Minimal controls only; no cluttered overlays.
5. Mobile interaction feels fast, obvious, and stable.
6. `/map` hides bottom tab bar and uses full-screen map mode.
7. Top overlay always shows back + search + filters trigger.
8. Bottom sheet supports collapsed/half/full drag behavior with count in collapsed state.
