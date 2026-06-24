# Daily SAF Exhibition Check - 2026-06-22

Scope: Google Sheet only. Target week: Monday 22 June-Sunday 28 June 2026.

Live Sheet state:
- Service-account read/write is blocked in this sandbox because Google hosts do not resolve from shell (`oauth2.googleapis.com`, `sheets.googleapis.com`, `docs.google.com`).
- Chrome can read public gallery/Instagram pages, but the published Sheet feed aborts and the automation rule says not to use browser paste for sheet edits.
- Result: live Google Sheet was not changed in this run. Rows below are sheet-ready corrections/additions.

Rule updates observed:
- End dates are optional. Where end dates conflict or are not needed, leave columns F/L blank.
- Opening reception date/time controls the weekly `Start Date` when it differs from the exhibition start.

## Existing Current-Week Rows To Correct

| Gallery | Current issue | Correct sheet values | Sources |
| --- | --- | --- | --- |
| Redbase | Cached row says `Group Exhibition` and starts 23/06, but the detail page identifies a solo exhibition by Stephan Kaluza and both website/Instagram confirm a Saturday opening. Website says exhibition ends 25 July; Instagram says 27 July, so do not rely on the end date. | D `Stephan Kaluza: The Disappeared and the Lost`; E `27/06`; G `Opening Sat 27 June 5–7 PM`; K `6/27/2026`; leave F/L blank unless manually choosing the website end date. | https://gallery.redbaseart.com/event/121/the-disappeared-and-the-lost and https://www.instagram.com/redbaseau/p/DZy7se7gTLI/ |
| Saint Cloche | Cached row missed the opening reception. | Keep D `Daniel O'Toole + Thomas Thorby-Lister: Mapping Perception`; E `24/06`; G `Opening Wed 24 June 6–8 PM`; K `6/24/2026`. Optional end: `12/07` / `7/12/2026`. | https://saintcloche.com/collections/mapping-perception |
| Nanda/Hobbs | Cached row only lists Brett McMahon. Official Nanda/Hobbs listing and Anton Forde detail page show `Soundings` and `Uranga` as same-date/same-window openings. | D `Brett McMahon | Anton Forde`; E `25/06`; G `Opening Thu 25 June 6–8 PM`; K `6/25/2026`. Optional end: `11/07` / `7/11/2026`. | https://nandahobbs.com/exhibitions/ and https://nandahobbs.com/exhibitions/uranga-anton-forde/ |

## Existing Current-Week Rows Verified

| Gallery | Verified value | Sources |
| --- | --- | --- |
| Curatorial + Co | `Group Exhibition: The Beast In Me`; starts 24/06; opening Wed 24 June 5:30–8 PM; year confirmed as 2026. | https://curatorialandco.com/exhibition/group-show-the-beast-in-me/ and https://www.instagram.com/curatorialandco/p/DZ4XSOQEimf/ |
| DRAW Space | `Group Exhibition: TIMELINE / Animate Newtown`; event 25-28 June 2026; opening Thu 25 June 6 PM. | https://drawspace.org/exhibitions-and-events/timeline-animate-newtown |
| White Rabbit Gallery | `Group Exhibition: Black Myth`; opens 25 June 2026; no opening reception time found. Website and Instagram both confirm 2026. | https://whiterabbitcollection.org/exhibitions/ and https://www.instagram.com/whiterabbitgallery/p/DZzQ7GzvcVD/ |

## New Rows To Add

| Gallery | Location | Exhibition | Start | Opening info | Full start | Optional end | Sources |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M2 Gallery | Surry Hills | `Group Exhibition: The Art of Zhen Shan Ren` | `25/06` | `Opening Thu 25 June 6–7:30 PM` | `6/25/2026` | `07/07` / `7/7/2026` | https://m2gallery.com.au/Exhibitions/tabid/87/listid/368/Default.aspx |
| SABBIA | Redfern | `Maningrida Arts | Jenni Kemarre Martiniello OAM` | `24/06` | blank | `6/24/2026` | `18/07` / `7/18/2026` | https://sabbiagallery.com/exhibitions/upcoming/, https://sabbiagallery.com/exhibition/maningrida-group-exhibition/, https://sabbiagallery.com/exhibition/jenni-kemarre-martiniello/ |
| Stanley Street Gallery | Darlinghurst | `Gretal Ferguson & Victoria Edin: Unbecoming` | `25/06` | `Opening Thu 25 June 5:30–7:30 PM` | `6/25/2026` | `18/07` / `7/18/2026` | https://stanleystreetgallery.com.au/exhibitions/unbecoming and https://events.humanitix.com/opening-celebration-victoria-edin-and-gretal-ferguson-unbecoming |
| Roslyn Oxley9 Gallery | Paddington | `A Constructed World: Pheno 03: Outside Broadcast, My voice keeps changing on me` | `27/06` | `Opening Sat 27 June 3–5 PM` | `6/27/2026` | `18/07` / `7/18/2026` | https://www.roslynoxley9.com.au/exhibitions and https://www.instagram.com/roslynoxley9/p/DZelC5ikkp8/ |
| Campbelltown Arts Centre | Campbelltown | `Group Exhibitions` | `27/06` | `Opening Sat 27 June 3–5 PM` | `6/27/2026` | `13/09` / `9/13/2026` | https://www.campbelltownartscentre.com.au/Whats-On/Exhibitions/Exhibition-Opening-Upcoming-Exhibitions and https://events.humanitix.com/exhibition-opening-or-upcoming-exhibitions-at-campbelltown-arts-centre |

Campbelltown exhibitions covered by the combined row:
- Zico Albaiquni: `To all the steps that shake the land's memory`
- Kirtika Kain: `Pitch`
- Gillian Kayrooz & L-FRESH The LION: `The Sky Between Us`
- `2026 Friends Annual and Focus`

## Skipped / Not Added

| Gallery/source | Reason |
| --- | --- |
| Defiance Gallery | `Joe Furlonger: Into the Blue` runs 6-27 June 2026, so it did not open in the 22-28 June target week. July shows open outside the week. |
| Campbelltown `Entries Open | 2026 Fisher's Ghost Art Award` | Call/entries item, not an exhibition opening. |
| DRAW Space `HERE & THERE / Alex Karaconji & Daniel Elliott` | Opened Sunday 21 June 2026, outside this target week. |
| M2 Instagram `@m2gallery` | Not the Sydney M2 Gallery; it resolves to an Arkansas gallery profile. Official M2 website used instead. |

## Evidence Artifacts

- `automation-artifacts/site-sweep-2026-06-22.json`
- `automation-artifacts/candidate-evidence-2026-06-22.json`
- `automation-artifacts/target-source-pages-2026-06-22.json`
- `automation-artifacts/target-source-pages-extra-2026-06-22.json`
- `automation-artifacts/instagram-fallback-2026-06-22.json`
- `automation-artifacts/instagram-posts-2026-06-22.json`
