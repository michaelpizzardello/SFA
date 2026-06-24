# Daily SAF Exhibition Check - 2026-05-01

Run time: 2026-05-01, Australia/Sydney.

## Access Status

- Google Sheet read: blocked in local shell by DNS (`docs.google.com` ENOTFOUND); web search snippets were available.
- Google Sheet write: blocked; no Google Sheets API/service account credentials or helper script found in the workspace or `/Users/michael/.codex`.
- Supabase read/write: blocked in local shell by DNS (`NEXT_PUBLIC_SUPABASE_URL` host ENOTFOUND), even with `.env.local` service role values loaded.
- Result: no live Google Sheet rows or Supabase records were changed in this run.

## Verified Candidate Sheet Rows

Rows below follow `EXHIBITION_ENTRY_RULES.md` columns A-L. Rating is blank; Featured/Ongoing are blank. Opening information is blank unless an official opening time was found.

| A | Gallery | Location | Exhibition | Start Date | End Date | Opening Information | Rating | Featured | Ongoing | Full Start | Full End | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Nanda\Hobbs | Surry Hills | Caroline Zilinsky \| Kathryn Ryan | 07/05 | 23/05 |  |  |  |  | 5/7/2026 | 5/23/2026 | https://nandahobbs.com/exhibition/people/artwork/limerence |
|  | Nanda\Hobbs | Surry Hills | Lottie Consalvo: Of the Night | 28/05 | 20/06 |  |  |  |  | 5/28/2026 | 6/20/2026 | https://nandahobbs.com/exhibition/people/artwork/limerence |
|  | White Rabbit Gallery | Chippendale | Group Exhibition: Black Myth | 24/06 | 08/11 |  |  |  |  | 6/24/2026 | 11/8/2026 | https://whiterabbitcollection.org/news/ |
|  | Art Gallery of New South Wales | Sydney | Group Exhibition: Archibald, Wynne and Sulman Prizes 2026 | 09/05 | 16/08 |  |  |  |  | 5/9/2026 | 8/16/2026 | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/archibald-wynne-and-sulman-prizes-2026/ |
|  | Art Gallery of New South Wales | Sydney | Group Exhibition: Avatar: Forms of Vishnu | 20/06 | 05/10 |  |  |  |  | 6/20/2026 | 10/5/2026 | https://www.artgallery.nsw.gov.au/media-office/2026-program/ |
|  | Art Gallery of New South Wales | Sydney | Billy Bain: By the River | 04/07 |  |  |  |  |  | 7/4/2026 |  | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/ |
|  | Art Gallery of New South Wales | Sydney | Group Exhibition: Dobell Australian Drawing Biennial 2026 | 12/09 |  |  |  |  |  | 9/12/2026 |  | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/dobell-australian-drawing-biennial-2026 |
|  | Art Gallery of New South Wales | Sydney | Group Exhibition: Nolan Origins | 03/10 | 07/02 |  |  |  |  | 10/3/2026 | 2/7/2027 | https://www.artgallery.nsw.gov.au/media-office/2026-program/ |
|  | King Street Gallery on William | Darlinghurst | John Peart: Book Launch and Exhibition: Unfolding Time | 12/05 | 06/06 |  |  |  |  | 5/12/2026 | 6/6/2026 | https://kingstreetgallery.com.au/exhibition/peart26/ |
|  | King Street Gallery on William | Darlinghurst | Rachel Milne: Newcastle, High | 09/06 | 04/07 |  |  |  |  | 6/9/2026 | 7/4/2026 | https://kingstreetgallery.com.au/exhibition_terms/2026/ |
|  | King Street Gallery on William | Darlinghurst | John Bartley: The Quick and the Slow | 07/07 | 01/08 |  |  |  |  | 7/7/2026 | 8/1/2026 | https://kingstreetgallery.com.au/exhibition_terms/2026/ |
|  | King Street Gallery on William | Darlinghurst | Nathan Nhan: Proverbial | 07/07 | 01/08 |  |  |  |  | 7/7/2026 | 8/1/2026 | https://kingstreetgallery.com.au/exhibition_terms/2026/ |

## Already-Current / Not Added

- National Art School: `Mitch Cairns: Artist's Mouth`, 1 May - 11 July 2026, opening night 30 April 2026 6 PM. Official page confirms year, but the opening occurred before this run and may already be in the Sheet/admin store.
- 4A Centre for Contemporary Asian Art: `High Tides: Yuki Kihara and Morgan Hogg`, 18 April - 28 June 2026, opening 17 April 6-8 PM. Current, not newly upcoming.
- Artspace: `Michaela Gleave Event Horizon`, `Ming Wong: Fata Morgana (I)`, `Desmond Woodforde: Kinara Tjuta (many moons)`, all 6 March - 7 June 2026. Current, not newly upcoming.
- UNSW Galleries: `All The World's Memories`, 13 February - 3 May 2026. Current/closing.
- Roslyn Oxley9 Gallery: `Dale Frank: Chicken Soup`, 17 April - 16 May 2026. Current.
- Sullivan+Strumpf: `Natalya Hughes: The Lean`, 23 April - 17 May 2026. Current.

## Skipped / Manual Review

- Martin Browne Contemporary: exhibition listing has a `2026 EXHIBITIONS COMING SOON` heading, but individual date rows omit year; per the Martin Browne-specific rule, do not add/update unless the individual source page explicitly confirms 2026 dates.
- Offsite/interstate fair listings from Nanda\Hobbs, Roslyn Oxley9 and Sullivan+Strumpf were skipped unless directly relevant to Sydney Art Finder.

## Suggested Supabase Upserts

When network access is available, upsert the candidate rows above into `admin_exhibitions` using matching gallery slugs and preserve existing gallery enrichment. Also run the existing gallery basic-field sync from the Index once Sheets can be read locally:

```bash
node scripts/sync-galleries-to-supabase.mjs
```

