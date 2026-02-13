# Sydney Art Finder

Mobile-first web app for indexing Sydney galleries and exhibitions.

## Features

- Gallery directory with search, A-Z and precinct sorting
- Interactive map of galleries (Leaflet + OpenStreetMap)
- Gallery profile pages with contact info and current/upcoming/past exhibitions
- "What's On" index with filters for:
  - current/upcoming/past
  - opening tonight
  - opening this week
  - precinct
  - specific galleries (tick on/off)
- Google Sheets CSV integration with sample data fallback

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Connect Google Sheets Data

1. Publish your Sheets tabs as CSV links.
2. Create `.env` from `.env.example`.
3. Paste both CSV URLs.
4. Restart `npm run dev`.

If loading fails, the app automatically falls back to sample data.

### `.env`

```bash
VITE_GALLERIES_SHEET_URL="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
VITE_EXHIBITIONS_SHEET_URL="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
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
