// One-time seed: import the Google Sheet's exhibitions into Supabase admin_exhibitions, so the
// platform (now Supabase-backed) shows the full catalogue. Reuses the app's exact sheet parser
// (loadSheetSiteData). Idempotent: ON CONFLICT (slug) DO NOTHING. Marks rows source='auto'.
import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
  if (m) process.env[m[1]] = m[2]
}

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPA || !KEY) throw new Error('Missing Supabase env')

const { loadSheetSiteData } = await import('../lib/data/loadData.js')
const data = await loadSheetSiteData()
console.log(`sheet source=${data.source} galleries=${data.galleries.length} exhibitions=${data.exhibitions.length}`)

// slug -> {id,name} from Supabase galleries
const gres = await fetch(`${SUPA}/rest/v1/galleries?select=id,slug,name`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
})
const gals = await gres.json()
const bySlug = new Map(gals.map((g) => [g.slug, g]))
console.log(`supabase galleries=${gals.length}`)

const rows = data.exhibitions
  .filter((e) => e.startDate && bySlug.has(e.gallerySlug))
  .map((e) => {
    const g = bySlug.get(e.gallerySlug)
    return {
      slug: e.slug,
      gallery_mode: 'index',
      gallery_id: g.id,
      gallery_slug: e.gallerySlug,
      gallery_name: g.name,
      exhibition_name: e.title,
      artist: e.artist || '',
      summary: e.summary || '',
      start_date: e.startDate,
      end_date: e.endDate || null,
      opening_information: e.openingInformation || '',
      image_url: e.imageUrl || '',
      cost: e.cost || 'Free',
      location: e.location || '',
      published: true,
      source: 'auto'
    }
  })

// de-dupe by slug within the batch (sheet can repeat)
const seen = new Set()
const unique = rows.filter((r) => (seen.has(r.slug) ? false : seen.add(r.slug)))
console.log(`importable exhibitions (matched gallery + start date, unique slug)=${unique.length}`)
const skipped = data.exhibitions.length - unique.length
if (skipped) console.log(`skipped ${skipped} (no start date / gallery not in directory / dup slug)`)

if (process.env.DRY_RUN) {
  const today = new Date().toISOString().slice(0, 10)
  const upcomingOrCurrent = unique.filter((r) => !r.end_date || r.end_date >= today)
  console.log(`DRY RUN — would insert ${unique.length} exhibitions (${upcomingOrCurrent.length} current/upcoming as of ${today}).`)
  console.log('sample:')
  for (const r of unique.slice(0, 5)) console.log(`  - ${r.exhibition_name} @ ${r.gallery_name} (${r.start_date}..${r.end_date || 'open'})`)
  process.exit(0)
}

let inserted = 0
for (let i = 0; i < unique.length; i += 100) {
  const batch = unique.slice(i, i + 100)
  const res = await fetch(`${SUPA}/rest/v1/admin_exhibitions?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=representation'
    },
    body: JSON.stringify(batch)
  })
  if (!res.ok) {
    console.error(`batch ${i} failed (${res.status}):`, (await res.text()).slice(0, 400))
    break
  }
  const out = await res.json()
  inserted += out.length
  console.log(`  batch ${i / 100 + 1}: +${out.length}`)
}
console.log(`DONE. inserted=${inserted}`)
