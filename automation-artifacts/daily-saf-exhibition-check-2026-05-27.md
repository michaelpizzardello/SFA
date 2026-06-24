# Daily SAF Exhibition Check - 2026-05-27

Run time: 2026-05-27T13:22:26+1000, Australia/Sydney.

## Access Status

- Google Sheet read/write: OK via service account `/Users/michael/Desktop/Projects/sydneyartfinder/service_account.json`.
- Supabase read/write: blocked. The configured project host `hkuanjcxbebrzdwayltb.supabase.co` still returns DNS `ENOTFOUND`; `npm run sync:galleries` and direct `curl` could not resolve it.
- Build verification: `npm run build` passed after Sheet writes and repairs.

## Initial Live Sheet Additions

Initially added 7 official-source 2026 rows to the live `Exhibitions` tab:

- Row 165: `Australian Galleries`, Paddington: `G.W. Bot: Glyphs under a black sun`, `26/05` to `13/06`, `Opening Tue 26 May 6–8 PM`.
- Row 166: `Australian Galleries`, Paddington: `Group Exhibition: Black and White: Etchings, Lithographs and Linocuts`, `26/05` to `13/06`, `Opening Tue 26 May 6–8 PM`.
- Row 167: `Australian Galleries`, Paddington: `Group Exhibition: Abstract`, `26/05` to `13/06`, `Opening Tue 26 May 6–8 PM`.
- Row 178: `Minerva`, Redfern: `Group Exhibition: New world order`, `30/05` to `20/06`, `Opening Sat 30 May 4–6 PM`.
- Row 180: `Saint Cloche`, Paddington: `Elliott Routledge: Fantasy Fantasy`, `03/06` to `22/06`.
- Row 185: `Defiance Gallery`, Paddington: `Joe Furlonger: Into the Blue`, `06/06` to `27/06`.
- Row 191: `Gallery Sally Dan-Cuthbert`, Darlinghurst: `Sabine Marcelis: Axis`, `20/06` to `01/08`.

Website source links were written to column `N` for these seven rows.

Important: the current-week recheck below supersedes this initial list. The three Australian Galleries rows were deleted after official Instagram captions showed those 26 May openings were for Australian Galleries Melbourne, not Sydney.

## Corrections During Write

- The initial append response reported `Exhibitions!A220:M226`, but the live Sheet placed the new records in date order at rows 165, 166, 167, 178, 180, 185, and 191.
- A source-link write using the stale append range was caught on read-back, cleared, and replaced by row-key-resolved writes.
- The two Australian Galleries group rows were corrected to `26/05` and `5/26/2026` after read-back showed the Sheet had not retained the intended start date.

## Supabase Pending

No Supabase writes were made. When `hkuanjcxbebrzdwayltb.supabase.co` resolves again or the project URL is corrected, upsert only the final Sydney-relevant Sheet additions/corrections into `admin_exhibitions` and run the narrow `galleries` basic-field sync. Preserve existing richer gallery values.

## Skipped / Manual Review

- Supabase `admin_exhibitions` and `galleries`: blocked by DNS.
- Sullivan + Strumpf: official page returned HTTP `429`; no direct-source update made.
- Ames Yavuz and Chauffeur: direct fetch failed in the shell during this pass; no new rows written from those sources.
- Liverpool Street Gallery `Kevin Connor Memorial`: listing remained under a broad 2026 page structure but the visible row did not attach a year directly to the date line; left for manual review under the exact-year rule.

## Current-Week Recheck - 2026-05-27

Triggered by user challenge: "sure you got everything for this week?" / "make sure you got everything all the info etc."

Target week: Monday 25 May 2026 through Sunday 31 May 2026.

### Corrections

- Deleted the three Australian Galleries rows added earlier for `G.W. Bot: Glyphs under a black sun`, `Group Exhibition: Black and White: Etchings, Lithographs and Linocuts`, and `Group Exhibition: Abstract`; official Instagram captions identify those 26 May openings as Australian Galleries Melbourne, not Sydney.
- Added `Art Gallery of New South Wales`, Sydney: `Group Exhibition: Artists and Their Pets`, `30/05`, source `https://www.artgallery.nsw.gov.au/whats-on/exhibitions/artists-and-their-pets/`. End date left blank because official source says `30 May 2026 – 2027` without a precise end day.
- Deleted duplicate `Firstdraft` `Group Exhibitions` row dated `30/05`; retained the `29/05` opening-reception row with `Opening Fri 29 May 6–8 PM`.
- Updated `The Commercial` `Group Exhibition: Good fortune to a flame` opening information to `Opening Sat 30 May 2–4 PM`.

### Final Current-Week Sheet Rows

- `Velvet Lobster`: `Shanti Shea An: Tropes`, `26/05` to `20/06`.
- `DRAW Space`: `Jeff Doring | James Grose | Tony Twigg`, `28/05` to `21/06`, `Opening Thu 28 May 6 PM`.
- `Nanda/Hobbs`: `Lottie Consalvo: Of the Night`, `28/05` to `20/06`, `Opening Thu 28 May 6–8 PM`.
- `.M Contemporary`: `Oksana Basarab: The Silence of Mountains`, `28/05` to `30/06`.
- `Firstdraft`: `Group Exhibitions`, `29/05` to `04/07`, `Opening Fri 29 May 6–8 PM`.
- `UNSW Galleries`: `Jordan Gogos | Kalisolaite ‘Uhila | Tina Stefanou`, `29/05` to `16/08`, `Opening Fri 29 May 6–8 PM`.
- `Art Gallery of New South Wales`: `Group Exhibition: Proximate Cosmologies`, `30/05`, end blank.
- `Art Gallery of New South Wales`: `Group Exhibition: Artists and Their Pets`, `30/05`, end blank.
- `Minerva`: `Group Exhibition: New world order`, `30/05` to `20/06`, `Opening Sat 30 May 4–6 PM`.
- `The Commercial`: `Group Exhibition: Good fortune to a flame`, `30/05` to `11/07`, `Opening Sat 30 May 2–4 PM`.

### Manual Review / Skips

- `Velvet Lobster`: existing row retained, but current official website exposes only `Current Tropes` without date details; Instagram API was blocked by login/rate-limit during this recheck.
- `National Art School` `The Neighbour At The Gate`: skipped because the visible source labels it as `Exhibition Touring`, the individual page returned 404, and venue/local detail was not sufficiently clear.
- `Martin Browne Contemporary`: skipped possible 29 May items because the listing did not meet the special individual-page 2026 confirmation rule.
- `Sullivan + Strumpf`, `Ames Yavuz`, `Chauffeur`: still not fully reachable from shell in this pass.
