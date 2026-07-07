> **SUPERSEDED by /DESIGN_SPEC.md (2026-07-07) — kept as history.**
> This file is no longer design/IA authority; where it conflicts with DESIGN_SPEC.md, DESIGN_SPEC.md wins.

# Sydney Art Finder - Design Lock (Mandatory)

This document is mandatory for UI decisions.
If any current implementation conflicts with this file, this file wins.

Benchmarks (for structure and visual discipline):
- https://ocula.com
- https://www.artsy.net

Goal:
- Standard, familiar, clean art-platform UX.
- No experimental layouts.
- No improvised visual language.

## What to Emulate (High-level Patterns)

### 1) Clear content rails
- Use one primary reading column per screen.
- Keep secondary controls compact and predictable.
- Avoid stacking many different components in one viewport.

### 2) Editorial hierarchy
- Clear section titles.
- Concise metadata lines (gallery, precinct, dates).
- Repeating card/list system with consistent spacing and typography.

### 3) Predictable navigation
- Top-level nav should map to primary tasks only.
- Each screen has a single job.
- Use familiar flows: browse list -> open profile -> return with state preserved.

### 4) Controlled visual system
- Neutral base palette.
- One accent color max.
- Minimal borders and minimal shadows.
- Strong typography and whitespace over decoration.

## Hard Do/Don't Rules

Do:
- Keep layouts simple and familiar.
- Keep filter UI compact and task-focused.
- Use consistent card/list templates across pages.
- Prioritize readability and speed on mobile first.

Don't:
- Don't use heavy gradients, textures, or decorative glows.
- Don't nest bordered containers repeatedly.
- Don't put map + complex filters + long lists all in one dense block.
- Don't invent unusual interactions where standard controls work.

## Screen Blueprint (Must Follow)

### Home
- Intro + 2 clear CTAs.
- Optional short highlights only.
- No deep filtering modules.

### What's On
- Default Current + Upcoming.
- Lightweight filters at top.
- Results list below with consistent card pattern.

### Galleries
- Directory list with search/filter/sort.
- Simple, scannable rows/cards.
- Map is not the main element on this screen.

### Map
- Dedicated map-first screen.
- Synced result count/list.
- Search in this area + clustering.

### Gallery Profile
- Gallery identity + practical details first.
- Current/Upcoming/Past exhibition groups.
- No unrelated global controls in profile body.

## Mobile Quality Gate
A screen fails if any condition is true:
- Requires excessive scrolling before first useful action.
- Contains visually noisy nested boxes.
- Tap targets are cramped.
- Too many control types above the fold.
- Hard to scan in under 5 seconds.

## Implementation Constraint for Agent
Before shipping any UI change, the agent must provide:
1. Which screen was changed.
2. How the change improves clarity against this design lock.
3. Why it is closer to Ocula/Artsy structure (not visual copying, structural quality).
4. Confirmation that no decorative clutter was introduced.
