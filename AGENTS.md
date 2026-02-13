# Sydney Art Finder - Agent Direction

This file is the implementation brief for all agents working in this repo.
Do not improvise UI architecture outside this brief.

## Mission
Build a clean, premium, mobile-first Sydney art guide.
Reference quality: Ocula-style editorial UX (clear hierarchy, restrained visuals, strong content-first layout).

Tagline:
- "Your guide to the Sydney art scene"

## Non-Negotiables
- Do not ship "everything on one screen" layouts.
- Do not mix multiple workflows into one crowded page.
- Do not use heavy decorative backgrounds, excessive gradients, or nested bordered cards.
- Do not add controls without clear purpose in user flow.
- Do not leave filters/details fully expanded by default when they can be progressively disclosed.

## Required Product Architecture (Screens)
Use distinct screens with clear jobs.

### 1) Home (`/`)
Purpose: orientation and quick entry points only.
Must include:
- Brand + tagline
- Primary CTA to What's On
- Secondary CTA to Galleries
- Optional compact highlights (opening tonight / opening this week)
Must NOT include:
- Full filter systems
- Long checklists
- Dense map/list combos

### 2) What's On (`/whats-on`)
Purpose: browse exhibitions happening now and soon.
Must include:
- Default view focused on Current + Upcoming
- Simple top-level filters only: search, date window, precinct
- Exhibition cards with: title, artist, gallery, precinct, date range, opening info
Must NOT include:
- Overloaded filter walls
- Complex UI controls above the fold

### 3) Galleries (`/galleries`)
Purpose: clean directory browsing.
Must include:
- Search
- Precinct filter
- Sort (A-Z and precinct)
- Gallery rows/cards with concise metadata + link to profile
Must NOT include:
- Map embedded with all directory controls in same visual block

### 4) Map (`/map`)
Purpose: spatial discovery workflow.
Must include:
- Map-first layout
- Synced gallery list/results count
- Same core filters (search/precinct) applied to map
- Marker interaction opens gallery profile link
Must NOT include:
- Unrelated exhibition controls
- Cluttered multi-panel nesting

### 5) Gallery Profile (`/gallery/:slug`)
Purpose: a focused content profile.
Must include:
- Name, precinct, address, contact, opening hours, links
- About copy
- Exhibitions grouped: Current, Upcoming, Past
Must NOT include:
- Global browsing controls from other screens

### 6) Exhibition Profile (`/exhibition/[slug]`)
Purpose: focused exhibition detail and conversion context.
Must include:
- Exhibition title, artist(s), status, and date range
- Opening date/time and key visit details
- Gallery name with clear link to gallery profile
- Description and any extended details not shown in list views
Must NOT include:
- Full global filter controls in page body
- Dense unrelated navigation modules

## Visual System (Ocula-Inspired, Not Copying)

### Tone
- Editorial, quiet, premium, confident.
- Content-first.

### Palette
- Neutral base (off-white, charcoal, cool gray).
- One restrained accent color.
- Strong contrast for text and actions.

### Surfaces and borders
- Use whitespace first, borders sparingly.
- Avoid "border inside border inside border".
- Shadows minimal or none.

### Typography
- Elegant serif/sans pairing or clean sans hierarchy.
- Clear reading rhythm on mobile.
- No oversized hero text that pushes content too far down.

### Spacing
- Consistent vertical rhythm.
- Generous breathing room between sections.
- Tighten noisy micro-spacing in chips/buttons.

## Mobile UX Rules
- Design for 375-430px first.
- All tap targets >= 44px.
- Primary actions accessible one-handed.
- Sticky nav must not hide actionable content.
- Keep filter interactions short and predictable.

## Map Quality Requirements
Current map is MVP only. Upgrade path required:
- Add marker clustering.
- Keep map and results list synced.
- Persist viewport/filter state while navigating.
- Exclude invalid coordinates (never coerce missing coords to `0,0`).
- Support "search this area" behavior.

## Data and Architecture Guidance

### Short-term
- Next.js App Router is the active architecture in this repository.
- Keep route/page work inside the current Next.js structure unless explicitly approved otherwise.

### Production target
- Keep real URL paths and SEO-capable routing (already in place with Next.js).
- Ensure gallery/exhibition pages are indexable.
- Move sheet ingestion to normalized backend pipeline before launch.

