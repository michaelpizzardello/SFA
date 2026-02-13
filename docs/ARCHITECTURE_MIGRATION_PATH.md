# Architecture Migration Path

This project has moved from a single-page Vite/hash-routing prototype to Next.js App Router with indexable URL routes.

## Completed

- Replaced hash navigation with real routes:
  - `/`
  - `/whats-on`
  - `/galleries`
  - `/map`
  - `/gallery/[slug]`
- Separated workflows by screen so each page has one primary job.
- Preserved map/filter state through URL query parameters.
- Added utility tests for date/status/filter logic.

## Next Production Steps

1. Move Google Sheets ingestion to a backend normalization pipeline.
2. Validate and cache normalized gallery/exhibition entities before serving.
3. Add scheduled imports and change monitoring for upstream sheet edits.
4. Add page-level metadata generation per gallery/exhibition.
5. Add analytics and error monitoring for map/search/filter flows.

## Data Pipeline Direction

Target pipeline:

- ingest: fetch CSV from Google Sheets
- normalize: schema map + validation + slug consistency checks
- persist: store in database (Postgres recommended)
- serve: API/ISR for fast, stable frontend reads

This removes per-session CSV parsing from clients and improves reliability and SEO performance.
