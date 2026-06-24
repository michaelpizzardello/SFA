// Backfill gallery website + instagram from the Google Sheet Index, then harvest a representative
// cover image from each gallery's own website (og:image etc.) into galleries.cover_url.
// DRY_RUN=1 reports without writing.
import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
  if (m) process.env[m[1]] = m[2]
}
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SHEET = process.env.NEXT_PUBLIC_GALLERIES_SHEET_URL
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const DRY = !!process.env.DRY_RUN
const slugify = (v) => String(v).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

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

// --- sheet index: name=col0, website=col2, instagram=col10 ---
const csv = await fetch(SHEET).then((r) => r.text())
const rows = parseCsv(csv)
const headerIdx = rows.findIndex((r) => r.some((c) => slugify(c) === 'gallery'))
const sheetGalleries = rows.slice(headerIdx + 1)
  .map((r) => ({ name: (r[0] || '').trim(), website: (r[2] || '').trim(), instagram: (r[10] || '').trim() }))
  .filter((g) => g.name)
const bySlugSheet = new Map(sheetGalleries.map((g) => [slugify(g.name), g]))
console.log(`sheet galleries=${sheetGalleries.length}, with website=${sheetGalleries.filter((g) => g.website).length}`)

const gals = await fetch(`${SUPA}/rest/v1/galleries?select=id,slug,name,website,instagram,cover_url`, { headers: H }).then((r) => r.json())
console.log(`supabase galleries=${gals.length}${DRY ? ' (DRY RUN)' : ''}`)

function abs(u, base) { try { return new URL(u, base).href } catch { return null } }
function extractImage(html, base) {
  const pick = (re) => { const m = html.match(re); return m ? m[1] : null }
  let img =
    pick(/<meta[^>]+property=["']og:image(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
    pick(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
  if (!img) { const ld = html.match(/"image"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp)[^"?]*)/i); if (ld) img = ld[1] }
  if (!img) return null
  img = img.replace(/&amp;/g, '&').trim()
  if (/sprite|favicon|placeholder|1x1|pixel|blank\.|spacer/i.test(img)) return null
  return abs(img, base)
}
async function fetchT(url, ms = 12000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms)
  try { return await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SydneyArtFinder/1.0)' } }) } finally { clearTimeout(t) }
}
async function handle(g) {
  const sheet = bySlugSheet.get(g.slug) || {}
  const updates = {}
  if (!g.website && sheet.website) updates.website = sheet.website
  if (!g.instagram && sheet.instagram) updates.instagram = sheet.instagram
  let siteUrl = (g.website || sheet.website || '').trim()
  let coverStatus = g.cover_url ? 'has-cover' : 'no-site'
  if (siteUrl && !g.cover_url) {
    if (!/^https?:\/\//.test(siteUrl)) siteUrl = 'https://' + siteUrl
    try {
      const r = await fetchT(siteUrl)
      if (r.ok) {
        const img = extractImage(await r.text(), r.url || siteUrl)
        if (img) { updates.cover_url = img; coverStatus = 'cover' } else coverStatus = 'no-image'
      } else coverStatus = `http ${r.status}`
    } catch (e) { coverStatus = 'err ' + String(e.message || '').slice(0, 30) }
  }
  if (!Object.keys(updates).length) return { slug: g.slug, cover: coverStatus, wrote: false }
  if (!DRY) {
    const up = await fetch(`${SUPA}/rest/v1/galleries?id=eq.${g.id}`, {
      method: 'PATCH', headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(updates)
    })
    if (!up.ok) return { slug: g.slug, cover: coverStatus, wrote: false, err: `patch ${up.status}` }
  }
  return { slug: g.slug, cover: coverStatus, wrote: Object.keys(updates) }
}

const CONC = 6
let idx = 0
const results = []
async function worker() { while (idx < gals.length) { results.push(await handle(gals[idx++])) } }
await Promise.all(Array.from({ length: CONC }, worker))
const covers = results.filter((r) => r.cover === 'cover').length
const sites = results.filter((r) => Array.isArray(r.wrote) && r.wrote.includes('website')).length
console.log(`\nDONE${DRY ? ' (dry)' : ''}: websites backfilled=${sites}, cover images=${covers} / ${gals.length}`)
const byStatus = {}
for (const r of results) byStatus[r.cover] = (byStatus[r.cover] || 0) + 1
console.log('cover status:', JSON.stringify(byStatus))
