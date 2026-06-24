# Daily SAF Exhibition Check - 2026-06-10

Run time: 2026-06-10 11:23 AEST.

Scope: spreadsheet only. Supabase was explicitly suspended by the user for this run.

## Access Status

- Google Sheet read/write: OK via service account `/Users/michael/Desktop/Projects/sydneyartfinder/service_account.json`.
- Supabase: skipped by user instruction.
- Build verification: `npm run build` passed after Sheet writes.

## Sheet Changes

- Updated the live `Exhibitions` week marker `K1:L1` to `08/06/2026` and `14/06/2026`.
- Updated row 193, `King Street Gallery`, `Lucy Culliton | Rachel Milne`, `09/06` to `04/07`, with official website source links for both artists. No opening reception time was found on the official pages or visible official Instagram captions.
- Updated row 194, `Australian Galleries`, `Peter Kingston`, `11/06` to `27/06`, with `Opening Thu 11 June 6–8 PM`, official website source, and official Instagram source.
- Updated row 195, `Dominik Mersch`, from `Bella La Spina` to `Bella La Spina | Fiona Roberts, Natalie Holtsbaum: The Threshold of the Everyday`, `11/06` to `04/07`, with both official source pages.
- Added row 197, `1301SW`, `Mirdidingkingathi Juwarnda Sally Gabori and Judy Ledgerwood`, `16/06` to `11/07`, with official website and Instagram source links.
- Added row 198, `CBD Gallery`, `Group Exhibition: Silent Chords`, `18/06` to `11/07`, with `Opening Thu 18 June 6–8 PM`, official website source, and official Instagram source.

## Index Updates

- Marked verified and checked: `1301SW`, `Australian Galleries`, `CBD Gallery`, `Dominik Mersch`, and `King Street Gallery`.
- Marked `Gallery 144 (Formerly Outsider)` as `MANUAL REVIEW` and unchecked. Official public Gallery 144 pages show `Afterglow` from 17 July and a recent group exhibition ending 6 June; the existing `Simon Weir: Surrealism` row dated 11 June was not publicly verified and was left unchanged for user review.

## Skipped / Manual Review

- `Liverpool Street Gallery` / `Kevin Connor: Memorial`: skipped. The official listing shows `upcoming KEVIN CONNOR Memorial 18 June - 18 July` near a `2026` section, but the visible row itself does not attach the exact year and guessed detail URLs were invalid. Under the exact-year rule, do not add unless an official source confirms the 2026 date line directly.
- `Martin Browne Contemporary`: no write. Listing remains unsuitable under the Martin Browne special exact-year rule unless an individual exhibition page confirms 2026 dates.
- `Chauffeur`: source remained DNS-blocked during this pass.
- `Sullivan + Strumpf`: official page returned HTTP 429 during this pass.

## Readback Proof

- Re-read `Exhibitions!A193:O198`; rows 193-198 contain the expected source links, opening details, and new rows in chronological order.
- Re-read `Index!A3:J3`, `A19:J19`, `A30:J30`, `A41:J41`, `A46:J46`, and `A52:J52`; checked/manual-review statuses and timestamp `2026-06-10 11:23 AEST` were present.

## Follow-up: Current-week Non-priority + Instagram Pass

Run time: 2026-06-10 11:52 AEST.

Scope changed after user feedback: only exhibitions opening in the current week, Monday 8 June 2026 through Sunday 14 June 2026. Supabase remained skipped by user instruction.

### Additional Sheet Changes

Inserted 8 additional current-week rows before the previously added future rows:

