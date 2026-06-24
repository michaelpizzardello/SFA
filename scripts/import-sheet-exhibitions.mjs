// Migrate the Google Sheet "Exhibitions" tab into Supabase admin_exhibitions (self-contained parse).
// Resolves gallery_id by slug, applies curated image overrides + sheet image URLs, published=true,
// source='auto'. Idempotent via deterministic slug + ON CONFLICT DO NOTHING. DRY_RUN=1 to preview.
import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
  if (m) process.env[m[1]] = m[2]
}
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SHEET = process.env.NEXT_PUBLIC_EXHIBITIONS_SHEET_URL
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const DRY = !!process.env.DRY_RUN
const slugify = (v) => String(v).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const OVERRIDES = {
  'national-art-school::mitch-cairns-artist-s-mouth': '/images/exhibitions/nas-mitch-cairns-artists-mouth.webp',
  'curatorial-co::group-exhibition-the-beast-in-me': '/images/exhibitions/curatorial-beast.jpg',
  'saint-cloche::daniel-o-toole-thomas-thorby-lister-mapping-perception': '/images/exhibitions/saint-cloche-mapping.jpg',
  'nanda-hobbs::brett-mcmahon-anton-forde': '/images/exhibitions/nanda-soundings.jpg',
  'white-rabbit-gallery::group-exhibition-black-myth': '/images/exhibitions/white-rabbit-black-myth.jpg',
  'stanley-street-gallery::gretal-ferguson-victoria-edin-unbecoming': '/images/exhibitions/stanley-unbecoming.jpg',
  'roslyn-oxley9-gallery::a-constructed-world': '/images/exhibitions/roslyn-constructed-world.jpg',
  'sabbia::maningrida-arts-jenni-kemarre-martiniello-oam': '/images/exhibitions/sabbia-jenni.jpg',
  'redbase::stephan-kaluza-the-disappeared-and-the-lost': '/images/exhibitions/redbase-kaluza.jpg'
}

function parseCsv(text) {
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') { if (q && text[i + 1] === '"') { cell += '"'; i++ } else q = !q; continue }
    if (c === ',' && !q) { row.push(cell); cell = ''; continue }
    if ((c === '\n' || c === '\r') && !q) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((x) => x.length)) rows.push(row); row = []; continue }
    cell += c
  }
  if (cell.length || row.length) { row.push(cell); if (row.some((x) => x.length)) rows.push(row) }
  return rows
}
function normDate(v) {
  v = String(v || '').trim()
  if (!v) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const m = v.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (!m) return ''
  const a = +m[1], b = +m[2]
  const yp = m[3] ? +m[3] : 2026
  const year = yp < 100 ? 2000 + yp : yp
  const full = !!m[3]
  const month = full ? a : b, day = full ? b : a
  if (!month || !day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const csv = await fetch(SHEET).then((r) => r.text())
const rows = parseCsv(csv)
const headerIdx = rows.findIndex((r) => r.some((c) => slugify(c) === 'gallery') && r.some((c) => slugify(c) === 'exhibition'))
const dataRows = rows.slice(headerIdx + 1)

const gals = await fetch(`${SUPA}/rest/v1/galleries?select=id,slug,name`, { headers: H }).then((r) => r.json())
const galBySlug = new Map(gals.map((g) => [g.slug, g]))

const seen = new Set()
const records = []
let skippedNoGallery = 0, skippedNoDate = 0
for (const r of dataRows) {
  const galleryName = (r[1] || '').trim()
  const title = (r[3] || '').trim()
  if (!galleryName || !title) continue
  const gallerySlug = slugify(galleryName)
  const gallery = galBySlug.get(gallerySlug)
  if (!gallery) { skippedNoGallery++; continue }
  const start = normDate(r[10] || r[4])
  if (!start) { skippedNoDate++; continue }
  const end = normDate(r[11] || r[5]) || null
  const image = (r[12] || '').trim() || OVERRIDES[`${gallerySlug}::${slugify(title)}`] || ''
  const slug = slugify(`${gallerySlug}-${title}`)
  if (seen.has(slug)) continue
  seen.add(slug)
  records.push({
    slug,
    gallery_mode: 'index',
    gallery_id: gallery.id,
    gallery_slug: gallery.slug,
    gallery_name: gallery.name,
    exhibition_name: title,
    artist: '',
    summary: '',
    start_date: start,
    end_date: end,
    opening_information: (r[6] || '').trim(),
    image_url: image,
    cost: 'Free',
    published: true,
    source: 'auto'
  })
}
console.log(`sheet rows=${dataRows.length} importable=${records.length} (skipped: no-gallery=${skippedNoGallery}, no-date=${skippedNoDate})${DRY ? ' DRY' : ''}`)
console.log(`with image: ${records.filter((r) => r.image_url).length}`)
if (DRY) {
  for (const r of records.slice(0, 6)) console.log('  ', r.exhibition_name, '@', r.gallery_name, r.start_date, r.image_url ? '[img]' : '')
  process.exit(0)
}

let inserted = 0
for (let i = 0; i < records.length; i += 100) {
  const batch = records.slice(i, i + 100)
  const res = await fetch(`${SUPA}/rest/v1/admin_exhibitions?on_conflict=slug`, {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify(batch)
  })
  if (!res.ok) { console.error(`batch ${i} failed ${res.status}:`, (await res.text()).slice(0, 300)); break }
  inserted += (await res.json()).length
  console.log(`  batch ${i / 100 + 1}: +${(i + batch.length)}`)
}
console.log(`DONE inserted=${inserted}`)
