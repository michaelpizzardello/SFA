# SAF DESIGN SPEC — the committed system (ground-up UI rebuild)

Status: AUTHORITATIVE. This document is the single design source of truth for the rebuild.
Base: the ocula-faithful proposal (ranked first by all three judges), carrying three grafts the
judges mandated (Artsy `@layer` CSS architecture, the two-register/dead-zone type law, the
semantic chip split) and fixing every flagged violation. All reference facts cite the recon set
(`scratchpad/recon/ref_*`, `code_*`). Hard constraints of the brief are binding throughout.

---

## 1. Design position

SAF becomes a small, precise Ocula: an editorial listings ledger, not a marketing site. The page
recedes — white ground, one hairline vocabulary, near-invisible chrome — and the exhibitions do
the talking through Ocula's verified four-line card grammar (UPPERCASE artist / *italic title* /
gallery / mono facts). The type system is two registers with a deliberate dead zone: a utility
register that tops out at 20px (11px uppercase tracked page-h1s, 20px sentence-case section
heads, 13px card ladders, 12px mono facts) and an editorial register that starts at 28px
(masthead clamps, mono stat numerals) — no fixed size exists between 20px and 28px, which is
what makes 74 galleries read curated rather than thin. Facts are law: every date, location,
count and spec line is mono, public and back-of-house alike; and the inverse holds — mono never
appears in buttons, headings, nav or body prose. Fraunces is demoted to Ocula's serif role:
editorial prose (gallery about, exhibition summary), the wordmark, and the monogram tile —
never headings, never UI. Where Ocula manufactures infinity (infinite scroll, ads, artwork
rails), SAF composes density instead: capped 8-card rails, alternating #fafafa bands, ledger
rows for date-led content, full finite grids, and empty sections simply not rendered. Controls
speak Ocula's quiet text-link dialect — text tabs with `<sup>` counts, action-links, rare
outline buttons — never pills, never colored chips; the one boxed chip is the removable applied
token, because removable state is not navigation. From Artsy we take only verified production
tokens: the blue #1023D7 with its full state ramp (near-identical family to Ocula's live
link-hover #0e14c6), the 768/1280 breakpoints, and the `@layer` cascade discipline. The
back-of-house is the same publication at the same temperature: mono facts, hairline ledger
rows, status as plain words, text-link actions — Artsy partner-CMS restraint wearing Ocula
clothes. Everything the current build already gets right (mono captions, italic titles,
section-head + link-arrow, sticky profile tabs, detented map sheet) is kept and tightened, not
replaced.

**Relationship to references:** Ocula is the grammar (card anatomy, casing law, section-head
primitive, bands, text-filter dialect, tiny page h1, serif-for-prose-only); Artsy is the
hardware (accent ramp, breakpoints, cascade architecture, hover-to-blue state ladder); SAF's
own committed signatures (mono fact captions, Time-Spine IA, one-image exhibitions) are the
content the grammar serves.

---

## 2. Token sheet (transcribed 1:1 into `app/styles/tokens.css`, `:root` only)