- Row 197, `Michael Reid`, `Djirrirra Wunuŋmurra Yukuwa and Moyurrurra Wunuŋmurra: Classical | Fiona Pompey`, `11/06` to `28/06`, `Opening Thu 11 June`. Sources: `https://michaelreid.com.au/exhibition/buku-2026/`, `https://michaelreid.com.au/exhibition/fiona-pompey/`, `https://www.instagram.com/p/DZUQGSeE1Tn/`, `https://www.instagram.com/p/DYnzCMRk_QV/`.
- Row 198, `Tin Sheds Gallery`, `Group Exhibition: Pressure: Architecture, Process and the Print Studio`, `11/06` to `24/07`, `Opening Thu 11 June 6–8 PM`. Source: `https://www.sydney.edu.au/architecture/about/tin-sheds-gallery/pressure-architecture-process-and-the-print-studio.html`.
- Row 199, `Tiliqua Tiliqua`, `Eleanor Hall: The Rest is Memory`, `11/06` to `14/06`, `Opening Thu 11 June 5:30–7:30 PM`. Source: `https://www.instagram.com/p/DZMe_snAlOE/`.
- Row 200, `Gallery LNL`, `Group Exhibition: Moon Jar; An Axis`, `12/06` to `11/07`, `Opening Fri 12 June 5:30–7:30 PM`. Website source says 6–8 PM; official Instagram caption says 5:30–7:30 PM and was used as the more specific current post. Sources: `https://gallerylnl.com.au/exhibitions/46-moon-jar-an-axis/`, `https://www.instagram.com/p/DZMQNdjxy53/`.
- Row 201, `M2 Gallery`, `Group Exhibition: Into The Wild`, `12/06` to `16/06`. Source: `https://m2gallery.com.au/Exhibitions/tabid/87/listid/369/Default.aspx`.
- Row 202, `The Shop Gallery`, `Shaunagh Ashby | Tory Epworth`, `12/06` to `16/06`, `Opening Fri 12 June 6 PM`. Source: `https://theshopgalleryglebe.blogspot.com/2026/04/shaunagh-ashby-tory-epworth-11-16-june.html`.
- Row 203, `Flinders Street Gallery`, `Michael Bell: The Shooting Star`, `13/06` to `04/07`, `Opening Sat 13 June 4–6 PM`. Source: `https://www.instagram.com/p/DZMBLjnmov2/`.
- Row 204, `Sydenham International`, `Paul Knight: Figure and Ground`, `13/06` to `04/07`, `Opening Sat 13 June 3–5 PM`. Source: `https://www.instagram.com/p/DZCm3htSDk5/`.

Rows 205 and 206 are the earlier future rows, `1301SW` on 16 June and `CBD Gallery` on 18 June; they were left in place but are outside the narrowed current-week focus.

### Instagram / Source Corrections

- Official Instagram posts/captions were checked where websites were stale or missing opening details: `Australian Galleries`, `Art Leven`, `Barometer Gallery`, `Flinders Street Gallery`, `Gallery LNL`, `Local Edition`, `Michael Reid`, `Scieppan`, `Sydenham International`, `Tiliqua Tiliqua`, and `Tiles`.
- `Local Edition` looked like a possible 13 June opening from search snippets, but the official gallery account identified it as 13 June 2025, not 2026. No row added.
- `Scieppan` had a visible June exhibition, but official Instagram and City of Sydney listing both put the opening on Saturday 6 June 2026, outside the 8-14 June current-week window. No row added.
- `Barometer Gallery` was not added: official Instagram confirms `Susan Norrie: Two Projects` runs 6-28 June 2026, with no 8-14 June opening.
- `Mega` was not added: official Shows page confirms Rowan McNaught, `Any and every meaning`, 30 May-20 June 2026.

### Index Updates

- Marked verified/checked for the 8 added rows: `Michael Reid`, `Tin Sheds Gallery`, `Tiliqua Tiliqua`, `Gallery LNL`, `M2 Gallery`, `The Shop Gallery`, `Flinders Street Gallery`, `Sydenham International`.
- Marked checked with `NO CURRENT-WEEK OPENING` where direct official source/social evidence was sufficient: `Airspace Projects`, `Annette Larkin Fine Art`, `Art Leven`, `Articulate Project Space`, `Artsite Contemporary`, `Australian Design Centre`, `Barometer Gallery`, `Blacktown Arts Centre`, `Brett Whiteley Studio`, `Campbelltown Arts Centre`, `Carriageworks`, `Chau Chak Wing Museum`, `Day01`, `Hazelhurst Arts Centre`, `Local Edition`, `Macquarie University Art Gallery`, `Mega`, `Mosman Art Gallery`, `Mothership Studios`, `Olsen Gallery`, `PARI`, `Prop Gallery`, `Puzzle Art Garage`, `SABBIA`, `Scieppan`, `Scratch Art Space`, `Sydney Contemporary`, `The Cross Art Projects`, `Utopia Art Sydney`, `UTS Gallery`, and `Wentworth Galleries`.
- Marked out-of-scope without ticking checked: `Goulburn Regional Art Gallery`, `Melbourne Art Fair`, `National Gallery of Australia`, and `Ngununggula`.

### Remaining Manual Review

Left 5 Sydney non-priority rows unchecked/manual rather than inventing or inferring:

- `Central Space`
- `Mais Wright`
- `Ochredfern`
- `Passport`
- `Tiles`

### Follow-up Readback / Verification

