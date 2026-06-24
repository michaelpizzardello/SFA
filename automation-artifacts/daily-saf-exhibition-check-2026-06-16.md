# Daily SAF Exhibition Check - 2026-06-16

Run time: 2026-06-16 23:58 AEST.

Scope: current week only, Monday 15 June 2026 through Sunday 21 June 2026.

Workflow followed: checked official gallery websites first; checked official Instagram/profile content where the website had no exhibition or missing opening details; used search only to locate or confirm official URLs/profile pages. Five read-only subagents audited Index row ranges 2-24, 25-47, 48-70, 71-92, and 93-112. Main agent independently verified all rows that were written.

## Sheet Formatting Verification

- `Exhibitions!K1:L1` read back as numeric serials `46188` and `46194`.
- Formatted readback displays `K1:L1` as `6/15/2026` and `6/21/2026`.
- Newly inserted `Exhibitions!K:L` full-date cells read back as numeric serials, not text.
- `npm run build` passed after the Sheet writes.

## Live Exhibition Changes

Added five current-week rows:

- `Verge Gallery`, `University of Sydney`: `Todd Robinson: Materialnonmaterial`, `18/06` to `14/08`, `Opening Thu 18 June 5:30–8 PM`. Source: `https://www.verge-gallery.net/` and `https://usu.edu.au/events/verge-gallery-materialnonmaterial/`.
- `Hazelhurst Arts Centre`, `Gymea`: `Group Exhibition: The ACAS Prize 2026`, `19/06` to `07/07`, no opening info found. Source: `https://www.sutherlandshire.nsw.gov.au/subsites/hazelhurst/exhibitions/coming-exhibitions/the-acas-prize-2026`.
- `Mais Wright`, `Darlinghurst`: `Conor Stein O'Shea: A likeness`, `19/06` to `11/07`, `Opening Fri 19 June 6–9 PM`. Source: `https://www.maiswright.com/`; Instagram sources `https://www.instagram.com/p/DZeKksRpnYB/` and `https://www.instagram.com/p/DZb6pOEhoUk/`.
- `The Shop Gallery`, `Glebe`: `David Kirk`, `20/06` to `01/07`, `Opening Sat 20 June 3 PM`. Source: `https://theshopgalleryglebe.blogspot.com/2026/06/david-kirk-19-june-1-july-2026-opening.html`.
- `PARI`, `Parramatta`: `Group Exhibition: Domain`, `21/06` to `16/08`, `Opening Sun 21 June 1–4 PM`. Source: `https://pariari.org/`; Instagram source `https://www.instagram.com/p/DZhHTALBCdp/`.

Updated one existing current-week row:

- `China Heights`: changed `Edward Woodley: Onsite` to `Edward Woodley: Onsite | Group Exhibition: Beyond Nature` because the official China Heights site and Instagram confirm both shows open 19.06.2026 and continue to 11.07.2026. This avoided creating a duplicate same-gallery/same-opening row.

Final verified 15-21 June block after writes is:

- Rows 204-216: `1301SW`, `CBD Gallery`, `Verge Gallery`, `China Heights`, `Hazelhurst Arts Centre`, `Mais Wright`, `Palas`, `Art Gallery of New South Wales`, `Darren Knight`, `Gallery Sally Dan-Cuthbert`, `The Shop Gallery`, `PARI`, `DRAW Space`.

## Index Updates

Added or corrected verified `Instagram URL` cells without shifting formulas:

- `CBD Gallery`: `https://www.instagram.com/cbdgallerysyd/`
- `China Heights`: `https://www.instagram.com/chinaheights/`
- `Hazelhurst Arts Centre`: `https://www.instagram.com/hazelhurstartscentre/`
- `Mais Wright`: `https://www.instagram.com/maiswright.gallery/`
- `Palas`: `https://www.instagram.com/palas.sydney/`
- `PARI`: `https://www.instagram.com/pari_ari_/`
- `Local Edition`: `https://www.instagram.com/localedition.au/`
- `Ochredfern`: `https://www.instagram.com/ochredfern/`
- `Prop Gallery`: `https://www.instagram.com/prop.gallery/`
- `Puzzle Art Garage`: `https://www.instagram.com/puzzle.artgarage/`
- `Tiles`: `https://www.instagram.com/tiles.lewisham/`

Added verified basic website URLs for current additions/manual-review rows where Index was blank:

- `Hazelhurst Arts Centre`: `https://hazelhurst.com.au/`
- `Local Edition`: `https://localedition.com.au/collections/exhibitions`
- `Mais Wright`: `https://www.maiswright.com/`
- `Ochredfern`: `https://ochredfern.com.au/`
- `PARI`: `https://pariari.org/`
- `The Shop Gallery`: `https://theshopgalleryglebe.blogspot.com/`
- `Tiles`: `http://www.tiles2049.com/`

Updated audit statuses/notes for: `China Heights`, `Hazelhurst Arts Centre`, `Local Edition`, `Mais Wright`, `Ochredfern`, `PARI`, `The Shop Gallery`, `Tiles`, and `Verge Gallery`.

## Manual Review / Skipped

These were not added under the exact-year/direct-source rule:

