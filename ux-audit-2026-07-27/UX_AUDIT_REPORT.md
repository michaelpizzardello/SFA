# Sydney Art Finder — UX, Visual and Functional Audit

**Date:** 27 July 2026
**Scope:** Read-only testing only. No application code or live data was changed.
**Overall verdict:** The public site has a strong, coherent visual foundation, but it is not ready for release without fixing the global search and core map journeys.

## Executive summary

Sydney Art Finder already feels editorial, calm and credible. Home, What's On, Galleries, gallery profiles and exhibition pages have clear jobs, strong hierarchy and generally good responsive behaviour. Filters are progressively disclosed, empty states are useful, no-image records degrade gracefully, and the main public navigation is easy to understand.

The audit found three release-blocking interaction failures:

1. Global search is effectively unusable on mobile because the search field opens underneath the fixed header. This was reproduced in a 390px browser viewport and on an Android 15 emulator.
2. Returning to the map from a selected gallery can restore the URL and preview card while leaving all map markers missing.
3. Desktop map result rows navigate directly to a gallery instead of selecting and centring the matching marker, breaking the required map/list synchronisation.

The next most important problems are the unreliable first appearance of **Search this area**, incorrect focus handling in the map filter sheet, duplicate exhibition records, and loss of list context on the visible exhibition back link.

## Method and coverage

Testing combined:

- Physical clicking, typing, scrolling, filtering, saving, browser back/forward and map interaction.
- Mobile browser testing at **390 × 844**.
- Desktop browser testing at **1280 × 900**.
- Android emulator testing on **Android 15 / API 35**, approximately 360 logical pixels wide.
- Visual inspection of public, authenticated dashboard and console routes.
- Keyboard/focus and target-size spot checks.
- Empty, missing-image, missing-cover, invalid-route and return-state edge cases.
- Production build and existing automated tests.

Routes covered:

- `/`
- `/whats-on`
- `/galleries`
- `/map`
- `/saved`
- `/gallery/[slug]`
- `/exhibition/[slug]`
- `/dashboard`
- `/dashboard/exhibitions`
- `/dashboard/exhibitions/new`
- `/dashboard/profile`
- `/console`
- `/console/galleries`
- `/console/exhibitions`
- invalid/404 route

The unauthenticated login, forgot-password and reset-password screens were not tested because the available browser session was already authenticated. No logout, create, edit, publish or delete action was performed because this audit was strictly read-only.

## User stories and outcomes

| User story | Outcome | Notes |
|---|---|---|
| Discover what is on now or soon | Pass | The default hierarchy is clear and the first result is reached without excessive dead space. |
| Filter to openings this week, open a show, then return | Partial | Filter and browser return state work, but the page's visible back link can point to the gallery instead of the originating list. |
| Search and filter the gallery directory | Pass | Search, precinct, sorting, tokens and reset behaviour all worked. |
| Save a gallery and view it later | Pass | Save state and the Saved page worked. |
| Find visit details for a gallery | Partial | Details are clear, but profile section tabs do not remain visible as specified when scrolling. |
| Use global search from the header | Fail | Mobile input is obscured; desktop submission repeatedly failed to navigate during testing. |
| Explore galleries by marker, open one, then return to the map | Fail | The selection opens correctly, but markers can disappear after returning. |
| Select a gallery from the desktop map results and see it on the map | Fail | The row navigates away instead of synchronising with the marker. |
| Move the map and search the new area | Partial | It works once offered, but the first user movement can fail to reveal the action. |
| Understand an exhibition with no image | Pass | The no-image detail view remains balanced and complete. |
| Recover from no search results | Pass | The explanation, active filter token and reset action are clear. |
| Recover from an invalid URL | Pass | The 404 state is clear and offers a route home. |
| Find a particular exhibition in the management console | Poor | The 272-row page has no search or filter and is over 33,000px tall. |

## Prioritised findings

### P0 — Release blockers

#### 1. Mobile global search opens underneath the fixed header