- Re-read `Exhibitions!A193:O207`; rows 197-204 contain the 8 added current-week rows with source links in columns N/O.
- Re-read Index audit cells for added rows, no-current-week rows, manual-review rows, and out-of-scope rows.
- `npm run build` passed after the follow-up Sheet writes.

## Correction: Removed Unverified Gallery 144 Row

Run time: 2026-06-10 11:55 AEST.

- User asked why `Gallery 144 (Formerly Outsider)` was still in the current-week block.
- Confirmed `Exhibitions` row 196 was a pre-existing row, not added in the follow-up pass: `Gallery 144 (Formerly Outsider)`, `Simon Weir: Surrealism`, `11/06` to `11/07`, with no website or Instagram source links.
- Deleted that exact row from the live `Exhibitions` tab because the public Gallery 144 sources did not verify the 11 June 2026 exhibition/opening.
- Re-read `Exhibitions!A193:O205`; `Gallery 144` is gone and `Michael Reid` shifted to row 196.
- Updated `Index` row 46 to remain unchecked / `MANUAL REVIEW` with a note that the unverified row was removed.

## Follow-up: Double-check Remaining Current-week Rows

Run time: 2026-06-10 12:03 AEST.

User asked to double-check the other current-week rows after the Gallery 144 removal.

### Verified Current-week Rows

Rechecked the rows now in `Exhibitions!A193:O203` against official websites and/or official Instagram posts:

- `King Street Gallery`, `Lucy Culliton | Rachel Milne`, `09/06` to `04/07`: official King Street pages verify both exhibitions as 9 June - 4 July 2026.
- `Dominik Mersch`, `Bella La Spina | Group Exhibition: The Threshold of the Everyday`, `11/06` to `04/07`: official Dominik Mersch pages verify both exhibitions as 11.06-04.07.2026.
- `Australian Galleries`, `Peter Kingston`, `11/06` to `27/06`: official Australian Galleries page verifies Sydney, 11-27 Jun 2026; official Instagram verifies opening date/time.
- `Michael Reid`, `Djirrirra Wunuŋmurra Yukuwa and Moyurrurra Wunuŋmurra: Classical | Fiona Pompey`, `11/06` to `28/06`: official Michael Reid pages verify both Sydney exhibitions as 11-28 Jun 2026; Instagram source support remains in column O.
- `Tin Sheds Gallery`, `Pressure: Architecture, Process and the Print Studio`, `11/06` to `24/07`: official Tin Sheds page verifies 11 Jun-24 Jul 2026 and opening night 11 Jun, 6-8pm.
- `Tiliqua Tiliqua`, `Eleanor Hall: The Rest is Memory`, `11/06` to `14/06`: official Instagram source verifies opening drinks and exhibition dates; website was stale.
- `Gallery LNL`, `Moon Jar; An Axis`, `12/06` to `11/07`: official Gallery LNL page and Korean Cultural Centre page verify dates; official Instagram/KCC source supports 5:30-7:30pm opening time.
- `M2 Gallery`, `Into The Wild`, `12/06` to `16/06`: official M2 page verifies opening date 12 Jun 2026 and running date 16 Jun 2026; no official opening time was added.
- `The Shop Gallery`, `Shaunagh Ashby | Tory Epworth`, `12/06` to `16/06`: official Shop Gallery blog verifies dates and opening 6pm 12 Jun.
- `Sydenham International`, `Paul Knight: Figure and Ground`, `13/06` to `04/07`: official Instagram source verifies opening celebration 13 Jun, 3-5pm and exhibition 12 Jun-4 Jul.
- `Flinders Street Gallery`, `Michael Bell: The Shooting Star`, `13/06` to `04/07`: official Instagram source verifies opening reception 13 Jun, 4-6pm.

### Sheet Corrections Made

- Corrected row 194 title from generic `Group Exhibition` to `Bella La Spina | Group Exhibition: The Threshold of the Everyday`.
- Updated row 195 source URL to the exact Australian Galleries `Peter Kingston RS25` page and changed opening text to `Opening 11 June 6–8 PM` because the official social snippet had a weekday/date mismatch, while exact date/time were clear.
- Reordered `The Shop Gallery` into chronological position before the 13 June rows.
- Re-read `Exhibitions!A193:O205` after the write. Rows 193-203 are now the verified current-week block; rows 204-205 are future rows from the earlier broader pass (`1301SW` 16 Jun, `CBD Gallery` 18 Jun).
- Updated Index audit notes for `Dominik Mersch`, `Australian Galleries`, and `The Shop Gallery`.
- `npm run build` passed after these corrections.
