# Sydney Art Finder Exhibition Entry Rules

Use this document when adding weekly exhibitions to the Google Sheet or the admin tool.

## Source Order

1. Use the gallery URL from the Index tab.
2. Check the gallery website first, especially pages named Exhibitions, Current, Upcoming, Program, What's On, or Events.
3. If the website does not clearly show opening details, check the gallery Instagram profile linked in the Index or from the gallery website.
4. On Instagram, check the recent grid and captions. Do not rely only on the image tile if the caption has dates or opening details.
5. If the Index row has no URL or the listed URL is broken, use Google search only to find the gallery's official website, official exhibitions page, or official Instagram. Do not use Google search to decide exhibition details when a direct official source is available.

## Weekly Window

For the current weekly post, include exhibitions that open during the target Monday to Sunday week.

If an official exhibition start date and the opening reception date differ, use the opening reception date as the Start Date in the sheet. This avoids confusing readers who use the post to decide what is opening that week.

If no opening reception information is available, use the official exhibition start date.

## Required Sheet Fields

Fill rows in the Exhibitions tab using the existing format:

| Column | Field |
| --- | --- |
| A | Leave blank unless the sheet already uses an ID |
| B | Gallery |
| C | Location |
| D | Exhibition |
| E | Start Date, `DD/MM` |
| F | End Date, `DD/MM` |
| G | Opening Information |
| H | Rating |
| I | Featured checkbox |
| J | Ongoing checkbox |
| K | Full Start, `M/D/YYYY` |
| L | Full End, `M/D/YYYY` |

Leave Rating blank unless a rating has been intentionally assigned.

## Opening Information Format

Use this exact style:

```text
Opening Sat 2 May 4–6 PM
```

Rules:

- Start with `Opening`.
- Use day abbreviation: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
- Use date as `D Month`, for example `2 May`.
- Use an en dash between times: `4–6 PM`.
- Do not write `Opening drinks`, `Opening reception`, `Launch`, or `Event`.
- Do not include unrelated notes such as `Weekends or by appointment`, gallery hours, artist talks, RSVP links, or public program details.
- If no opening time is available, leave Opening Information blank.

## Exhibition Name Rules

For a solo exhibition, use:

```text
Artist Name: Exhibition Title
```

For two artist exhibitions at the same gallery with the same opening date/date window, combine into one row:

```text
Artist One | Artist Two
```

For a group exhibition with more than two artists, use:

```text
Group Exhibition: Exhibition Title
```

If a gallery has multiple group exhibitions on the same dates, use:

```text
Group Exhibitions
```

Do not split two same-date solo shows into separate rows when they function as the same opening night at the same gallery.

## Date Handling

- `Start Date` is `DD/MM`.
- `End Date` is `DD/MM`.
- `Full Start` is `M/D/YYYY`.
- `Full End` is `M/D/YYYY`.
- Always verify the exhibition year from the source page or caption. Do not infer that an archive/current page item is 2026 just because it is visible today.
- If a gallery page mixes years or has archive pagination, treat any undated or ambiguous listing as unsafe until the source clearly confirms the target year.
- For Martin Browne Contemporary specifically, check the individual exhibition page/date text carefully because past-year exhibitions can appear in listing pages. Never add a Martin Browne row unless the page explicitly confirms 2026 dates.
- If the official exhibition starts before the opening reception, set `Start Date` and `Full Start` to the opening reception date.
- If the official exhibition starts after a preview/opening night, set `Start Date` and `Full Start` to the preview/opening night.
- If there is no opening reception information, use the official exhibition start date.

## Verification Standard

Before adding a row, confirm:

- The gallery name and location match the Index where available.
- The exhibition opens in the target week, after applying the opening-date rule.
- The source confirms the correct calendar year, especially on archive-heavy gallery websites.
- The end date is from the official gallery page or caption.
- The opening information is a real opening/reception detail, not gallery hours or appointment text.
- The row does not duplicate an existing row already in the Exhibitions tab.

## Examples

Two same-date solo exhibitions:

```text
Todd Fuller | Elefteria Vlavianos
```

Group exhibition:

```text
Group Exhibition: In Praise of Shadows
```

Multiple same-date group exhibitions:

```text
Group Exhibitions
```

Correct opening text:

```text
Opening Sat 2 May 4–6 PM
```

Incorrect opening text:

```text
Opening drinks Fri 1 May 6-8 PM
Weekends or by appointment
```