**Observed:** The search input opens at the top of the page behind the 56px fixed header. Only a few pixels of the field remain exposed, so the user cannot see or reliably operate it. Android testing reproduced the same result: tapping Search changed the icon state but showed no usable field.

**Impact:** A primary site-wide discovery path is unavailable to mobile users.

**Recommendation:** Place the mobile search surface below the fixed header or above it in the stacking order, reserve its full height, move focus into the field, and provide an obvious close action. Test with the software keyboard open at 360–430px.

Evidence: `screenshots/global-search-overlay-mobile-broken-390.png`, `screenshots/android-global-search-broken.png`.

#### 2. Returning from a selected gallery can leave the map without markers

**Observed:** A marker was selected, its gallery opened, then browser Back was used. The URL and selected-gallery preview were restored, but marker and cluster count stayed at zero after waiting ten seconds.

**Impact:** The user returns to a visually broken spatial view and cannot continue browsing.

**Recommendation:** Restore viewport, filters, selected gallery and marker layer as one state transition. Do not render the restored preview until the marker layer is ready. Add a regression test for map → gallery → back on mobile and desktop.

Evidence: `screenshots/map-mobile-back-restoration-broken-390.png`.

#### 3. Desktop map results do not synchronise with map markers

**Observed:** Clicking a gallery in the desktop result list navigated directly to the gallery profile.

**Impact:** This bypasses the map's local preview and prevents users from seeing where the selected gallery is. It breaks the bidirectional map/list behaviour required by the product specifications.

**Recommendation:** First click should select the row, centre/highlight the matching marker and open the local preview. Navigation to the gallery should happen only through the preview's explicit **View gallery** action.

### P1 — High priority

#### 4. Global search submission did not navigate on desktop

**Observed:** Enter, the submit control and repeated physical browser input left the user on the current page rather than opening search results.

**Impact:** Even where the overlay is visible, the main search journey is unreliable.

**Recommendation:** Make submission deterministic, preserve the query in the resulting URL, and add browser-level tests for Enter and click submission. Because this was tested in a local development environment, confirm again in the deployed preview after correction.

#### 5. “Search this area” can fail to appear after the first map movement

**Observed:** The first user zoom/pan changed the viewport and URL but did not expose the action. A later movement did, and the action then worked correctly.

**Impact:** Users can reasonably believe results are already updated for the new area or may not discover how to refresh them.

**Recommendation:** Distinguish initial programmatic map settling from the first genuine pointer/touch movement. Any user-caused viewport change should reveal the action immediately.

Evidence: `screenshots/map-mobile-after-pan-no-search-area-390.png`.

#### 6. Map filter sheet leaves focus on the obscured background control

**Observed:** Opening map filters left keyboard focus on the underlying Filters trigger behind the scrim. The gallery-directory filter sheet correctly moved focus to its Close control.

**Impact:** Keyboard and assistive-technology users can lose their place or operate controls behind the dialog.

**Recommendation:** Move focus into the sheet, contain focus while open, support Escape, and return focus to Filters on close.

Evidence: `screenshots/map-filters-mobile-390.png`.

#### 7. Exhibition back link loses the originating list context

**Observed:** After opening *Director's Choice* from **Opening This Week**, the visible page link read “← SABBIA” rather than returning to the filtered list. Browser Back itself did correctly restore the filter and scroll position.

**Impact:** The explicit navigation offered by the page does not match the journey the user just took.

**Recommendation:** Carry a safe return path and label from the originating list in navigation state or the URL. Fall back to the gallery only when there is no list origin.

#### 8. Duplicate Lily Mortensen exhibition is visible in several contexts

**Observed:** *Grænseløs (Boundless)* appears twice with the same dates on the Gallery 144 profile, related-exhibition cards and dashboard list, using two different URLs.

**Impact:** Users may think there are two exhibitions, while search engines can index duplicate detail pages.

**Recommendation:** Merge or retire the duplicate record, redirect the obsolete slug, and add ingestion-level duplicate detection using gallery, title/artist and date range.

