# Daily SAF Exhibition Check Follow-up - 2026-05-13

Run time: 2026-05-13T11:38:08+1000 to 2026-05-13T12:06:00+1000, Australia/Sydney.

## Why this follow-up ran

The earlier same-day handoff had updated the Google Sheet, but it did not prove the priority Index had been exhaustively checked. A follow-up direct-source pass found more verified 2026 current/upcoming exhibitions and several stale or incomplete rows.

## Access Status

- Google Sheet read/write: OK via service account `/Users/michael/Desktop/Projects/sydneyartfinder/service_account.json`.
- Supabase read/write: still blocked. The configured host `hkuanjcxbebrzdwayltb.supabase.co` returns DNS `NXDOMAIN`/`ENOTFOUND`; `npm run sync:galleries` fails for the same reason.
- Build verification: `npm run build` passed after the Sheet writes and again after the image updates.

## Live Sheet Corrections

Updated 14 existing `Exhibitions` rows:

- Row 62: `ARTSPACE` updated to `Michaela Gleave | Ming Wong | Desmond Woodforde`, `06/03` to `07/06`.
- Row 83: `Chalk Horse` end date set to `09/05`.
- Row 85: `Darren Knight` end date set to `02/05`.
- Row 92: `DRAW Space` end date corrected from `26/09` to `26/04`.
- Row 95: `Fine Arts Sydney` end date corrected to `30/05`.
- Row 99: `PALAS` end date corrected to `06/06`.
- Row 106: `4A Centre for Contemporary Asian Art` end date corrected to `28/06`.
- Row 112: `Schmick Contemporary` end date filled as `16/05`.
- Rows 115-116: `China Heights` end dates filled as `16/05`.
- Row 123: `Defiance Gallery` start date corrected to `09/05`.
- Row 142: `Darren Knight` title corrected to `Robyn Stacey: The Fruits of Curiosity`.
- Row 143: `.M Contemporary` `Alison Smith: Solo Exhibition` start/opening corrected to `04/06`, `Opening Thu 4 June 5–7 PM`.
- Row 148: `SYRUP` title updated to `Owen Leong | EO Gill`.

## Live Sheet Additions

Inserted 27 verified rows into `Exhibitions!A174:L200`:

- `.M Contemporary`, Darlinghurst: `Janet Parker Smith: This Wild Ride`, `04/06` to `13/06`, `Opening Thu 4 June 5–7 PM`.
- `.M Contemporary`, Darlinghurst: `Oksana Basarab: The Silence of Mountains`, `28/05` to `30/06`.
- `4A Centre for Contemporary Asian Art`, Haymarket: `Group Exhibition: Transmedia Worldbuilding Residency Exhibition`, `01/05` to `14/06`, `Opening Fri 1 May 6–8 PM`.
- `Airspace Projects`, Marrickville: `Group Exhibitions`, `08/05` to `24/05`, `Opening Fri 8 May 6–8 PM`.
- `Arthouse`, Darlinghurst: `Kate Bergin: The Many Rooms of the Accidental Surrealist`, `07/05` to `30/05`.
- `Art Gallery of New South Wales`, Sydney: `Group Exhibition: Proximate Cosmologies`, starts `30/05`; end left blank.
- `Art Gallery of New South Wales`, Sydney: `Takashi Murakami`, `05/12` to `18/07`.
- `Artspace`, Woolloomooloo: `Rithika Merchant: Empirical Study`, `06/03` to `30/06`.
- `Australian Galleries`, Paddington: `Janet Luxton | Pam Tippett`, `24/11` to `12/12`.
- `Dominik Mersch`, Rushcutters Bay: `Elger Esser | Locust Jones`, `06/08` to `29/08`.
- `Dominik Mersch`, Rushcutters Bay: `Oliver Abbott`, `19/09` to `17/10`.
- `Dominik Mersch`, Rushcutters Bay: `Peta Clancy | Katie West`, `24/10` to `14/11`.
- `Dominik Mersch`, Rushcutters Bay: `Lyndell Brown and Charles Green`, `21/11` to `19/12`.
- `Gallery 144 (Formerly Outsider)`, Surry Hills: `Trésor Murace: Afterglow`, `17/07` to `15/08`.
- `N. Smith`, Surry Hills: `Sally Scales | Group Exhibition: The Interior II`, `07/05` to `30/05`.
- `Passage`, Haymarket: `Jack Ball: Mystery Solved`, `22/05` to `17/07`.
- `PIERMARQ*`, Surry Hills: `Jordy Kerwick: Family Portraits`, `04/06` to `11/07`.
- `Stanley Street Gallery`, Darlinghurst: `Kenneth Lambert: Augmented Intervals`, `21/05` to `06/06`, `Opening Thu 21 May 5:30–7:30 PM`.
- `UNSW Galleries`, Paddington: `Heather B. Swann | Remy Faint | Jordan Gower`, `04/09` to `22/11`.
- `Verge Gallery`, University of Sydney: `Cindy Yuen-Zhe Chen: Dismantle / Assemble`, `16/04` to `22/05`.
- `Woollahra Gallery`, Woollahra: `Group Exhibition: Myth Makers`, `27/05` to `23/08`.
- `Woollahra Gallery`, Woollahra: `Jaye Early: The business of life is the acquisition of memories`, `27/05` to `12/07`.
- `SYRUP`, Marrickville: `Belem Lett`, `18/07` to `08/08`.
- `SYRUP`, Marrickville: `Tara Denny`, `22/08` to `12/09`.
- `SYRUP`, Marrickville: `Ben Reid | Luke Parker`, `26/09` to `17/10`.
- `SYRUP`, Marrickville: `Haines & Hinterding`, `31/10` to `21/11`.
- `SYRUP`, Marrickville: `Nicholas Currie | Szymon Dorabialski`, `28/11` to `12/12`.

