# UX audit fix workflow

Branch: `codex/saf-ux-audit-fixes`

Each issue moves through: implementation → focused checks → physical/visual test → independent review.

## 1. Global search — mobile overlay and submission

Status: Completed and independently approved.

Changes:

- Keep the mobile search band fully below the 56px public header.
- Focus the search field when opened and restore focus when closed.
- Make Enter navigation deterministic through the app router.
- Trim the query and preserve Unicode and reserved characters.
- Remove the invisible submit control from the keyboard order.
- Add the mobile `search` keyboard hint.

Verified:

- 390px and 1280px browser layouts.
- Android 15 / API 35 physical interaction.
- Input, Close and header do not overlap.
- No horizontal overflow.
- Enter navigates to the filtered What's On results.
- Escape closes and restores focus.
- Tab moves directly from the input to Close.
- `Trésor & / +` survives the URL and input round-trip.
- Existing automated tests: 18/18 passing.
- Same-route global search replaces an existing query.
- Browser Back restores the previous query and visible results.
- Independent reviewer: approved after keyboard-order and same-route regression fixes.

Product option retained for review:

- **Current:** Search opens below the visible mobile header. This preserves orientation and tested cleanly.
- **Alternative:** Search replaces the header while open. This saves 56px of vertical space and more literally follows the wording in `DESIGN_SPEC.md`, but requires a new mobile overlay stacking rule and makes brand/Saved temporarily unavailable.

## 2. Map restoration and result-to-marker synchronisation

Status: Completed and independently approved.

Changes:

- Populate markers only after Leaflet and the cluster layer report ready.
- Re-run marker population on restored routes rather than relying on an initial map movement.
- Change gallery results from direct profile links to semantic selection buttons.
- Centre and reveal the selected marker and open the local gallery preview.
- Keep profile navigation on the explicit **View gallery** action.
- Collapse the mobile results sheet after choosing a result.

Verified:

- Fresh desktop and mobile map loads show dots and clusters.
- Desktop and mobile row selection stays on `/map`, highlights the row/marker and opens the preview.
- Map → gallery → Back restores viewport, selected URL, preview, markers and clusters.
- Repeated Forward/Back keeps one marker pane without duplicate layers.
- A filtered `search=1301SW` return restores the query, input, selected preview and one matching marker.
- Existing automated tests: 18/18 passing.
- Mobile focus moves into the opened preview and returns to the visible sheet handle when closed.
- Independent reviewer: approved after the hidden-focus regression was corrected.

## 3. First-movement “Search this area”

Status: Completed and independently approved.

Changes:

- Track genuine drag, wheel, pinch, double-click, map-key and zoom-control movement.
- Ignore map setup, result centring, reset and other programmatic movement.
- Remove the race-prone assumption that the first `moveend` event is always initial setup.

Verified:

- Fresh map: no premature CTA.
- First mobile wheel/zoom: CTA appears immediately.
- Desktop Zoom in control: CTA appears.
- Applying the CTA sets `area=1` and current bounds, then hides it.
- Selecting and centring a gallery does not incorrectly show the CTA.
- Independent reviewer: approved.

## 4. Map filter focus containment

Status: Completed and independently approved.

Changes:

- Apply the shared modal-sheet focus contract to map filters.
- Move focus to Close, trap Tab/Shift+Tab, lock background scrolling and support Escape.
- Restore focus to the visible Filters trigger after dismissal.

Verified:

- Open → focus lands on Close and body scrolling locks.
- Keyboard focus wraps from first to last and last to first control.
- Escape removes the dialog, unlocks the page and restores the trigger.
- Independent reviewer: approved.

## 5. Exhibition detail return context

Status: Completed and independently approved.

Changes:

- Add an explicit, encoded return route and label to exhibition links from What's On, Map and Saved.
- Prefer the explicit return context on the exhibition page while retaining the existing safe referrer fallback.
- Reject external, protocol-relative and otherwise unsafe return targets.

Verified:

- Opening-week detail links return to the same filtered What's On view.
- Combined `when`, `precinct` and `search` filters survive the detail round-trip and visibly restore.
- Map exhibition links retain the viewport, zoom and time window in their return route.
- The exhibition back link resolves to the complete map URL and is labelled **Map**.
- An external `returnTo` value is rejected and falls back to the gallery profile.
- Return URL encoding and incomplete-context handling are covered by automated tests.
- Automated tests: 20/20 passing.
- Independent reviewer: approved after checking filtered What's On, Map, Saved and unsafe return targets.

