# Sydney Art Finder - What's On UI Polish Spec (Mandatory)

This spec defines the exact professional pattern for the `/whats-on` header, filters, and exhibition list.
If implementation conflicts with this file, this file wins.

## 1) Problem Statement
The current section can feel busy/unbalanced because controls, chips, result count, and list start are not tightly structured.
Goal: make the screen feel immediate, calm, and app-grade.

## 2) Professional Target Pattern
Use a standard "search + filter trigger + active filter chips + count + concise list" layout.

### Above-the-fold order (mobile)
1. `What's On` title
2. One concise subtitle line (max ~2 lines)
3. Primary control row:
   - left: search field (or search trigger)
   - right: `Filters` button
4. Optional quick-mode segmented control:
   - `Current + upcoming`
   - `All dates`
   - `Opening tonight`
   - `Opening this week`
5. Active filter chips row (only if filters applied)
6. Results count inline near chips
7. Start of first exhibition item should be visible or near-visible

Hard limit:
- No more than 3 control groups before first list item.

## 3) Filter UX Contract

1. Default:
- Filters are collapsed.
- `Filters` button opens bottom sheet/modal.

2. Filter sheet contents:
- Search
- Date window
- Precinct
- Advanced gallery filter (collapsed section)

3. Filter feedback:
- Show applied filter chips outside sheet.
- Chips must be removable with one tap.
- Include clear "Clear all filters" in sheet/footer.

4. Result count:
- Keep close to active chips and list start.
- Use concise pattern: `15 exhibitions`.

## 4) Visual Hierarchy Rules

### Header block
- Tighten top spacing so controls do not drift too far below title/subtitle.
- Subtitle should be subdued but readable.
- Avoid oversized blank space between subtitle and controls.

### Filter controls
- `Filters` should look like utility control, not oversized hero button.
- Date window should appear as either segmented control or a concise active chip, not a disconnected large element.
- Active chips should be compact and horizontally scannable.

### List start
- First exhibition row should begin soon after results metadata.
- Avoid long dead space between count and first card.

## 5) Exhibition Row/Card Rules (Summary View)
Use concise summary rows, not long-detail cards.

Required order:
1. Title + status
2. Artist
3. Gallery + precinct
4. Date range
5. Opening signal (if present)
6. Actions: `View details` (primary), `Gallery` (secondary)

Constraints:
- No summary paragraph in default list.
- Max metadata density: quickly scannable in <3 seconds.
- Primary action must always be clearly visible.

## 6) Typography & Spacing Targets
- Title: strongest emphasis.
- Artist: secondary but prominent enough.
- Metadata: muted and smaller.
- Status pill: subtle, compact, text-first (not decorative).

Spacing:
- Keep vertical rhythm tight and consistent.
- Avoid large gaps between section components in the header/filter area.

## 7) Accessibility & Interaction
- Tap targets >= 44px.
- Focus states visible on all controls.
- Status conveyed by text, not color only.
- Filter sheet must be dismissible by explicit close action and backdrop tap.

## 8) Acceptance Criteria (Must Pass)
1. Screen looks clean and intentionally structured at first glance.
2. First list item appears without excessive scrolling.
3. Filters are hidden by default and easy to open/close.
4. Active filters are clear, removable, and near results count.
5. Exhibition rows are concise and visually hierarchical.
6. UI feels comparable to standard production list/filter app patterns.
