# Sydney Art Finder

Next.js web app for indexing Sydney galleries and exhibitions.

## Routes

- `/` Home (orientation + quick highlights)
- `/whats-on` Exhibition index (search + date window + precinct)
- `/galleries` Gallery directory (search + precinct + sort)
- `/map` Map-first gallery discovery with synced list
- `/gallery/[slug]` Gallery profile pages

## Features

- Mobile-first editorial layout with restrained UI
- Dedicated map workflow (not mixed into directory page)
- Map clustering + "search this area" + persisted viewport/filter query state
- Gallery profile pages with practical details and grouped exhibitions
- Google Sheets CSV integration with sample data fallback

## Development

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm test
npm run build
```

Production server:

```bash
npm run start
```

## Connect Google Sheets Data

1. Publish your Sheets tabs as CSV links.
2. Create `.env.local` from `.env.example`.
3. Paste both CSV URLs.
4. Restart `npm run dev`.

If loading fails, the app automatically falls back to sample data.

### `.env.local`

```bash
NEXT_PUBLIC_GALLERIES_SHEET_URL="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
NEXT_PUBLIC_EXHIBITIONS_SHEET_URL="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
```

## Expected Columns

### Galleries CSV

Required:
- `name`

Recommended:
- `id`
- `slug`
- `precinct`
- `suburb`
- `postcode`
- `address`
- `latitude`
- `longitude`
- `website`
- `instagram`
- `phone`
- `email`
- `opening_hours` (use `|` between lines)
- `about`

### Exhibitions CSV

Required:
- `title`
- `gallery_slug` (or `gallery_name` that can map to a gallery)

Recommended:
- `id`
- `artist`
- `summary`
- `start_date` (`YYYY-MM-DD`)
- `end_date` (`YYYY-MM-DD`)
- `opening_date` (`YYYY-MM-DD`)
- `opening_time`
- `cost`

## Migration Notes

See `docs/ARCHITECTURE_MIGRATION_PATH.md` for completed migration steps and production roadmap.