## 6. Duplicate exhibition records and canonical detail routes

Status: Completed and independently approved.

Changes:

- Deduplicate public exhibitions by gallery, displayed artist, displayed title and exact date range.
- Prefer the richer duplicate when the same exhibition exists in both data sources.
- Keep the first-seen list position stable so deduplication does not reshuffle browsing results.
- Redirect the known legacy, image-poor **Boundless** URL to the canonical image-rich detail route.

Verified:

- Gallery 144 now exposes one **Boundless** exhibition detail link.
- The surviving card uses the canonical image-rich record.
- Directly loading the legacy URL permanently redirects to the canonical route.
- The canonical detail page renders its image and does not repeat itself in related exhibitions.
- Identity matching and the known slug redirect are covered by automated tests.
- Automated tests: 22/22 passing.
- Independent reviewer: approved after checking the live collision set, false-positive risk, stable ordering, richer-record selection and the 308 redirect.

## 7. Counted and keyboard-operable map results sheet

Status: Completed and independently approved.

Changes:

- Show the exact result count in the collapsed handle, including singular/plural wording.
- Expose whether the sheet is open with `aria-expanded`.
- Give the handle an action-specific accessible label.
- Make a tap collapse any open detent and reopen the last-used half/full detent.
- Retain all three drag detents.

Verified:

- Fresh mobile map shows **74 galleries in this area**.
- The handle changes from **Open map results** to **Collapse map results** with matching `aria-expanded` state.
- A full sheet collapses on tap and reopens at full, preserving the last open detent.
- Drag behaviour remains available independently of the tap toggle.
- Visual check at 390px confirms the count fits cleanly in the collapsed sheet.
- Independent reviewer: approved after matching counts to rows, checking singular labels, exercising all detents by tap and drag, and confirming last-detent memory.

## 8. Accessible map clusters

Status: Completed and independently approved.

Changes:

- Increase every cluster's interactive box from 40px to 48px.
- Preserve the restrained visible circle while using the larger transparent target.
- Replace numeric-only accessible names with descriptive actions such as **3 galleries — zoom in**.
- Keep the visible number hidden from assistive technology so it is not announced twice.

Verified:

- Rendered Leaflet cluster icons have inline 48 × 48px dimensions and centred 24px anchors.
- The accessibility tree exposes clusters as buttons named **N galleries — zoom in**.
- Physically clicking a cluster zooms and reclusters the markers.
- A 390px visual check confirms the larger target does not make the map visually heavy.
- Independent review found that cluster activation was not treated as user movement and Space did not activate the button-role control; both were corrected before approval.
- Independent reviewer: approved after pointer, Enter and Space each zoomed, reclustered, revealed **Search this area** and retained meaningful focus; the Space focus-loss regression required a second correction.

## 9. Sticky gallery profile section tabs

Status: Completed and independently approved.

Changes:

- Move the sticky tab strip out of the first content container so its sticky range spans the whole gallery profile, including the full-width Visit band.
- Keep the tab background full width while aligning its links to the shared content container.
- Preserve the mobile horizontal-scroll behaviour, desktop header offset and tokenized anchor clearance.

Verified:

- Selecting **Visit** scrolls to the section with its heading unobscured.
- The tab strip remains pinned and **Visit** becomes the active tab.
- A 390px visual check shows the strip remains compact and aligned while the Visit content is visible.
- Independent reviewer: approved after mobile and desktop anchor/scroll-spy checks, full Visit persistence, overflow checks and a one-section sparse-profile regression.

## 10. Scalable console exhibition management

Status: Completed and independently approved.

Changes:

- Add title/gallery search with accent-insensitive matching.
- Add status and gallery filters.
- Render 30 rows per page instead of the full management dataset.
- Add Previous/Next pagination, live result/page counts, Reset and a recoverable no-results state.
- Keep moderation actions secondary and retain their existing server-authorized behaviour.

Verified:

- The 282-record management dataset renders 30 rows on the first page.
- Searching **Director's Choice** returns the one matching record.
- An impossible search shows the no-results state and Reset restores the first 30 rows.
- Next moves to a different first row and reports page 2 of 10.
- Gallery 144 filtering returns three rows and every visible row belongs to Gallery 144.
- Published status results contain only Published rows; the current dataset contains no Draft or Hidden records and correctly shows an empty state for those filters.
- A 390px visual check confirms controls stack cleanly and the first results remain scannable.
- Independent review found that Unicode decomposition alone missed catalogue letters such as `æ`, `ø` and `ŋ`; explicit search folding and real-name regressions were added before approval.
- `graenselos` now finds both management records named **Grænseløs**, and `mununggurr` finds **Marrnyula Munuŋgurr | Alair Pambegan**.
- Automated tests: 23/23 passing.
- Independent reviewer: approved the filter, paging, accessibility, moderation-action preservation and Unicode correction. Its isolated browser lacked super-admin authentication, so the second physical pass audited the authenticated interaction evidence rather than re-operating the gated page.

