> **SUPERSEDED by /DESIGN_SPEC.md (2026-07-07) — kept as history.**
> This file is no longer design/IA authority; where it conflicts with DESIGN_SPEC.md, DESIGN_SPEC.md wins.

# Sydney Art Finder - Exhibition Card Hierarchy Guide (Mandatory)

This guide defines what exhibition list cards/rows should show by default.
It exists to keep listings scannable and prevent information overload.

If implementation conflicts with this guide, this guide wins.

## 1) Core Principle
Every exhibition list item must answer, in this order:
1. What is it? (title + artist)
2. When is it on? (date range/opening signal)
3. Where is it? (gallery + precinct)
4. What can I do next? (`View details`)

Do not show low-priority details by default in list rows.

## 2) Required Content Order (Default List View)

1. Status indicator (`Current` / `Upcoming` / `Past`)
2. Exhibition title (primary text)
3. Artist(s)
4. Gallery name + precinct
5. Date range
6. Opening line (only if available and useful)
7. Primary CTA to `/exhibition/[slug]`

Optional:
- Secondary link to gallery profile (de-emphasized).

Not allowed in default list rows:
- Full summary paragraphs
- Long curatorial text
- Multi-action button stacks
- Extended metadata blocks

## 3) Typography Hierarchy (Exact Intent)

Use a clear visual ladder:
- Title:
  - size: `1rem` to `1.0625rem`
  - weight: `700`
  - line-height: `1.3-1.4`
  - clamp to 2 lines max
- Artist:
  - size: `0.9375rem`
  - weight: `600`
  - line-height: `1.4`
  - clamp to 1 line (2 lines only if necessary)
- Gallery + precinct:
  - size: `0.875rem`
  - weight: `500`
  - muted color
- Date/opening metadata:
  - size: `0.875rem`
  - weight: `500`
  - muted color
- Status pill:
  - size: `0.75rem - 0.8125rem`
  - medium/semibold
  - understated background

## 4) Layout Hierarchy (Row/Card)

Top row:
- left: title block
- right: status pill

Middle:
- artist
- gallery + precinct

Lower:
- date range
- opening signal (if relevant)

Bottom:
- one clear primary action (`View details`)

Keep vertical rhythm tight and consistent.
Avoid adding decorative dividers inside each card unless absolutely needed.

## 5) Information Density Limits

Fail conditions:
1. More than 6 text lines (excluding CTA) in default list row.
2. Summary paragraph shown by default.
3. More than one primary action in a row.
4. User cannot identify what/when/where in under 3 seconds.

## 6) Progressive Disclosure Requirement

All extended exhibition detail belongs in `/exhibition/[slug]`, not list rows.

Move to detail page:
- full summary/description
- curatorial text
- extended event/program details
- long logistics blocks

## 7) Accessibility Requirements
- All row CTAs must be keyboard accessible.
- Touch targets >= 44px.
- Text contrast meets WCAG AA.
- Status must be conveyed by text, not color alone.

## 8) Acceptance Checklist
Implementation is not complete unless all pass:
1. Default row communicates what/when/where quickly.
2. Row stays concise (no summary paragraph).
3. Primary CTA goes to `/exhibition/[slug]`.
4. Typography clearly distinguishes title from metadata.
5. Rows are visually consistent across What's On and any other exhibition lists.