### 2.1 Neutrals (cool ramp; replaces warm #f5f4f2/#ededec family)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#ffffff` | page background (constraint 1) |
| `--band` | `#fafafa` | alternating section band (Ocula's exact alternator — ref_ocula-exh-index) |
| `--surface-muted` | `#f7f7f7` | hover fills, quiet panels, BOH sidebar |
| `--placeholder` | `#ededed` | no-image tile, skeletons, image preload bg |
| `--hairline` | `#e5e5e5` | default 1px rule |
| `--hairline-strong` | `#cccccc` | control borders, table-header rules |
| `--ink-900` | `#0d0d0d` | primary text (15.9:1) |
| `--ink-700` | `#444444` | secondary text (9.7:1) |
| `--ink-500` | `#6e6e6e` | meta/muted text (5.1:1 — AA at all sizes used) |
| `--ink-400` | `#999999` | NON-TEXT only: inactive icons, placeholder glyphs, monogram letters |
| `--ink-300` | `#cccccc` | disabled fills, sheet handle |

### 2.2 Accent + status

| Token | Value | Role |
|---|---|---|
| `--accent` | `#1023D7` | THE accent — Artsy blue100 (ref_artsy-palette §2), 9.4:1 on white, same deep-blue family as Ocula's live link-hover #0e14c6. Interaction only: link/button hover, saved star, active map marker, focus ring. Chosen over #14169c because it is a verified production token with a tested state ramp and reads unmistakably as "interactive". |
| `--accent-hover` | `#0A1C7B` | Artsy blue150 — hover/active fills |
| `--accent-press` | `#050E3E` | Artsy blue200 — pressed |
| `--accent-tint` | `#E6E7F5` | Artsy blue10 — `::selection` + selected map-sheet row ONLY; never a panel fill |
| `--on-accent` | `#ffffff` | text on accent/ink fills |
| `--ok` | `#2f6b4f` | form-success text only |
| `--danger` | `#b42318` | error text + destructive text-links only |
| `--scrim` | `rgba(0,0,0,.45)` | modal/sheet scrim |
| `--scrim-soft` | `rgba(0,0,0,.20)` | search-overlay scrim |

No status colors anywhere. Status = word (+ mono date where relevant), plain text (constraint 6).
Deleted token families: `--ink-section/--on-section/--on-section-muted` (dark footer retired),
`--accent-tint`(old)/`--danger-tint`/`--radius-card`/`--radius-block`/`--fw-*`/`--dur-fast`
(dead), all `--color-*` aliases and `--font-manrope` (after map rewrite), `--surface`
(merges into `--paper`), `--surface-selected` (undeclared ghost).

### 2.3 Spacing / layout / radii / borders / shadows / z / breakpoints / motion

| Token | Value |
|---|---|
| `--space-1..11` | 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 120px (kept, proven) |
| `--container` | `1280px` |
| `--container-narrow` | `640px` (prose, forms, invite column) |
| `--gutter` | `clamp(16px, 4vw, 40px)` |
| `--grid-col-gap` | `20px` |
| `--grid-row-gap` | `40px` (down from 56 — composed density) |
| `--header-h` | `64px` ≥768 / `56px` <768 (media-swapped in tokens.css). EVERY sticky offset, overlay inset and scroll-margin computes from this token |
| `--tabbar-h` | `56px` (+ `env(safe-area-inset-bottom)` where consumed) |
| `--boh-nav-w` | `220px` |
| `--radius-control` | `2px` (inputs, buttons, applied tokens, popups) |
| `--radius-pill` | `999px` (map floating controls ONLY — touch affordance over tiles) |
| `--radius-sheet` | `12px 12px 0 0` |
| cards / images / tables / bands | radius 0, no border, no shadow |
| `--shadow-pop` | `0 12px 40px -16px rgba(0,0,0,.22)` (overlays: search band, popups, selection card, drawer) |
| `--shadow-sheet` | `0 -8px 40px -16px rgba(0,0,0,.24)` (bottom sheets) |
| z-ledger | `--z-toolbar:20; --z-map-ui:30; --z-boh-nav:40; --z-map-ctl:45; --z-search-scrim:48; --z-search:49; --z-header:50; --z-map-sheet:50; --z-tabbar:60; --z-map-card:62; --z-scrim:70; --z-sheet:71; --z-map-filter:80; --z-map-full:90; --z-skip:100` |
| Breakpoints (raw px in media queries; four only) | **480** minor (2-col form grids, footer 2-col) · **768** the hinge (tab bar ↔ header nav, sheet ↔ drawer, 3-up grid, list-row 2-col) · **1024** map split view + BOH sidebar · **1280** 4-up grid, container max |
| `--ease` | `cubic-bezier(.2,0,0,1)` |
| `--dur-1` / `--dur-2` / `--dur-3` | `120ms` (hover/underline) / `200ms` (overlays, tabs) / `320ms` (image fade-in, hero) |

Decision: map split + BOH sidebar hinge at **1024 over Artsy's 1280** because MAP_MINIMAL_SPEC
binds "desktop split map/list" and a 1024–1279 laptop is a desktop (judges flagged artsy's 1280
as a constraint-9 breach). Decision: container **1280 over hybrid's 1360** because it aligns the
container to the 4-up breakpoint — one number, two jobs.

Fonts: `--font-display` (Fraunces 400 + 400-italic + 500), `--font-text` (Manrope 400/500/600),
`--font-mono` (Spline Sans Mono 400/500) — set exclusively by next/font in `app/layout.js` as
DIRECT variables on `<body>`; tokens.css never declares or aliases them (trap §Traps). Dropped
weights vs current: Manrope 700, Fraunces 600 (unused — smaller payload).

Global: `prefers-reduced-motion: reduce` kills all transitions/animations + hero auto-rotate
(existing kill kept). Focus-visible everywhere: `2px solid var(--accent)`, offset 2px.
`::selection { background: var(--accent-tint) }`.

---

## 3. Type roles (complete — no other sizes exist)

**The two-register law:** utility register ≤20px; editorial register ≥28px. No fixed size
between 20 and 28 anywhere; display clamps floor at 28. No text below 11px. Mono = facts,
everywhere; mono never in buttons, headings, nav or prose. Italic = titles of shows/works only.
UPPERCASE = artist names + labels only; gallery names plain sans always (constraint 2).
Serif = prose + wordmark + monogram only.

| Role token | Family | Size / LH | Weight | Tracking | Case | Used for |
|---|---|---|---|---|---|---|
| `--t-page-title` | Manrope | 11px / 1.5 | 600 | +0.08em | UPPERCASE | public index h1: "What's On", "Galleries", "Saved" (Ocula `.type-title` 11px uppercase — ref_ocula-exh-index) |
| `--t-eyebrow` | Spline Sans Mono | 11px / 1 | 500 | +0.14em | UPPERCASE | kickers, ledger `dt`, table headers, group/date headers, status words, tab-bar labels, hours label |
| `--t-sup` | Spline Sans Mono | 11px / 1 | 400 | 0 | — | `<sup>` filter counts (raised from Ocula's 10px — a11y floor decision) |
| `--t-mono` | Spline Sans Mono | 12px / 1.5 | 400 | 0 | Original | ALL dates, locations, counts-in-copy, spec `dd`s, © line (constraint 2). `font-variant-numeric: tabular-nums` |
| `--t-card-artist` | Manrope | 13px / 1.35 | 500 | +0.04em | UPPERCASE | card line 1 (Ocula `.list-artist-name`) |
| `--t-card-title` | Manrope italic* | 13px / 1.35 | 400 | 0 | Original | card line 2 (Ocula `.list-sub-title` italic). *Synthetic oblique — already shipped/approved |
| `--t-card-text` | Manrope | 13px / 1.4 | 400 | 0 | Sentence | card gallery line, list rows, table cells, footer + nav links |
| `--t-ui` | Manrope | 13px / 1 | 500 | 0 | Sentence | buttons, text tabs, action-links, toolbar controls |
| `--t-h3` | Manrope | 15px / 1.35 | 600 | 0 | Sentence | sub-heads, sheet titles, form-section heads |
| `--t-body` | Manrope | 15px / 1.55 | 400 | 0 | — | UI body copy, empty states, hints at 13px/`--ink-500` |
| `--t-serif` | Fraunces | 16px / 1.65 | 400 | 0 | — | editorial prose ONLY: gallery about, exhibition summary (Ocula serif role) |
| `--t-input` | Manrope | 16px / 1.4 | 400 | 0 | — | input value text (16px kills iOS zoom) |
| `--t-h2` | Manrope | 20px / 1.3 | 500 | 0 | Sentence | section heads; ALSO the BOH page h1 and auth h1 (utility register tops here — kills the stray 24px) |
| `--t-masthead-sub` | Manrope italic | 20px / 1.3 | 400 | 0 | Original | exhibition title under the artist masthead; hero-lockup title line |
| `--t-stat` | Spline Sans Mono | 28px / 1.1 | 400 | 0 | — | home window counts, dashboard/console stat figures — numbers are facts, facts are mono |
| `--t-masthead` | Manrope | clamp(28px, 5vw, 48px) / 1.05 | 400 | −0.01em | UPPERCASE via content (artists) / Title case (gallery names) | exhibition-page artist h1, gallery-profile name h1, hero-lockup artist, home fallback statement (Ocula `feature-title` 42–60 wt-400 — ref_ocula-gallery-exh) |

Wordmark: Fraunces 500 — 20px header / 16px footer + auth. Monogram: Fraunces 400 28px
+0.05em `--ink-400`.

Decision: **artist-first sans masthead (ocula) over serif-italic 76px title masthead (hybrid)**
because the recon proves Ocula's hero scale belongs to the ARTIST (`feature-title`) with the
title as smaller italic sub — hybrid's inversion was reference-unsupported.
Decision: **BOH h1 at 20px over 24px** to enforce the dead zone (judge-flagged token sprawl).
Decision: **stat numerals mono over Fraunces** — hybrid's serif stat contradicted its own
"facts are mono" law.
Decision: **all 10px edges raised to 11px** (tab-bar labels, sup counts) — judge 2's flagged
worst weakness of the winning proposal; 11px is the floor.

---

## 4. Primitives

### 4.1 Header (public)
White, sticky, `height: var(--header-h)`, 1px `--hairline` bottom, z `--z-header`. Contents
(constraint 4, set unchanged):
- Left: wordmark Fraunces 500 20px `--ink-900` → `/`.
- Nav ≥768: What's On · Galleries · Map — `--t-card-text` at 500, gap 28px, `--ink-700`;
  hover `--ink-900`; active `--ink-900` + 2px underline offset 6px; `aria-current` kept.
- Right: three icon buttons — search toggle (`aria-expanded`), saved star → `/saved`,
  Instagram — **44×44px** (fixes the 40px defect), 20px 1.5px-stroke icons, `--ink-700` →
  `--ink-900` hover; focus-visible standard ring.
- <768: `position: static` (tab bar carries nav); wordmark + search + saved only.
- Hidden on `/map*`; returns null on BOH/auth routes (regex centralized — §7 Stage A).

### 4.2 Footer (public) — dark band retired
White, 1px `--hairline-strong` top, padding `--space-9` top / `--space-7` bottom. Rendered as a
SIBLING of `<main>` (landmark fix). Grid 1-col <480 / 2-col <768 / 3-col ≥768 (1.4fr 1fr 1fr).
Existing copy only:
- Col 1: wordmark Fraunces 500 16px; existing tagline 13px `--ink-500`; Instagram icon 44px.
- Col 2: label "Browse" `--t-eyebrow` `--ink-500`; links What's On / Galleries / Map / Saved —
  13px `--ink-700`, 32px rows, hover underline.
- Col 3: label "For galleries" `--t-eyebrow`; auth-aware link (Gallery dashboard / Gallery
  login) — logic unchanged; no console link (kept).
- Base row: `© {year} Sydney Art Finder` `--t-mono` `--ink-500`, hairline top. Mobile adds
  `--tabbar-h` clearance.

### 4.3 Mobile tab bar
Fixed bottom, `--tabbar-h` + safe-area, white, hairline top, hidden ≥768, z `--z-tabbar`.
Four tabs (Home / What's On / Galleries / Map — unchanged). 22px icon + label `--t-eyebrow`
(11px mono uppercase); inactive `--ink-500`, active `--ink-900`; each tab ≥44px tall;
`aria-current` per tab. Stays visible on `/map` (kept).

### 4.4 Section-head
Flex, `justify-content: space-between`, baseline, margin-bottom `--space-5`. **No hairline
underline** — Ocula heads are bare; rhythm comes from bands (hairlines reserved for rows,
ledgers, toolbars). Left: h2 `--t-h2`. Right: action-link `--t-ui` `--ink-700` + trailing `→`
(existing `.link-arrow`), hover `--accent` + underline. Optional serif dek under h2 only where
copy already exists — never invented.

### 4.5 Band
`.band` = full-bleed `--band` wrapper, hairline top+bottom, section padding inside. Used as
Ocula uses it: alternating major home sections, profile Visit, exhibition related-rail 2.
Monogram/placeholder tiles inside a band swap to `--placeholder` to stay distinct. Empty bands
are never rendered.

### 4.6 Exhibition card (grid) — the core primitive
One markup serves grid and list (kept). Ladder (Ocula's exact order, ref_ocula-exh-index):
1. **Media** — 3:2, `--placeholder` bg, radius 0, no border; `CardImage` fade-in (`--dur-3`)
   kept. No image → precinct label centered, `--t-eyebrow` `--ink-400` (honest empty tile, kept).
2. **Body** (padding-top 10px, 4px row gap; whole text block one `<a>`):
   - urgency line (current + endDate ≤7d only): existing "Closes today/tomorrow/in N days" —
     `--t-eyebrow` in `--ink-900`, above the artist line. Decision: **ink over accent** for this
     tag (all three judges: accent is interaction-only, constraint 1; a static fact is not
     interactive).
   - artist — `--t-card-artist` `--ink-900`
   - title — `--t-card-title` `--ink-900`; hover underline offset 3px
   - gallery — `--t-card-text` `--ink-700` (name alone; precinct moves to the mono block)
   - dates — `--t-mono` `--ink-500` (existing `formatDateRange`; degrades via its own
     "Dates TBA" / "From …" / "Until …" fallbacks)
   - location — `--t-mono` `--ink-500`, precinct (or suburb) on its OWN line (Ocula: dates ␤
     city as two mono lines)
3. **Save star** — Ocula's verified position: sibling of the Link, top-right of the TEXT block
   (white disc over image deleted — hairline discipline). 20px star, `--ink-400` → `--accent`
   when saved, 44×44 hit area, `aria-pressed`; body reserves right padding for the hit area.

**"Artist: Title" parse helper (display-only, no lib changes):**
- `artist` present → line 1 = artist; leading `"{artist}:"` / `"{artist} —"` prefix stripped
  from title case-insensitively (kills the double-print).
- `artist` empty AND title matches `^Group Exhibition:\s*(.+)` → line 1 = "GROUP EXHIBITION",
  line 2 = italic remainder (documented convention — EXHIBITION_ENTRY_RULES).
- Otherwise → no artist line; full title italic. Never split an unknown "X: Y" — honesty over
  symmetry. Unit cases required before the masthead ships (§7 Stage A).

Degradation: no image → precinct tile; no artist → 3-line ladder; no endDate → date fallback
text; card never shows status (section grouping carries it) except the ≤7-day urgency line.

### 4.7 Exhibition card (list row)
Same markup inside `.index-list`: media + star hidden; row padding `--space-5` 0, hairline
bottom. ≥768: 2-col grid — col 1 artist (13px UPPERCASE) + italic title 15px + gallery 13px;
col 2 mono date + location right-aligned nowrap. Date-group headers: `--t-eyebrow` `--ink-500`,
`--hairline-strong` bottom (kept).

### 4.8 Gallery card
1. Media 3:2 — `coverUrl` or monogram tile (never `logoUrl`; field dead).
2. name — 13px 500 **plain sentence case** `--ink-900` (constraint 2; corrects the current
   UPPERCASE-600 `.gal__name` — uppercase is the artist register, per ref_ocula-gallery-exh).
3. location — `--t-mono` `--ink-500`: `precinct · suburb` deduped.
4. on-view — `--t-mono` `--ink-500`: existing wording verbatim — "N show(s) on now" /
   "Opening soon"; line omitted when neither (no fake states).
5. Save star as §4.6.

### 4.9 Monogram tile
3:2, `--surface-muted` bg (`--placeholder` inside bands), Fraunces 400 28px initials, +0.05em,
`--ink-400`, centered. Existing derivation fn kept. No border, no radius.

### 4.10 Buttons — one language, public + BOH
All ≥44px height, `--t-ui`, radius `--radius-control`, padding 0 20px, transition `--dur-1`.
Focus-visible: standard ring. The verified Artsy ladder: every variant hovers toward blue.
- **primary** — `--ink-900` bg / `--on-accent` text; hover bg `--accent`; press
  `--accent-press`; disabled bg `--ink-300` (no events).
- **outline** — transparent, 1px `--ink-900` border + text; hover border+text `--accent`;
  press `--accent-press`; disabled `--ink-300` border/text. RARE — one per screen max (Ocula:
  "the only outlined button on the page").
- **text** — borderless, `--ink-700`; hover `--accent` + underline; press `--accent-press`.
  THE default control.
- **danger-text** — as text in `--danger`; underline on hover. No filled danger buttons.
- **block** — width 100% (sheet/auth footers).
- **icon** — 44×44 borderless, `--ink-700` → `--ink-900`.

### 4.11 Inputs / forms
- Field: height 44px, 1px `--hairline-strong`, radius 2px, padding 0 12px, `--t-input`, white
  bg. Hover border `--ink-500`; focus border `--accent` + focus ring; invalid border `--danger`
  + 13px `--danger` message in the existing `role="status"` live region; disabled
  `--surface-muted` bg.
- Label: real `<label>` ABOVE, 13px 500 `--ink-900`, 6px gap. Floating labels rejected
  (unbuildable on date/select in plain CSS; a11y). Hint 13px `--ink-500`.
- Textarea min-height 120px, same skin. Select: native, same skin, 16px chevron.
- `field--line` (underline-only) reserved for search overlay + toolbar search.
- Checkbox: 18px, radius 2px, checked `--ink-900` fill; single `.checkbox-row` recipe.
- lat/lng: **text inputs with `inputMode="decimal"`** (precise arbitrary values — right-control
  rule). Decision: **text+inputMode over `type=number`** (judges: the correct right-control
  reading; avoids spinner/scroll hazards).
- `.form-grid` 2-col ≥480; `.form-stack` gap `--space-4`. Duplicates
  (`.dashboard-form-grid`/`.checkbox-field`/`.form-hint`) deleted.

### 4.12 Chips / filter language — the semantic split (graft from hybrid)
- **Text tab** (navigation/toggles): borderless, `--t-ui` `--ink-500`; hover `--ink-900`;
  active `--ink-900` + 2px `--ink-900` underline; ≥44px hit height; `aria-pressed`. Optional
  count as `<sup>` `--t-sup` `--ink-500` (Ocula's `<sup>` count grammar).
- **Applied token** (the ONLY boxed chip — removable applied state, not navigation):
  `--t-mono` 12px, 1px `--hairline-strong` border, radius 2px, padding 4px 8px, 16px × icon;
  whole token is the remove button, 44px hit. Hover: border + text `--ink-900`. Decision:
  **ink hover over hybrid's danger hover** — `--danger` is reserved for errors/destructive
  actions; removing a filter is neither.
- **Clear-all**: text action-link when >1 token applied (existing behavior).
- Pill `.chip` CSS, `.toggle-chip`, `.filter-pill` deleted.

### 4.13 Window-nav (Time-Spine presentation only — IA locked)
48px row, hairline bottom, horizontally scrollable, scrollbar hidden. Four text tabs (On now /
This weekend / Opening this week / Closing soon) per §4.12 with live `<sup>` counts;
`aria-pressed` kept. Counts computed from the precinct-filtered set so numbers stay honest.
Same component skins What's On (buttons) and Map (`.map-window-bar`, links, "Galleries"
pseudo-window first).

### 4.14 Search overlay
Band under header: white, hairline bottom, `--shadow-pop`, z `--z-search`; `--scrim-soft`
below from `var(--header-h)`. Inside container: `field--line` search input (`--t-input`,
autofocus, visually-hidden real label) + "Close" text button. GET → `/whats-on?search=` kept.
<768: overlay pins to top 0 (header is static — fixes the desktop-tuned inset).

### 4.15 Sheet / drawer
<768 bottom sheet: white, `--radius-sheet`, `--shadow-sheet`, 32×4 `--ink-300` handle, head
`--t-h3` + hairline, footer block primary. ≥768: right drawer 400px, square, hairline left,
`--shadow-pop`. `useDialog` focus trap kept. Map bottom sheet keeps detent logic (collapsed
72px / half / full); visual: white, hairline top, handle as above.

### 4.16 Empty states
ONE recipe (kills the layout.css/whats-on.css collision): `--t-body` `--ink-500` sentence —
existing wording only — + one text or outline reset button. No illustration, no invented copy.
Decision: **15px sans over hybrid's 12px mono** — messages are voice, not facts.

### 4.17 Tables (back-of-house ledger)
Ledger rows, not boxed tables: optional header row `--t-eyebrow` `--ink-500` with
`--hairline-strong` bottom; body rows min-height 56px, hairline bottom, grid-aligned columns.
Cells: primary 13px 500 (exhibition titles italic 400); facts `--t-mono` `--ink-500`; status =
word only `--t-eyebrow` — Published `--ink-900`, Draft/Hidden/Unclaimed `--ink-500` (ink
differentiation only, never hue); actions right-aligned text-links 13px, `--danger` text for
destructive. Row hover `--surface-muted`. ≤480: rows re-stack (thumb left, meta under title,
actions row below).

### 4.18 Page-head
- **Public index:** h1 `--t-page-title` alone, margin `--space-7` top / `--space-5` bottom
  (Ocula's bare "Galleries" h1).
- **Back-of-house:** kicker `--t-eyebrow` `--ink-500` → h1 `--t-h2` (20px) → right-aligned
  single primary action; optional mono sub-line (e.g. "12 total · 9 published").

### 4.19 Stat row
Hairline-ruled N-col grid (1px gaps painted by `--hairline` bg — existing tile trick kept):
cell = count `--t-stat` `--ink-900` + label `--t-eyebrow` `--ink-500`. Public home cells are
links (hover `--surface-muted`); BOH cells static. Serves home window strip, dashboard stats,
console stats — one primitive, one voice.

---

## 5. Per-screen specs

### 5.1 Home `/`
1. **Hero carousel** (logic kept: 6 current-with-image, 5.5s, pause, swipe, dots 44px hits,
   reduced-motion off). Lockup over scrim, Ocula hero grammar: eyebrow "On now" `--t-eyebrow`
   white (drops "· Featured" — window vocabulary only; hero picks by has-image, not a flag) →
   artist `--t-masthead` UPPERCASE white → *title* `--t-masthead-sub` italic → `gallery ·
   dates` `--t-mono` white. 16:9 max-66vh desktop / 4:5 <768.
   Fallback (zero imaged shows): white block — eyebrow "On in Sydney" + statement "Every
   exhibition on in Sydney." `--t-masthead` (existing copy, code_shell-home).
2. **Window strip** — §4.19 stat row, 2-col → 4-col ≥768; links `/whats-on(?when=)`; default
   window links bare `/whats-on` (existing href logic).
3. **"On now"** (white) — section-head + "See all on now →"; 8 cards, 2/3/4-up.
4. **Band "Closing soon"** — 8 cards sorted by endDate; link → `?when=closing-soon`. Rendered
   only when non-empty (no hollow bands).
5. **"Opening this week"** (white) — LEDGER ROWS not cards (openers rarely have images): mono
   date (fixed 110px col `--ink-500`) | *italic title* 15px + gallery 13px `--ink-700`; 52px
   rows, hairline dividers. FIX: fallback-to-"Opening soon" links plain `/whats-on`, never the
   empty `?when=opening-this-week`.
6. **Band "Galleries"** — 8 gallery cards (current-show-first sort kept), "All galleries →".
7. Footer (light).
Mobile: strip 2-col, rails 2-up, hero 4:5. Degradation: sections with zero items don't render;
hero degrades to fallback block. Deleted: `.section-head h2` serif leak (home.css:81), dead
blocks (`.home-intro`, `.home-band`, `.home-precincts`, `.hero__count/__search/__actions`).

### 5.2 What's On `/whats-on`
1. h1 "What's On" `--t-page-title` (the single biggest visible shift — utility register).
2. Window-nav §4.13 with live sup counts.
3. Precinct row — text tabs §4.12, "All Sydney" first, scrollable; active toggles back to all
   (kept).
4. Toolbar (sticky `top: var(--header-h)` ≥768; static below): `field--line` search 44px (max
   320px) · "View on map" text button (carries `when`+`precinct` only — kept) · grid/list icon
   toggle 44px `aria-pressed`.
5. Applied row — `--t-mono` count ("{n} {window} in {precinct}", existing wording) + removable
   search token §4.12.
6. Results — grid default 2/3/4-up; or list ledger with date groups. Full finite list, no
   pagination (Ocula's infinite scroll is pointless at SAF scale).
7. Empty state §4.16 + "See what's on now" reset (kept).
Mobile: toolbar wraps, search full row, rows scroll, grid 2-up. Degradation: cards per §4.6;
zero results → empty state only when a filter is non-default (kept).

### 5.3 Galleries index `/galleries`
1. h1 "Galleries" `--t-page-title`.
2. Toolbar: search · "On now" text tab with `<sup>` current-count (was pill) · "Map" text
   button (carries precinct) · "Filters" text button (opens sheet) · view toggle.
3. Applied row: count + precinct/search tokens.
4. Grid — 4-up gallery cards, all 74, no pagination (19 rows at 4-up: a real finite directory).
5. List view — ledger rows: name 13px 500 PLAIN + `--t-mono` "precinct · suburb · N on now"
   right ≥768 (de-uppercases `.gal-row__name`).
6. Filter sheet §4.15: Precinct + Sort selects, footer "Show N galleries" block primary (kept).
Mobile: 2-up, bottom sheet. Degradation: 29 coverless galleries → monogram tiles; on-view line
omitted when nothing current/upcoming.

### 5.4 Gallery profile `/gallery/[slug]`
1. Back-link "← Galleries" `--t-mono` `--ink-500`.
2. Cover 16:7 full-container if `coverUrl`; absent → SKIP straight to lockup (45/74 have
   covers; the lockup stands alone).
3. Lockup: h1 gallery name `--t-masthead` Title case (never uppercase — gallery register) +
   `--t-mono` "precinct · suburb". Actions right (wrap below <768): Follow OUTLINE button
   (toggles to primary look when following; localStorage logic kept) + Share text button.
   Logo slot DELETED from markup (logoUrl empty everywhere — code_data-layer).
4. Sticky tabs (scroll-spy kept): text tabs §4.12, `top: var(--header-h)`, tokenized
   scroll-margins; rendered only with ≥2 content-driven sections (kept).
5. Exhibition sections: h2s PROMOTED from mono eyebrows to `--t-h2` 20px ("On now", "Opening
   soon" — Ocula runs full h2s here). On now / Opening soon = card grids (3-up ≥768 — fuller at
   1–3 shows). **Past = ledger rows, not cards** (reference data; keeps the page short).
6. About — `--t-serif`, max-width 64ch, single paragraph (no invented Read More).
7. Band "Visit": 2-col ≥768 — Hours (label `--t-eyebrow`, lines `--t-mono` 13px) | def-list
   (dt `--t-eyebrow` `--ink-500` 110px, dd 13px; Address/Phone/Email/Website/Instagram —
   existing rows only, links hover `--accent`). Footer "Get directions" outline button (kept).
Mobile: lockup stacks, tabs scroll, Visit 1-col. Degradation: missing about/visit/exhibitions →
section + tab simply absent; zero exhibitions → existing "No exhibitions listed yet."

### 5.5 Exhibition page `/exhibition/[slug]` — thin action leaf (IA locked)
1. ExhibitionBackLink (window-aware referrer logic kept verbatim).
2. **Masthead**:
   - kicker row: status word + precinct `--t-eyebrow`, justified apart, 1px `--ink-900` bottom
     rule (kept signature).
   - h1: **artist UPPERCASE `--t-masthead`** when artist exists; else the parsed title. Ocula's
     exact hero order — ARTIST → *title* (ref_ocula-gallery-exh §B.4); the current build has it
     backwards.
   - sub: *exhibition title* `--t-masthead-sub` (prefix-stripped per §4.6 parser).
   - byline: dates `--t-mono` 500 + gallery link 13px with `→` in `--accent` (a real link —
     accent legitimate).
   - actions: "Get directions" outline + Share text (kept; still no Save on the leaf — save
     lives on cards).
3. **Plate** — single image, max-height 72vh, width auto. No image → NOTHING (no placeholder
   plate on the leaf).
4. **About** — summary `--t-serif`, 64ch (only if present).
5. **Details ledger** (the spec-sheet primitive): 2px `--ink-900` top rule; rows 130px/1fr;
   dt `--t-eyebrow` `--ink-500`; dd `--t-mono` 13px `--ink-900`; hairline row bottoms; stacks
   <480. Facts, each ONE home, only when data exists: Opening (`openingInformation`) /
   **Cost** (real field, defaults 'Free' — graft from hybrid; currently unrendered) / Address /
   Hours. Never `openingTime` (known-empty).
6. "More at {gallery}" — ≤3 cards, 3-up.
7. Band "Closing soon across Sydney" — ≤3 cards (21-day logic kept).
Mobile: masthead clamps to 28px, ledger stacks, rails 2-up. Degradation: no artist → title-only
masthead; no image/summary → sections absent; empty rails not rendered.

### 5.6 Map `/map` — MAP_MINIMAL_SPEC contracts locked; visual re-skin only
- Basemap CARTO light_nolabels + labels overlay; zoom 12 CBD; clusters on load (kept).
- Window bar: §4.13 text tabs on white hairline strip inside top overlay; "Galleries"
  pseudo-window first (kept).
- Top overlay: back button + `field--line` search + filter icon button — flat white bar,
  hairline bottom.
- Markers: 10px `--ink-900` dots, 1px white halo; selected 12px `--accent`; labels `--t-mono`
  11px with white halo. Clusters: white circle, 1px `--hairline-strong`, mono `--ink-900`
  count. Popup: white, 1px `--hairline-strong`, radius 2px, `--shadow-pop`; title 13px 500,
  meta mono, "View gallery" text-link.
- Floating controls (locate, "Search this area"): `--radius-pill` (the sanctioned exception),
  white, 1px `--hairline-strong`, 44px, `--t-ui`.
- Bottom sheet: detent logic kept; applied row uses §4.12 tokens; exhibition rows = list-row
  grammar (italic title 14–15px, mono dates, gallery 12px `--ink-500`); gallery rows = name
  13px 500 plain + mono meta; selected row `--accent-tint` bg.
- Selection card: white, 1px `--hairline-strong`, `--shadow-pop`, radius 2px; name 15px 500,
  mono meta; show rows: status WORD `--t-eyebrow` (no tag pills) + italic title + mono dates;
  "View gallery" primary. Desktop 360px fixed left panel; swipe-dismiss kept.
- Desktop ≥1024: split map/list grid (kept — constraint 9).
- All Leaflet-DOM re-skins (`.leaflet-*`, `.marker-cluster*`) live in `vendor-overrides.css`
  (§6); map.css styles only our own DOM. `--color-*` alias layer deleted after rewrite.
Degradation: invalid coords excluded (never 0,0 — kept); map init failure → existing fallback
block linking `/galleries`.

### 5.7 Saved `/saved`
h1 "Saved" `--t-page-title`. Two sections (Exhibitions / Galleries), h2 `--t-h2` + 2/3/4-up
grids (kept). Empty: existing "Nothing saved yet. Tap the star…" §4.16. No search overlay here
(kept).

### 5.8 Auth `/login`, `/forgot-password`, `/reset-password`
Chromeless (kept). White page, centered column max-width 400px, top padding `--space-10`,
**no card border** (the white page is the card; nested-box ban): wordmark Fraunces 16px → h1
`--t-h2` (existing copy: "Gallery sign in" etc.) → existing copy 13px `--ink-500` → fields
§4.11 stacked gap `--space-4` → primary block button → text links ("Forgot your password?" /
"Back to sign in") 13px. Errors `--danger` 13px in the existing `role="status"` region.
Non-enumerating forgot-password confirmation kept. Reset keeps dual invite/reset behavior.

### 5.9 Dashboard shell `(dashboard)`
≥1024: left sidebar `--boh-nav-w`, white, hairline right — brand wordmark Fraunces 15px +
eyebrow sub; links Overview / Profile / Exhibitions 13px 500, 44px rows, active `--ink-900` +
2px `--ink-900` left rule; bottom group: Console (super-admin only), View site, Sign out
(text-links). <1024: top bar, links horizontally scrollable. Content max-width 880px, gutter
padding. Same tokens as public — no SaaS skin.

### 5.10 Dashboard home `/dashboard`
1. Page-head §4.18: kicker precinct → h1 gallery name 20px → state-driven primary CTA right
   (Complete your profile / Add exhibition — logic kept).
2. Stat row §4.19: Exhibitions · Published · Profile ("Complete"/"Needs setup" as `--t-eyebrow`
   word, not a badge).
3. Setup checklist — ledger rows (existing items: about, cover, coordinates, first exhibition),
   13px + `›` chevron `--ink-400`, hairline dividers, each row a ≥44px link.
4. Quick actions — text-links row: Manage exhibitions · Edit profile · View public page.
Multi-gallery hint kept 13px `--ink-500`. Boxes deleted: dash-cards → stat row; badges → words;
panels → flat hairline-separated sections. Degradation: no linked gallery → existing empty
state.

### 5.11 Dashboard exhibitions `/dashboard/exhibitions`
Page-head: h1 "Exhibitions" 20px + mono sub "N total · M published" + "Add exhibition" primary.
Table §4.17: thumb 64px 3:2 (placeholder tile when no image) | *italic title* + mono
"artist · dates" | status word | actions Edit · Publish/Unpublish text-links (inline form
kept). Empty: existing copy + Add CTA. ≤480 rows re-stack.

### 5.12 Exhibition form `/dashboard/exhibitions/new`, `/[id]`
Back-link mono "← Exhibitions". h1 20px. Single column max 560px, §4.11 stack in current field
order: Title (req) → Artist(s) → Start/End date 2-col → Opening information → Cost/Location
2-col → Summary textarea → Image upload (3:2 preview on `--placeholder`, hairline border, file
button styled as outline, "Uploading…" mono hint, "Remove image" danger-text; `/api/uploads`
flow kept) → Published checkbox. Sticky bottom bar (kept): white, hairline top, Save primary
("Saving…" pending) + Cancel text-link. Delete (edit only): hairline-divided end block,
danger-text + `window.confirm` (kept). Errors in live region.

### 5.13 Profile editor `/dashboard/profile`
Sectioned settings form (kept): ≥1024 two-col — 220px head col (h3 `--t-h3` + hint 13px
`--ink-500`) | fields col; hairlines between sections, no boxes. Sections: Identity / Location
(lat/lng per §4.11 — text `inputMode="decimal"`) / Contact / Hours & about (line-per-entry
textarea kept) / Images — **cover (3:2) upload ONLY; the logo upload tile is REMOVED**
(logoUrl empty across all 74 galleries — dead control, constraint 7). Sticky save bar: Save
primary + "View public page" text-link; success/error words in live region.

### 5.14 Console `/console`, `/console/galleries`, `/console/exhibitions`
Same shell, brand "SAF Console".
- Home: h1 "Overview" 20px; stat row §4.19 (Galleries · Claimed · Live exhibitions · Hidden);
  Invite form — 480px column: native gallery select (claimed-suffix kept) + email + "Send
  invite" primary; live-region status.
- Galleries: table §4.17 — name 13px 500 plain | mono "precinct · claimed/unclaimed" |
  visibility word (Visible `--ink-900` / Hidden `--ink-500`) | actions View · Hide/Unhide
  (danger-text for Hide); inline forms kept.
- Exhibitions: table — *italic title* | mono "gallery · start · source" (source only when ≠
  manual) | status word (Published/Draft/Hidden) | View · Hide/Unhide.
`.status-tag/.status-*` color classes and `.badge*` retired; `.dashboard-row`/`.dash-row`
duplication collapses into the one table primitive.

---

## 6. CSS architecture

```
app/styles/
  tokens.css              @layer declaration + :root tokens ONLY (§2 verbatim)
  reset.css               @layer base — box-sizing, margins, media defaults, reduced-motion
                          kill, .visually-hidden, .skip-link, ::selection, focus-visible
  type.css                @layer base — element rules (h1–h3 inherit-only, a, p) + text atoms:
                          .u-eyebrow .u-mono .u-sup .u-page-title .u-title-work .u-serif .u-stat
  layout.css              @layer layout — .shell .container(--narrow) .section .band
                          .section-head .card-grid .ledger .stat-row .index-list .date-group
                          .results-meta .empty-state   ← single owners, defined ONCE
  components/             @layer components —
    header.css  footer.css  tabbar.css  search-overlay.css
    card-exhibition.css  card-gallery.css  save.css
    buttons.css  forms.css  textlink.css        (text tabs, action-links, applied tokens)
    window-nav.css  toolbar.css  sheet.css
    table.css  page-head.css                    (back-of-house shared)
  pages/                  @layer pages —
    home.css  whats-on.css  galleries.css  profile.css  exhibition.css
    map.css  saved.css  auth.css  dashboard.css  console.css
  vendor-overrides.css    UNLAYERED — every rule targeting Leaflet/markercluster DOM
                          (.leaflet-*, .marker-cluster*) lives here and ONLY here
  compat.css              UNLAYERED, migration-only shim for legacy classnames; deleted Stage D
```

**Layering (graft from artsy-faithful — Decision: `@layer` over order-only cascade because it
is the only structural fix for both documented override traps):** `tokens.css` opens with
`@layer base, layout, components, pages;`; every file wraps its rules in its named layer.
A page rule beats a component rule only because the `pages` layer is declared later — declared
intent, not import-order accident. Leaflet's vendor CSS is unlayered and beats ANY layered rule
regardless of specificity, so all Leaflet re-skins live in the equally-unlayered
`vendor-overrides.css`, imported after everything.

**Import order (`app/layout.js`):** leaflet + markercluster vendor CSS → `tokens.css` →
`reset.css` → `type.css` → `layout.css` → `components/*` → `pages/*` → `vendor-overrides.css`
→ `compat.css` (until Stage D).

**Naming law (BEM-ish `block__elem--mod`, `is-*` state):**
1. **Page files own only page-prefixed blocks** — `.home-*`, `.wo-*`, `.gxi-*` (galleries
   index), `.gxp-*` (gallery profile), `.exl-*` (exhibition leaf), `.map-*`, `.saved-*`,
   `.auth-*`, `.dash-*`, `.con-*`. A page file MUST NOT contain a selector for a layout/
   component class — the `.section-head h2` and `.results-meta` leaks become lintable
   violations. Enforced by a 5-line grep in CI/pre-commit (graft from hybrid).
2. **Shared look = component modifier**, never a page override: variants (`.toolbar--slim`,
   `.ex--row`) live in the component's own file.
3. **Tokens are the only cross-file contract**: no component reads another component's class;
   all offsets via `--header-h`/`--tabbar-h`; z-index only via the ledger.

**Deletions ledger (Stage D):** chips.css pills, tags.css status colors, dark-footer tokens,
6px/12px radii, dead tokens (§2.2 list), `.toggle-chip`/`.filter-pill`/`.checkbox-field`/
`.dashboard-form-grid`/`.form-hint` duplicates, dead home.css blocks, legacy `.button*` compat
block (JSX re-pointed at `.btn*`), `.status-tag/.badge` families, `--color-*` aliases +
`--font-manrope`, compat.css itself.

---

## 7. Build-order plan (file ownership per stage; parallel agents never share a file)

**Stage A — foundation + chrome + primitives (ONE agent, serial; everything shared lives here).**
Owns: `app/layout.js` (font weights trimmed, new import chain), `tokens.css`, `reset.css`,
`type.css`, `layout.css`, `compat.css`, `vendor-overrides.css` (skeleton), all of
`components/*.css`, and these components: `SiteNav` + chromeless-route regex centralized into
one shared constant, `SiteFooter` (new light markup, sibling-of-main), tab bar, search overlay,
`ExhibitionCard` (+ `splitTitle` display helper WITH unit cases: `"Artist: Title"`,
`"Group Exhibition: X"`, artist-empty, prefix-mismatch), `GalleryCard`, `SaveButton`, monogram,
buttons/forms/textlink/window-nav/toolbar/sheet/table/page-head. Ships green: compat.css keeps
old classnames alive.
**Gate A:** build passes; header 44px targets verified; card renders all four parse cases.

**Stage B — public pages (FOUR agents in parallel; disjoint files).**
- **B1 Home:** `pages/home.css`, `HomePage.js`, `HeroBanner.js` (lockup re-type, eyebrow
  "On now", opening-link fix, stat-strip markup).
- **B2 Indexes:** `pages/whats-on.css`, `pages/saved.css`, `WhatsOnPageClient.js`,
  `SavedPageClient.js` (window-nav consumption, applied tokens, toolbar, list ledger).
- **B3 Profiles:** `pages/galleries.css`, `pages/profile.css`, `pages/exhibition.css`,
  `GalleriesPageClient.js`, `GalleryProfilePage.js`, `GalleryTabs.js`,
  `ExhibitionProfilePage.js`, `ExhibitionBackLink.js` (masthead flip, ledger + Cost, banded
  Visit, past-as-rows, logo slot removal, de-uppercased rows).
- **B4 Map:** `pages/map.css` (rewrite on real tokens), `vendor-overrides.css` (Leaflet
  re-skins move here), `MapPageClient.js` (class swaps only — ZERO logic edits).
**Gate B:** each page 390/1280 screenshots; map contracts re-verified at both widths against
live Leaflet DOM.

**Stage C — back-of-house (ONE agent; shares nothing with B).**
Owns: `pages/auth.css`, `pages/dashboard.css`, `pages/console.css`, `DashboardNav.js`,
`ConsoleNav.js`, auth pages/forms, dashboard pages, `ExhibitionForm.js`,
`ProfileEditor.js` (logo field removed; lat/lng inputMode), `ImageUploadField.js`,
`InviteGalleryForm.js`, console pages. May run in parallel with Stage B.
**Gate C:** status words (no badges), stat rows, ledger tables, sticky save bars verified.

**Stage D — sweep (ONE agent, serial, last).**
Delete compat.css + full deletions ledger; run the namespace grep; contrast + 44px tap-target
audit on every screen; reduced-motion pass; 390/1280 screenshots per screen (AGENTS gates);
confirm no `font:` shorthand uses an aliased family var; confirm zero page-file selectors on
shared classes.

Risk notes: Stage A's card DOM change propagates to saved page and map selection rows
atomically (same components). B4 must not touch card/save files (owned by A). The parse helper
lands with tests in A because B1 (hero), B3 (masthead) and B2 (rows) all consume it.

---

## 8. Superseded docs

This spec REPLACES the design/visual authority of these root-level legacy docs (they remain in
the repo as history until deleted; where they conflict with this file, THIS FILE WINS):

- `DESIGN_GUIDE.md` — IA + per-screen blueprints superseded (pre-Time-Spine); its durable card/
  state-preservation intents are absorbed here.
- `DESIGN_LOCK.md` — direction + hard-don'ts absorbed (§1, §2); its pre-Time-Spine screen
  blueprint superseded.
- `STYLE_GUIDE.md` — token set fully superseded by §2 (it mandated #f7f7f5/#0f4c81/2 families;
  all long dead).
- `EXHIBITION_CARD_HIERARCHY_GUIDE.md` — superseded by §4.6–4.7 (content-order intent
  absorbed; type values were stale).
- `WHATS_ON_POLISH_SPEC.md` — superseded by §5.2 (Filters-sheet IA retired by Time-Spine).
- `AGENTS.md` design/IA sections (§“Screen architecture”, visual system) — superseded; its
  PROCESS gates (build passes, 390/1280 screenshots, per-screen justification) REMAIN in force.
- `AIRBNB_MAP_INTERACTION_GUIDE.md`, `UX_RESEARCH_IMPLEMENTATION_BRIEF.md`,
  `PROGRESSIVE_DISCLOSURE_UX_GUIDE.md`, `MONITORING_CORRECTIONS.md` (and any other root design
  docs in the AGENTS precedence chain) — superseded as design authority; monitoring-corrections
  a11y items are encoded in §4.
- NOT superseded: `MAP_MINIMAL_SPEC.md` (binding contracts, constraint 9 — §5.6 implements
  it), `EXHIBITION_ENTRY_RULES.md` (data-entry SOP; the §4.6 parser encodes its naming
  convention), `docs/PLATFORM_RUNBOOK.md` (ops).

---

## 9. Traps (from production history — verbatim from the brief; respect these)

- `--font-text` MUST be the direct next/font variable; a nested var alias inside `font:`
  shorthand silently kills every such rule (all sans text falls back to Times).
- `.gitignore` has anchored `/Icon?` — never name a component file `Icon*` at repo root...
  components/icons/* is fine now but keep filenames clear of the macOS Icon rule.
- Pages CSS imports last and can silently override component CSS — the new architecture
  should make override intent explicit, not accidental (current .results-meta/.empty-state
  collisions are documented warts to eliminate).
- Sticky offsets (header 60px etc.) are magic numbers today — tokenize (--header-h).
- Leaflet/markercluster CSS is vendor-imported globally; map re-skin rules must survive it.

Spec-level answers: trap 1 → §2.3 fonts note + Stage D check; trap 2 → §6 naming law; trap 3 →
§6 `@layer` + page-prefix law; trap 4 → `--header-h`/`--tabbar-h` tokens (§2.3); trap 5 →
unlayered `vendor-overrides.css` imported last (§6).
