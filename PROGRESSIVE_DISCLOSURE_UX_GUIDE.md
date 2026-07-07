> **SUPERSEDED by /DESIGN_SPEC.md (2026-07-07) — kept as history.**
> This file is no longer design/IA authority; where it conflicts with DESIGN_SPEC.md, DESIGN_SPEC.md wins.

# Sydney Art Finder - Progressive Disclosure UX Guide (Mandatory)

This guide defines required interaction behavior sitewide.
It exists to prevent "everything visible on one long page" UI.

If implementation conflicts with this guide, this guide wins.

## 1) Core Rule
Do not render full controls + full results + full details simultaneously on one scrolling screen.

Use step-by-step disclosure:
1. User sees primary task context.
2. User reveals controls/details only when needed.
3. User returns to prior context without losing place/state.

## 2) Disclosure Levels (Use Exactly)

### L0 - Primary screen
- Core task content only.
- Minimal controls visible.
- No advanced panels open by default.

### L1 - Secondary controls
- Revealed via explicit trigger (`Filters`, `View options`, `More`).
- Presented in modal/bottom sheet/drawer on mobile.
- Dismissible with close gesture/button.

### L2 - Item preview
- Compact preview in popover/sheet (not full page dump).
- Includes only high-value details and one primary CTA.

### L3 - Full detail page
- Dedicated route for full information.
- Used only after explicit user selection.
- Required detail routes include `/gallery/[slug]` and `/exhibition/[slug]`.

## 3) Mandatory Global Interaction Patterns

1. Filters
- Default state: collapsed.
- Entry point: single `Filters` button.
- Mobile: open filters in bottom sheet (not inline expanded blocks).
- Desktop: drawer/panel allowed, but still toggled and dismissible.
- Show active filters as compact chips outside the panel.

2. Lists
- Show critical fields only.
- No long summaries by default in index lists.
- Add `View details`/tap-through for full content.
- In exhibitions lists, `View details` must go to `/exhibition/[slug]`.

3. Advanced options
- Hidden by default.
- Accessed via `Advanced` action inside filter panel, not always visible inline.

4. Closing behavior
- Every overlay/sheet must have explicit close affordance.
- Back action should close overlay first before leaving route where appropriate.

## 4) Map-Specific Behavior (Non-Negotiable)

1. Marker tap behavior
- Must open a compact bottom sheet or popup preview.
- Must NOT scroll the user down the page to a distant list section.

2. Map/list relationship
- Map remains primary surface.
- Results list is secondary and collapsible.
- On mobile, list should appear as a bottom sheet:
  - collapsed: summary/count
  - expanded: scrollable list
- The map screen itself should be full-screen while active, with compact top controls only.
- Bottom app tab/nav bars should be hidden in map full-screen mode.

3. Selection flow
- Tap marker -> preview sheet opens.
- Preview sheet -> `View gallery` CTA.
- Close preview -> return to same map viewport and selection context.

4. Search area flow
- Pan/zoom -> show `Search this area`.
- Apply -> refresh map markers + list summary.
- Do not auto-jump the viewport or scroll list unexpectedly.

5. Top controls flow
- Persistent compact top row:
  - Back (left)
  - Search (center)
  - Filters trigger (right)
- `Filters` opens a dismissible panel/sheet; filter controls are not always expanded.

## 5) What's On Behavior

Default visible:
- Search
- Date window
- Precinct
- Result count + simple result rows

Hidden by default:
- Multi-gallery selection
- Secondary sort/grouping controls
- Long explanatory copy

Result row should include only:
- Exhibition title
- Artist
- Gallery + precinct
- Date range/opening indicator
- Primary CTA to `/exhibition/[slug]`

Not default-visible in list:
- Full summary paragraphs
- Extended metadata blocks
- Multiple stacked action buttons

## 6) Galleries Behavior

Default visible:
- Search
- Precinct
- Sort
- Results list

Hidden by default:
- Non-essential metadata blocks
- Secondary comparison/analytics style information

Row content maximum:
- Name
- Precinct
- Address
- Current/upcoming count
- Single CTA

## 7) Gallery Profile Behavior

Profile page is detail route, but still use progressive disclosure:
- Keep top section concise (identity + visit CTA).
- Use collapsible sections for lower-priority content where needed:
  - About
  - Contact links
  - Past exhibitions

Default-open sections:
- Visit info
- Current exhibitions

Default-collapsed sections:
- Past exhibitions (especially long lists)
- Extended descriptions

## 8) Information Density Limits

Fail conditions:
1. More than 3 control groups visible before first result item on mobile.
2. List rows exceed critical metadata and become paragraph-heavy by default.
3. User must scroll large distances to reach related interaction outcomes.
4. Primary map interaction triggers page scroll instead of local overlay/sheet state.

## 9) State Rules
- Preserve user context when closing overlays:
  - scroll position
  - selected filters
  - map viewport
  - selected item
- Returning from detail route should restore previous list/map context.

## 10) Required Acceptance Tests
Implementation is not complete unless all pass:
1. Map marker tap opens local preview (sheet/popup), no forced page scroll.
2. Filters are hidden by default and opened via explicit trigger.
3. Lists show concise fields only; details require an extra user action.
4. Overlay close returns user to same context without reset.
5. Mobile first viewport is not overloaded with controls and metadata.
6. Exhibition list rows link to dedicated exhibition detail routes.