- `Liverpool Street Gallery`: official listing shows Kevin Connor `18 Jun-18 Jul` but the current/upcoming item is on a mixed-year page and does not attach the exact year.
- `Local Edition`: official page/blog mentions `Due` and `June 20-July 9`, but the item does not safely attach exact 2026 dates.
- `Ochredfern`: official site/profile verified, but current/upcoming items do not give exact 2026 current-week dates.
- `Central Space`, `Chauffeur`, `Day01`, `Tiles`, `Wagner Contemporary`: no safe exact-date current-week add from direct sources.
- `Goulburn Regional Art Gallery`, `National Gallery of Australia`, `Ngununggula`, `Melbourne Art Fair`, `Wentworth Galleries`: out of Sydney Art Finder scope for this pass.
- `The Shop Gallery` Instagram remains blank: the likely gallery-specific handle did not verify; search mostly surfaced location tags, artist posts, Facebook, or a personal owner profile.

## Double-check Follow-up - 2026-06-16 22:37 AEST

User clarified that end dates are not required. Updated `EXHIBITION_ENTRY_RULES.md` so `End Date` and `Full End` are optional when the direct source only confirms the opening/start date. Any end date that is entered still needs direct-source support.

No live Google Sheet exhibition row changes were needed in this follow-up. Re-read the live current-week block and confirmed:

- `Exhibitions!K1:L1` are numeric serials `46188` and `46194`, formatted as `6/15/2026` and `6/21/2026`.
- Current-week rows are `204-217`, total `14` rows.
- No duplicate gallery/exhibition/start keys were found in the 15-21 June 2026 block.
- All rows have required gallery, location, exhibition title, start date, and full start date fields under the end-date-optional rule.
- `Cassandra Bird`, row `207`, is acceptable with blank end date/full end. The official Instagram post confirms `Robby Bennett: Places of Delight` and `Opening Reception, Friday 19 June 6-8pm`; the post is dated June 14, 2026.
- `China Heights`, row `208`, was rechecked against the official website. Separate `Onsite` and `Beyond Nature` blocks both explicitly show `Opens 6-8pm Friday 19.06.2026` and `Continues ... until 11.07.2026`.
- `Verge Gallery`, row `206`, was rechecked against the official USU event page. The page includes structured `startDate="2026-06-15"` and `endDate="2026-08-14"` plus the launch time `Thursday 18 June, 5:30pm - 8pm`.
- `Hazelhurst Arts Centre`, row `209`, was verified in Chrome against the official Hazelhurst page: `The ACAS Prize 2026`, `19 June to 7 July 2026`.
- `Mais Wright`, row `210`, official Instagram confirms `A likeness`, `19 June - 11 July 2026`, and `Reception: Friday 19 June, 6-9pm`.
- `PARI`, row `216`, official site confirms `Domain will open on 21.06.2026`; official Instagram confirms opening `1PM-4PM, Sunday 21 June` and exhibition dates through Sunday 16 August.

Conditional-formatting note: the week marker cells are numeric, so the top dates are not the problem. Several older conditional-format rules still explicitly require `Full End` / column `L` to be nonblank (`$L3<>""`), so those rules will not apply to rows where end dates are intentionally left blank. The broad current-week start-date rule using column `K` still exists.

## Instagram Profile Exhibition Sweep - 2026-06-17 00:44 AEST

Follow-up to distinguish verified profile ownership from checking those profiles for current-week exhibition posts. Swept the 11 Instagram profiles newly added/corrected in the artifact using Instagram web profile caption data.

Current-week exhibition openings found and already represented in the Sheet:

- `CBD Gallery` / `@cbdgallerysyd`: `Silent Chords`, opening 18 June 2026, already row `205`.
- `China Heights` / `@chinaheights`: `Onsite` and `Beyond Nature`, opening 19 June 2026, already row `208`.
- `Mais Wright` / `@maiswright.gallery`: `A likeness`, opening 19 June 2026, already row `210`.
- `Palas` / `@palas.sydney`: `Dithyramb`, opening 20 June 2026, already row `211`.
- `PARI` / `@pari_ari_`: `Domain`, opening 21 June 2026, already row `216`.

Profiles checked with no additional safe current-week opening row from Instagram captions:

- `Hazelhurst Arts Centre` / `@hazelhurstartscentre`: recent Instagram captions did not surface `The ACAS Prize 2026`; row `209` remains verified from the official Hazelhurst website.
- `Local Edition` / `@localedition.au`: no safe current-week exhibition opening found in recent Instagram captions. Separate search snippets mention a June 20-July 9 exhibition and June 28 celebration, but not enough direct exact-year/opening evidence for a 15-21 June add.
- `Ochredfern` / `@ochredfern`: no current-week exhibition opening found in recent Instagram captions. A Google result surfaced a Facebook snippet for an `EOFY SALE` opening 17 June 2026, but this was not corroborated by official website/Instagram under the current source rules, so it remains manual review rather than a Sheet add.
- `Prop Gallery` / `@prop.gallery`: Instagram shows the fundraiser exhibition opened 30 May and continues to July 5; not a current-week opening.
- `Puzzle Art Garage` / `@puzzle.artgarage`: Instagram/search showed `Glycerine` by Eva Payne, opening 12 June and running to 10 July; not a current-week opening.
- `Tiles` / `@tiles.lewisham`: no current-week exhibition opening found in recent Instagram captions.

No live Google Sheet row changes were made from this Instagram profile sweep.

## Supabase

Supabase writes were attempted after the Sheet update. `npm run sync:galleries` failed because `hkuanjcxbebrzdwayltb.supabase.co` still returns DNS `ENOTFOUND`. No Supabase `galleries` or `admin_exhibitions` rows were changed in this run.