## Quality Bar for Handoffs
Before claiming a UI task done, verify:
1. Each screen has one clear purpose.
2. No crowded "all-in-one" interface blocks.
3. Mobile flow is clean and fast.
4. Visual style is restrained and editorial.
5. `npm run build` succeeds.

## Immediate Task Order for Current Agent
1. Separate workflows cleanly across Home, What's On, Galleries, Map, Gallery Profile, Exhibition Profile.
2. Remove cluttered nested card styling and decorative background noise.
3. Rebuild mobile-first spacing/typography and navigation ergonomics.
4. Improve map UX and coordinate validity handling.
5. Add exhibition detail pages and route-level navigation from list/map/profile contexts.
6. Keep current functionality while simplifying interaction model.

## Live Monitoring Corrections (2026-02-13)
These corrections are based on observed in-progress implementation and are mandatory.
1. Map screen control density is still too high above the map. Consolidate to one compact map control rail and remove duplicate pre-map control blocks.
2. `Search this area` must remain the primary map action after movement. Avoid competing primary actions in the same toolbar state.
3. Map results rows must use proper interactive semantics (`button`/`a`), not `li` with `role="button"`.
4. Desktop top nav must stay on one line with no wrap or overflow at supported widths.
5. Reduce repeated separator lines that make the layout look segmented/noisy.
6. Provide before/after screenshots (390px and 1280px) with each map/header iteration.
7. Sitewide progressive disclosure is mandatory: filters behind a `Filters` entry point, concise lists by default, details through overlays/sheets/routes.
8. On map, marker interaction must open local preview (sheet/popup), never force-scroll the user down the page.
9. Every exhibition list item must have a clear path to `/exhibition/[slug]` for full details.
10. Exhibition list rows must follow strict info hierarchy (what/when/where/action) and remain concise by default.
11. Map default zoom should be tighter (target `zoom 12`) so bubbles/clusters are visible on first load.
12. Map route UX must use full-screen mode with persistent compact top controls: back (left), search (center), `Filters` button (right).
13. Hide bottom menu/tab bar while on map full-screen route.
14. Map results must use draggable bottom sheet detents (collapsed count, half, full) instead of a long fixed list under the map.
15. `/whats-on` must follow a clean app-grade filter/list pattern: collapsed filters, compact control hierarchy, concise result rows, and minimal dead space above first item.
16. In compact fixed headers/top bars, use chevron-style back icon controls (not text-only `Back`) with proper accessibility labeling.


## Additional Mandatory Reference
- Follow `DESIGN_LOCK.md` for all UI/layout decisions.
- If unclear, choose the most standard, conservative pattern.

## Mandatory Guides (No Exceptions)
- `DESIGN_LOCK.md` sets benchmark direction against Ocula/Artsy structure.
- `STYLE_GUIDE.md` defines exact visual tokens, spacing, type, and component rules.
- `DESIGN_GUIDE.md` defines exact IA, screen workflows, behavior contracts, and acceptance criteria.
- If there is conflict: `DESIGN_GUIDE.md` + `STYLE_GUIDE.md` take precedence for implementation details.
- Agent must reference these files in every UI handoff and state which criteria were satisfied.
- `MAP_MINIMAL_SPEC.md` defines required map visual + functional behavior. Follow it exactly for map work.
- `AIRBNB_MAP_INTERACTION_GUIDE.md` defines mandatory Airbnb-style mobile map interaction behavior (flow, state, map/list sync).
- `UX_RESEARCH_IMPLEMENTATION_BRIEF.md` is the research-backed execution spec for header/layout usability fixes. Follow it exactly for structure, measurements, and acceptance gates.
- `MONITORING_CORRECTIONS.md` contains latest course-correction notes from live review. Implement those changes before adding new features.
- `PROGRESSIVE_DISCLOSURE_UX_GUIDE.md` defines mandatory step-by-step interaction behavior (filters/sheets/popups/detail routes) and prohibits all-in-one long-page UI patterns.
- `EXHIBITION_CARD_HIERARCHY_GUIDE.md` defines required exhibition card information order, typography hierarchy, and density limits.
- `WHATS_ON_POLISH_SPEC.md` defines exact `/whats-on` header/filter/list hierarchy for professional app-grade UX.
