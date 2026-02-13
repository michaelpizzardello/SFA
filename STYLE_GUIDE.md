# Sydney Art Finder - Style Guide (Mandatory)

This guide defines exact visual standards for the UI.
If implementation differs from this guide, implementation is wrong.

## 1) Design Principles
- Content first: data and navigation clarity over decoration.
- Familiar patterns: use conventions users already understand.
- Reduction: remove anything that does not improve comprehension.
- Consistency: same elements should look/behave the same everywhere.

## 2) Color Tokens (Use Exactly)
Use these tokens only unless explicitly approved.

```css
:root {
  --color-bg: #f7f7f5;
  --color-surface: #ffffff;
  --color-surface-muted: #f2f2ef;
  --color-text: #141414;
  --color-text-muted: #5f5f5a;
  --color-border: #d9d9d2;
  --color-accent: #0f4c81;
  --color-accent-hover: #0c3f6b;
  --color-success: #216e4a;
  --color-warning: #8a5a16;
}
```

Rules:
- One accent color only (`--color-accent`).
- No additional gradient palettes.
- No glow overlays.
- Minimum body text contrast: WCAG AA.

## 3) Typography

### Font roles
- Heading font: one serif OR one sans display font.
- Body/UI font: one readable sans.
- Maximum font families: 2.

### Type scale
- H1: `clamp(1.75rem, 3.2vw, 2.5rem)`
- H2: `clamp(1.35rem, 2.4vw, 1.85rem)`
- H3: `1.125rem`
- Body: `1rem`
- Small/meta: `0.875rem`

### Text rules
- Line-height body: `1.5 - 1.65`
- Line-height headings: `1.15 - 1.25`
- Do not use all-caps for long labels.
- Use muted text only for secondary metadata.

## 4) Spacing System
Use 8px baseline scale.

- `--space-1: 4px`
- `--space-2: 8px`
- `--space-3: 12px`
- `--space-4: 16px`
- `--space-5: 24px`
- `--space-6: 32px`
- `--space-7: 40px`
- `--space-8: 48px`

Rules:
- Vertical section rhythm must use scale values only.
- No arbitrary spacing values unless documented.
- On mobile, prefer fewer larger gaps over many tiny gaps.

## 5) Borders, Radius, Shadow

### Borders
- Default border: `1px solid var(--color-border)`
- Use borders sparingly; avoid nesting borders inside borders.
- Maximum nested bordered containers per viewport section: 1.

### Radius
- Small controls: `8px`
- Cards/blocks: `12px`
- Avoid pill style by default; use pills only for chips/tags.

### Shadow
- Default: none.
- Optional card shadow: very subtle (`0 1px 3px rgba(0,0,0,0.06)`).
- Never stack heavy shadows and borders together repeatedly.

## 6) Component Standards

### Navigation
- Top nav items: 3-5 max.
- Active state must be clear via color and weight, not flashy effects.
- Mobile nav must not overlap key content.

### Buttons
- Minimum height: `44px`.
- Primary button uses accent color.
- Secondary button uses neutral surface + border.
- Max 2 button variants in MVP (primary/secondary).

### Inputs
- Height: `44px` minimum.
- Border + focus ring required.
- Placeholder text must remain readable.

### Cards/Rows
- Prefer simple rows first; cards only when content needs grouping.
- Card internals: title -> metadata -> supporting details -> CTA.
- No decorative backgrounds inside cards.

### Chips
- Use only when they speed up filtering.
- Max chip rows above results: 2.
- Chip style should be understated.

## 7) Motion and Interaction
- Transition duration: `100-180ms`.
- Use subtle opacity/color transitions only.
- Avoid load-in animations on every panel.
- Respect `prefers-reduced-motion`.

## 8) Responsive Rules
- Design breakpoints: `375`, `768`, `1024`, `1280`.
- Mobile-first CSS required.
- On mobile, single-column content by default.
- Do not push primary content below oversized hero blocks.

## 9) Content Density Rules
- Above the fold on mobile must include clear purpose + one action.
- Avoid stacking more than 3 control groups before first results list.
- Metadata lines should be concise and consistent in order.

## 10) Explicit Anti-Patterns (Fail Conditions)
UI fails review if any occur:
- Heavy gradients/background textures dominate content.
- Repeated border-within-border-within-border patterns.
- More than one visual style for cards doing same job.
- Overly decorative header that competes with content.
- Inconsistent spacing between similar blocks.

## 11) QA Checklist (Must Pass)
Before handoff, confirm all:
1. Color usage matches token list.
2. Typography follows defined scale.
3. Touch targets are >= 44px.
4. No cluttered nested borders.
5. Screen is scannable in under 5 seconds.
6. Visual style matches restrained editorial tone.