## 11. Compact mobile dashboard and console navigation

Status: Completed and independently approved.

Changes:

- Collapse primary and utility back-office navigation into a native disclosure below 600px.
- Keep the brand and a current-section menu trigger in one 56px row.
- Present section links and utility actions in a focused overlay panel instead of permanent wrapped rows.
- Close the panel on route changes and on Escape, restoring focus to the trigger.
- Preserve the existing desktop/sidebar and tablet navigation.

Verified:

- Dashboard Profile now begins below a 56px navigation row rather than a multi-row header.
- The closed state leaves substantially more form workspace above the sticky save bar at 390px.
- The open menu clearly marks Profile and retains Console, View site and Sign out.
- Console uses the same compact behaviour and labels its trigger with the current section.
- Navigation closes the persistent menu after a route change.
- Escape closes the menu and restores focus to the current-section trigger.
- A 390px visual check confirms the panel overlays rather than reflowing the editing form.
- Independent review caught and verified a correction for open-menu brand compression; the full dashboard brand now remains visible in both states.
- Independent reviewer: approved the mobile disclosure, focus and route dismissal, working-space gain, menu scrolling and unchanged tablet/desktop structures. Its isolated browser lacked back-office authentication, so the second physical pass audited the supplied captures and interaction evidence.

## 12. Discoverable horizontal precinct rail

Status: Completed and independently approved.

Changes:

- Add a subtle content fade only on edges where more precincts are actually available.
- Update left/right cues as the user scrolls rather than permanently fading the final option.
- Keep the pattern free of decorative buttons or competing controls.
- Automatically bring the active precinct into view on direct links and filter changes.

Verified:

- Fresh 390px What's On shows a right-edge continuation cue across 44 precinct choices.
- Selecting the final precinct removes the right cue and adds the left cue.
- Direct loading with `precinct=Paddington` centres Paddington, retains its active underline and shows both continuation cues.
- The rail remains horizontally scrollable and the document has no horizontal overflow.
- Visual checks confirm the fade is subtle and does not resemble a control.
- Independent review found that a desktop-to-mobile resize could leave the active precinct outside the newly narrow viewport; resize handling now scrolls the active item to the nearest visible position before recalculating edge cues.
- Independent reviewer: approved after mobile/desktop edge, resize, direct-link, Back, keyboard, overflow and fallback checks.

## 13. Full-screen mobile map without global bottom navigation

Status: Completed and independently approved.

Decision:

- Hide the global mobile tab bar on `/map`. `DESIGN_SPEC.md` contains the older keep-visible rule, but `MAP_MINIMAL_SPEC.md`, `AIRBNB_MAP_INTERACTION_GUIDE.md`, the live monitoring correction and the repository instructions all define the map-specific exception as authoritative.

Changes:

- Hide the existing tab-bar element from layout and the accessibility tree on the map route.
- Let the fixed map shell use the recovered 56px of vertical space.
- Size sheet detents against the full available map viewport.
- Keep the compact map back, search and filter controls as the route's navigation.

Verified:

- A 390px browser pass shows no bottom navigation and a visibly taller map canvas.
- The hidden tab bar is absent from the accessibility tree.
- The result sheet remains anchored to the viewport bottom and toggles collapsed/half correctly.
- Android 15 / API 35 reproduces the full-screen map, with the count sheet above the system gesture area and no app tab bar.
- Independent reviewer: approved the authority decision, full mobile geometry, all sheet detents, selection-card focus, Back restoration of the normal tab bar, Android safe-area treatment and unchanged desktop split layout.

## Final release validation

- `npm test`: 23/23 passing.
- `npm run build`: passed with the existing Next.js middleware deprecation warning only.
- Production-mode mobile smoke: Home, What's On, Galleries, Gallery Profile, Exhibition Profile, Saved, Map and 404.
- Production-mode global search: Enter opens `/whats-on?search=Afterglow` and visibly filters to Afterglow.
- Production-mode map: clusters render, activation reveals **Search this area**, and the hidden global tab bar remains absent from the accessibility tree.
- `git diff --check`: passed.
