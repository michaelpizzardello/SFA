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

## Required Product Architecture (Screens)
Use distinct screens with clear jobs.

### 1) Home (`#/`)
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

### 2) What's On (`#/whats-on`)
Purpose: browse exhibitions happening now and soon.
Must include:
- Default view focused on Current + Upcoming
- Simple top-level filters only: search, date window, precinct
- Exhibition cards with: title, artist, gallery, precinct, date range, opening info
Must NOT include:
- Overloaded filter walls
- Complex UI controls above the fold

### 3) Galleries (`#/galleries`)
Purpose: clean directory browsing.
Must include:
- Search
- Precinct filter
- Sort (A-Z and precinct)
- Gallery rows/cards with concise metadata + link to profile
Must NOT include:
- Map embedded with all directory controls in same visual block

### 4) Map (`#/map`)
Purpose: spatial discovery workflow.
Must include:
- Map-first layout
- Synced gallery list/results count
- Same core filters (search/precinct) applied to map
- Marker interaction opens gallery profile link
Must NOT include:
- Unrelated exhibition controls
- Cluttered multi-panel nesting

### 5) Gallery Profile (`#/gallery/:slug`)
Purpose: a focused content profile.
Must include:
- Name, precinct, address, contact, opening hours, links
- About copy
- Exhibitions grouped: Current, Upcoming, Past
Must NOT include:
- Global browsing controls from other screens

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
- Vite is acceptable while refining UI and workflows.

### Production target
- Move to SEO-capable routing architecture (e.g. Next.js).
- Replace hash routes with real URL paths.
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
1. Separate workflows cleanly across Home, What's On, Galleries, Map, Gallery Profile.
2. Remove cluttered nested card styling and decorative background noise.
3. Rebuild mobile-first spacing/typography and navigation ergonomics.
4. Improve map UX and coordinate validity handling.
5. Keep current functionality while simplifying interaction model.


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
