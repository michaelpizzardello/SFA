# Daily SAF Exhibition Check - 2026-05-13

Run time: 2026-05-13T11:29:10+1000, Australia/Sydney.

## Access Status

- Google Sheet read: OK.
- Google Sheet write: OK via service account `/Users/michael/Desktop/Projects/sydneyartfinder/service_account.json`.
- Supabase read/write: blocked. `hkuanjcxbebrzdwayltb.supabase.co` returned DNS `ENOTFOUND` from Node/curl/dig.
- Build verification: `npm run build` passed.

## Live Sheet Additions

Inserted into `Exhibitions!A168:L172`.

| A | Gallery | Location | Exhibition | Start Date | End Date | Opening Information | Rating | Featured | Ongoing | Full Start | Full End | Official source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | White Rabbit Gallery | Chippendale | Group Exhibition: Black Myth | 24/06 | 08/11 |  |  | FALSE | FALSE | 6/24/2026 | 11/8/2026 | https://whiterabbitcollection.org/news/ |
|  | Art Gallery of New South Wales | Sydney | Group Exhibition: Avatar: Forms of Vishnu | 20/06 | 05/10 |  |  | FALSE | FALSE | 6/20/2026 | 10/5/2026 | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/avatar/ |
|  | Art Gallery of New South Wales | Sydney | Billy Bain: By the River | 04/07 | 22/11 |  |  | FALSE | FALSE | 7/4/2026 | 11/22/2026 | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/billy-bain |
|  | Art Gallery of New South Wales | Sydney | Group Exhibition: Dobell Australian Drawing Biennial 2026 | 12/09 |  |  |  | FALSE | FALSE | 9/12/2026 |  | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/dobell-australian-drawing-biennial-2026/ |
|  | Art Gallery of New South Wales | Sydney | Sidney Nolan: Nolan Origins | 03/10 | 07/02 |  |  | FALSE | FALSE | 10/3/2026 | 2/7/2027 | https://www.artgallery.nsw.gov.au/whats-on/exhibitions/nolan-origins |

## Supabase Upsert Blocker

No Supabase rows were changed because the configured project host does not resolve:

```text
curl: (6) Could not resolve host: hkuanjcxbebrzdwayltb.supabase.co
```

When the Supabase host resolves, upsert the five Sheet additions above into `admin_exhibitions` and preserve existing richer `galleries` values. Do not backfill richer gallery fields during the daily pass.

## Duplicate / Existing Checks

- Existing live Sheet already contained the prior Nanda/Hobbs candidates: `Caroline Zilinsky | Kathryn Ryan` and `Lottie Consalvo: Of the Night`.
- Existing live Sheet already contained the prior King Street Gallery candidates through combined rows: `Lucy Culliton | Rachel Milne`, `John Bartley | Nathan Nhan`, and `Martin King: New Works`.

## Manual Review / Skips

- Dobell end date: official source confirms only `March 2027`; exact end day is not confirmed, so the end date cells were left blank.
- Martin Browne Contemporary remains under the extra year-verification rule: do not add/update from listing pages unless an individual source page explicitly confirms 2026 dates.