#### 9. Map bottom sheet omits its result count and has weak collapse affordance

**Observed:** The collapsed sheet says only “GALLERIES” or “EXHIBITIONS,” not the specified count. Tapping cycles upward through detents but does not provide a clear non-drag way to return to collapsed.

**Impact:** Users cannot judge the size of the result set before opening it, and users who cannot perform a drag gesture have a less predictable sheet.

**Recommendation:** Use a label such as “112 galleries in this area,” expose the current detent accessibly, and make the header toggle between collapsed and the last open detent.

Evidence: `screenshots/android-map-sheet-open.png`.

#### 10. Map clusters are undersized and ambiguously named

**Observed:** Cluster controls measure about 40 × 40px and their accessible name is only the number, such as “3.”

**Impact:** They fall below the project's 44px control rule and Android's recommended 48dp target. A screen-reader user does not know that the number represents a group of galleries.

**Recommendation:** Make the interactive area at least 48 × 48px and name it, for example, “3 galleries — zoom in.”

### P2 — Medium priority and polish

#### 11. Gallery profile tabs do not remain visible during section navigation

The **Current / Upcoming / Past / Visit** row scrolls off screen. After selecting Visit, the section heading is visible but the tabs are not, contrary to the sticky-tab requirement.

Recommendation: keep the compact tab row pinned below the header and account for its height when scrolling to anchors.

Evidence: `screenshots/gallery-profile-visit-anchor-mobile-390.png`.

#### 12. Console exhibition management is difficult to scan

The console exhibition page contains 272 rows, 273 buttons and no search, status filter, gallery filter or pagination. It is usable only through a long browser find/scroll workflow.

Recommendation: add search, status/gallery filters, a concise row summary and pagination or virtualisation. Keep destructive actions secondary.

Evidence: `screenshots/console-exhibitions-mobile-390.png`.

#### 13. Mobile dashboard editing leaves limited working space

On profile editing screens, the tall dashboard navigation and sticky save bar together occupy roughly a quarter of the 844px viewport.

Recommendation: collapse secondary dashboard navigation on small screens and keep one compact sticky save state.

#### 14. Long horizontal filter rails need stronger discoverability

What's On contains a long precinct rail. It works and remains visually clean, but users receive little indication that many more choices sit off-screen.

Recommendation: preserve the restrained horizontal pattern while adding a subtle clipped-next-item cue or edge fade that does not resemble a decorative control.

#### 15. The specifications conflict about bottom navigation on the map

`DESIGN_SPEC.md` says the mobile tab bar remains on `/map`; `MAP_MINIMAL_SPEC.md` and the live correction brief say it must be hidden on the full-screen map. The current build keeps it visible, consuming useful map/sheet space.

Recommendation: resolve the authority conflict explicitly. Given `MAP_MINIMAL_SPEC.md` is named as a non-superseded exception and describes the map-specific interaction, hiding the bar is the more internally consistent choice.

Evidence: `screenshots/android-map.png`.

## Visual review by area

### Home

Strong editorial introduction, controlled type scale and clear primary routes. Desktop and mobile retain the same hierarchy without horizontal overflow. The page is long on mobile, but the sections are distinct rather than crowded.

### What's On

The list hierarchy is one of the strongest parts of the product: what, when, where and action are easy to scan. Filters are compact and progressively disclosed. The empty state is specific and recoverable.

### Galleries

Search and filtering feel predictable. Cards remain restrained and images support rather than overpower metadata. Applied-filter tokens are clear.

### Gallery and exhibition profiles

Identity, visit information and conversion actions are easy to understand. Image and no-image exhibition layouts both hold together. The largest issues are duplicate content, sticky section navigation and explicit back context.

### Map

The visual direction is appropriately minimal: compact top controls, direct marker treatment and a local preview. The Android rendering still communicates the interface even when external map tiles are unavailable. Its interaction state, however, is the least reliable area of the product and needs concentrated regression testing.

