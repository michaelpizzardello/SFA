# Sydney Art Finder - Minimal Map Spec (Mandatory)

This spec defines the exact map experience required.
If current implementation conflicts with this spec, this spec wins.

## 1) Product Intent
Build a map that feels premium, quiet, and modern.
Reference behavior quality: clean editorial platforms, not default map demos.

Primary user outcome:
- Quickly find nearby galleries and open a profile in minimal steps.

## 2) Visual Direction

### Basemap
- Use a low-noise neutral basemap.
- Land/water/roads should be light and understated.
- Keep high-importance labels only (suburbs + major roads at broad zoom).
- Remove visual clutter from POIs where possible.

### Marker language
- Default marker: small solid dot (`8-10px`), neutral dark fill.
- Marker halo: subtle `1px` light ring for contrast.
- Hover/active marker: accent color + slightly larger size (`11-12px`).
- Transition timing: `120-160ms` color/size only.
- No skeuomorphic pins, no heavy shadows, no glossy effects.

### Clusters
- Flat circles, neutral fill.
- Simple numeric label.
- No gradient, no bevel, no heavy drop shadow.

### Popovers
- Compact white surface.
- Thin border only.
- Very subtle or no shadow.
- Content order: name -> precinct -> profile link.
- Keep text concise and readable.

### Container/chrome
- Map container radius: `8-12px`.
- Single border max.
- No glow effects, no decorative overlays, no texture backgrounds.

## 3) Screen Layout Rules

### Mobile
- Map is primary: target `60-70vh` visible height.
- Compact control bar at top of map.
- Results list below map as simple rows (not bulky cards).
- Controls must not block pan/zoom interactions.

### Desktop
- Split view preferred:
  - Left: map
  - Right: synced results list
- Keep controls near top-left of map area.

## 4) Functional Requirements

### Core interactions
1. User pans/zooms map.
2. App shows `Search this area` CTA.
3. User taps CTA.
4. Results update to viewport.
5. Marker and list interactions remain synchronized.

### Sync contracts
- Marker click highlights/selects corresponding list row.
- Row click centers map on marker and opens popover.
- Selection state is visually obvious but understated.

### State persistence
- Preserve map center, zoom, and filters when navigating to `/gallery/[slug]` and returning.
- Preserve current result context on browser back.

### Data validity
- Exclude invalid coordinates.
- Never coerce missing coordinates to `0,0`.
- Excluded records should still appear in non-map directory views.

## 5) Controls (Allowed Set)
Allowed:
- Search input (gallery/suburb/precinct).
- Precinct filter.
- `Search this area` button.
- Zoom +/- controls.
- Optional `Reset view`.
- Optional `Use my location` (only if implemented cleanly and with permission handling).

Not allowed by default:
- Extra map widgets unrelated to discovery.
- Dense stacks of chips/toggles floating over map.
- Multiple competing action bars.

## 6) Performance Requirements
- Use marker clustering for dense views.
- Update viewport-derived results with debouncing (`250-400ms`).
- Avoid full rerender on every tiny map movement.
- Keep interactions smooth on modern mobile devices.

## 7) Accessibility Requirements
- All controls keyboard reachable.
- Buttons and inputs >= `44px` tap height.
- Visible focus styles.
- Text contrast must meet WCAG AA.
- Map status/empty states communicated in text.

## 8) Empty/Error States
- No-results state copy: `No galleries in this area.`
- Suggestion line: `Try zooming out or clearing filters.`
- If map fails to load, show fallback message + link to `/galleries` list view.

## 9) Acceptance Criteria (Must Pass)
1. Map looks intentionally minimal, not default-library styling.
2. User can go from map open -> gallery profile in <= 3 interactions.
3. Map/list sync works in both directions.
4. Returning from profile restores prior map state.
5. No visual clutter (gradients/glows/decorative effects).
6. Invalid coordinates are excluded safely.