## Source Notes

Official source pages checked directly included `.M Contemporary`, `4A`, `AGNSW`, `Airspace`, `Arthouse`, `Artspace`, `Australian Galleries`, `Dominik Mersch`, `Gallery 144`, `N. Smith`, `Passage`, `PIERMARQ*`, `Stanley Street Gallery`, `SYRUP`, `UNSW Galleries`, `Verge`, and `Woollahra Gallery`.

## Image Pass

Follow-up image pass completed after the data reconciliation. Added verified official image URLs to blank `Exhibitions` column M cells for 29 rows:

- Corrected/upcoming rows now carrying images: `M144`, `M149`, `M154`, `M156`, `M158`, `M168`, `M171`.
- Newly appended rows now carrying images: `M175:M196`.

Image sources were official gallery/venue pages or their official asset CDNs. For combined rows with one Sheet image field, used a representative official image from the first-listed artist/exhibition when no combined hero image was published: `Janet Luxton | Pam Tippett`, `Elger Esser | Locust Jones`, `Peta Clancy | Katie West`, `Sally Scales | Group Exhibition: The Interior II`, and `Heather B. Swann | Remy Faint | Jordan Gower`.

Skipped image updates:

- `SYRUP` later 2026 program rows `Belem Lett`, `Tara Denny`, `Ben Reid | Luke Parker`, `Haines & Hinterding`, and `Nicholas Currie | Szymon Dorabialski`: official program confirms dates but does not publish exhibition-specific images yet.
- `Goodspace` `Group Exhibition: The Sapphic Galleria`: Instagram-only source did not expose a verified exhibition image to the shell.

Skipped or manual review:

- Supabase `admin_exhibitions` and `galleries`: blocked by DNS, no writes made.
- Martin Browne Contemporary: listing still not enough for the special rule; do not update from listing alone.
- Ames Yavuz `LEVIATHAN`: individual page confirms Sydney and dates but omits the year beside `11 Apr - 16 May`; skipped under the exact-year rule.
- Goodspace: Index source is Instagram-only and the public Instagram page did not expose captions/dates to the shell.
- Sullivan + Strumpf: blocked by Vercel Security Checkpoint during shell verification.
- Fine Arts Sydney `John Nixon EPW: 2001`: official page only says `June-July, 2026`; skipped because no exact start/end day.
- Nasha `Jesse Deng Gymamic`: official page only says `May 2026`; skipped because no exact start/end day.
- Velvet Lobster `Future Universe`: official page shows `14 October till 1 November` but no calendar year; skipped.
- AGNSW `Proximate Cosmologies`: source says `30 May 2026 - 2027`; start was added and end cells were left blank because no exact end date is published.

## Supabase Follow-up

When the Supabase host resolves, upsert all 27 rows from `Exhibitions!A175:L201` plus the five rows from the earlier 2026-05-13 run into `admin_exhibitions`, including the newly filled `image_url` values from column M, and run the narrow `galleries` basic-field sync. Preserve existing richer gallery fields.