### Dashboard and console

The dashboard is visually consistent with the public site and forms are readable. The console is restrained but not scaled to its current data volume.

## Accessibility and platform-guideline comparison

Positive alignment:

- The four persistent mobile destinations are understandable and align with Android's guidance for three to five top-level destinations.
- Most primary buttons and navigation items meet the project's 44px target.
- Text contrast, focus outlines and content hierarchy are generally clear.
- Filters use labelled controls rather than unexplained decorative icons.

Problems:

- Mobile search is visually obscured and does not expose an operable field.
- Map filter focus remains behind the dialog.
- Cluster targets are approximately 40px and therefore below the local 44px rule, Apple's recommended 44 × 44pt target and Android's recommended 48 × 48dp target.
- Numeric-only cluster labels do not explain the action.

Reference guidance:

- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple Human Interface Guidelines — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Android accessibility — Touch target size](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)
- [Android navigation bar guidance](https://developer.android.com/develop/ui/compose/components/navigation-bar)
- [WCAG 2.2 — Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 — Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

## Edge-case results

| Edge case | Result |
|---|---|
| Search with no results | Pass — clear reason, token and reset action |
| Exhibition without an image | Pass — no broken gap or placeholder dependency |
| Gallery without a cover image | Pass — identity and actions remain clear |
| Invalid URL | Pass — clear 404 and route home |
| Saved item after navigating away | Pass |
| Filtered list after exhibition and browser Back | Pass — filter and scroll position restored |
| Map after gallery and browser Back | Fail — markers disappeared |
| First map movement | Intermittent fail — Search this area absent |
| Mobile horizontal overflow | Pass on sampled core pages |
| Android without external network | Local interface loaded; external map tiles/images could not be performance-tested |

## Design-spec alignment

The audit was checked against `DESIGN_SPEC.md`, `DESIGN_LOCK.md`, `STYLE_GUIDE.md`, `DESIGN_GUIDE.md`, `MAP_MINIMAL_SPEC.md`, `AIRBNB_MAP_INTERACTION_GUIDE.md`, `UX_RESEARCH_IMPLEMENTATION_BRIEF.md`, `MONITORING_CORRECTIONS.md`, `PROGRESSIVE_DISCLOSURE_UX_GUIDE.md`, `EXHIBITION_CARD_HIERARCHY_GUIDE.md`, `WHATS_ON_POLISH_SPEC.md` and the current `EXHIBITION_ENTRY_RULES.md`.

Criteria substantially satisfied:

- Distinct screen jobs and route-based detail.
- Restrained editorial visual language.
- Mobile-first hierarchy without crowded all-in-one screens.
- Collapsed filters and concise public lists.
- Clear exhibition-card information order.
- Responsive desktop/mobile layouts without sampled horizontal overflow.
- Graceful empty and no-image states.

Criteria not yet satisfied:

- Reliable map/list/marker synchronisation.
- Complete map return-state restoration.
- Predictable Search this area behaviour.
- Map dialog focus handling.
- Counted, accessible mobile map sheet.
- Sticky gallery profile tabs.
- Reliable, visible global search.

## Verification

- `npm test`: **Passed — 18/18 tests**
- `npm run build`: **Passed**
- Build warning: Next.js reports that the `middleware` file convention is deprecated in favour of `proxy`. This did not fail the build.
- Source status after testing: the pre-existing modification to `EXHIBITION_ENTRY_RULES.md` remained untouched; only this report and audit screenshots were added.

## Recommended fix order

1. Repair mobile and desktop global search, including focus and keyboard behaviour.
2. Fix map restoration and desktop list-to-marker selection, then add browser regression coverage.
3. Fix Search this area's first-movement race and map filter focus containment.
4. Deduplicate the Lily Mortensen exhibition and redirect the obsolete URL.
5. Correct exhibition return context, map sheet count/collapse behaviour and cluster accessibility.
6. Resolve the map bottom-navigation specification conflict.
7. Polish sticky profile tabs and large management lists.
