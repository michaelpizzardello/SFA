# Sydney Art Finder - Design Guide (Mandatory)

This guide defines information architecture, screen behavior, and UX contracts.
If implementation violates this guide, rework is required.

## 1) Primary User Jobs
1. Find what is on now.
2. Discover openings this week/tonight.
3. Browse galleries by area.
4. Open a gallery profile and decide where to go.

All screen decisions must map to one of these jobs.

## 2) Global App Structure
Required top-level routes:
- `/` Home
- `/whats-on`
- `/galleries`
- `/map`
- `/gallery/[slug]`

Rules:
- Each route has one primary job.
- Do not duplicate full workflows across multiple routes.
- Keep navigation labels short and standard.

## 3) Screen-by-Screen Blueprint

### A) Home
Purpose: orientation and quick entry.

Required blocks in order:
1. Header/nav
2. Intro (brand line + one-sentence value)
3. Primary CTA: "Explore What's On"
4. Secondary CTA: "Browse Galleries"
5. Optional compact highlights: opening tonight, opening this week

Constraints:
- No full filter bars.
- No long lists.
- No map-first module.

Acceptance criteria:
- User can choose a path within 3 seconds.
- No more than 2 primary actions above the fold.

### B) What's On
Purpose: exhibition discovery.

Required layout order:
1. Title + short subtitle
2. Compact filter bar (search, status/date, precinct)
3. Results count
4. Exhibition list

Filter contract:
- Default status: current + upcoming.
- "Opening tonight" and "Opening this week" as quick filters.
- Optional advanced filters collapsed by default.

Result card contract:
- Title
- Artist
- Gallery + precinct
- Date range
- Opening info (if exists)
- Link to gallery profile

Acceptance criteria:
- User can filter and get results without scrolling past complex controls.
- First result appears quickly after filters.

### C) Galleries
Purpose: directory browsing.

Required layout order:
1. Title + optional "Open map" link
2. Compact filters (search, precinct, sort)
3. Results count
4. Gallery directory list

Directory row contract:
- Gallery name
- Precinct
- Address
- Current/upcoming counts
- Link to profile

Constraints:
- No map embedded as dominant block here.
- Keep rows consistent and compact.

Acceptance criteria:
- User can find a specific gallery with one search and one tap.

### D) Map
Purpose: location-based discovery.

Required layout:
1. Map is primary visual element
2. Small floating or top filter controls
3. Synced result summary/list

Behavior contract:
- Moving map updates visible results.
- "Search this area" control appears after map movement.
- Marker click opens lightweight gallery preview + profile link.
- Markers must cluster.

Data contract:
- Invalid coordinates excluded.
- No fallback to `0,0` coordinates.

Acceptance criteria:
- User can identify nearby galleries and open one profile in <= 3 interactions.

### E) Gallery Profile
Purpose: decision page for a venue.

Required layout order:
1. Back link + gallery identity
2. Practical details block (address/hours/contact/links)
3. About block
4. Exhibitions grouped: current, upcoming, past

Constraints:
- Do not include unrelated global filter controls.
- Avoid dense visual styling around contact details.

Acceptance criteria:
- User can find address + current show status immediately.

## 4) Navigation and State Contracts
- Preserve filter state when navigating back from profile.
- URL should reflect active filters where practical.
- Back navigation should feel predictable on mobile.
- Active nav state must always be visible.

## 5) Mobile Interaction Contracts
- Minimum target size: 44x44px.
- Avoid more than 3 stacked control groups before results.
- Keep key controls near top and thumb-reachable.
- Sticky nav cannot obscure form inputs or CTA buttons.

## 6) Copy and Content Standards
- Use concise, plain labels.
- Avoid jargon in controls.
- Date formatting must be consistent across screens.
- Metadata order must be stable (gallery -> precinct -> dates).

## 7) Visual Consistency Contracts
- Same control type must look identical across routes.
- Same data type should be presented in same order/style.
- No mixed paradigms (e.g., one page card-heavy, another bare table) without reason.

## 8) Performance and Technical UX
- Render first meaningful content quickly on mobile.
- Avoid large client-side rerenders for basic filter interactions.
- Use progressive enhancement for map-heavy features.

## 9) Handoff Requirements (Agent Must Provide)
For each completed task, agent must report:
1. Route(s) changed.
2. User job improved.
3. Before/after behavior summary.
4. Which acceptance criteria now pass.
5. Any remaining known UX debt.

## 10) Final Review Rubric (Pass/Fail)
Pass only if all are true:
1. App feels like separate purposeful screens, not one merged interface.
2. Mobile flows are simple and obvious.
3. Visual style is restrained and professional.
4. Map, directory, and exhibition workflows are clearly separated.
5. No obvious UI anti-patterns from `STYLE_GUIDE.md`.
