import { buildManualGalleries, mapAdminRecordToExhibition } from '../admin/store'
import { compareISO } from '../utils/date'
import { dedupeExhibitions } from '../utils/exhibitions'
import { GALLERY_ADDRESS_OVERRIDES, GALLERY_COORDINATE_OVERRIDES } from './galleryAddressOverrides'
import { loadSupabaseGalleries, loadSupabasePublicExhibitions } from './supabase'
import { unstable_cache } from 'next/cache'
import { PUBLIC_SITE_DATA_CACHE_TAG } from './cache'

const PUBLIC_EXHIBITION_START_DATE = '2026-03-01'
const SHEET_EXHIBITION_IMAGE_OVERRIDES = {
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

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseOpeningHours(value) {
  if (!value) {
    return []
  }

  return value
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseCsv(csvText) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index]

    if (char === '"') {
      const nextChar = csvText[index + 1]

      if (inQuotes && nextChar === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[index + 1] === '\n') {
        index += 1
      }

      row.push(cell.trim())
      cell = ''

      if (row.some((entry) => entry.length > 0)) {
        rows.push(row)
      }

      row = []
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim())
    if (row.some((entry) => entry.length > 0)) {
      rows.push(row)
    }
  }

  if (!rows.length) {
    return []
  }

  const headers = rows
    .shift()
    .map((header) =>
      slugify(header)
        .replace(/-/g, '_')
        .replace(/_+/g, '_')
    )

  return rows.map((record) => {
    const mappedRow = {}

    headers.forEach((header, index) => {
      mappedRow[header] = record[index] || ''
    })

    return mappedRow
  })
}

function parseSheetRows(csvText) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index]

    if (char === '"') {
      const nextChar = csvText[index + 1]

      if (inQuotes && nextChar === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[index + 1] === '\n') {
        index += 1
      }

      row.push(cell.trim())
      cell = ''

      if (row.some((entry) => entry.length > 0)) {
        rows.push(row)
      }

      row = []
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim())
    if (row.some((entry) => entry.length > 0)) {
      rows.push(row)
    }
  }

  return rows
}

function readFirstFilled(row, keys, fallback = '') {
  const foundKey = keys.find((key) => row[key])
  return foundKey ? row[foundKey] : fallback
}

function normalizeSheetDate(value) {
  const normalized = String(value || '').trim()

  if (!normalized) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized
  }

  const slashMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)

  if (!slashMatch) {
    return normalized
  }

  const firstPart = Number(slashMatch[1])
  const secondPart = Number(slashMatch[2])
  const yearPart = slashMatch[3] ? Number(slashMatch[3]) : new Date().getFullYear()
  const year = yearPart < 100 ? 2000 + yearPart : yearPart
  const isFullSheetDate = Boolean(slashMatch[3])
  const month = isFullSheetDate ? firstPart : secondPart
  const day = isFullSheetDate ? secondPart : firstPart

  if (!month || !day || !year) {
    return normalized
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function toNumber(value) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function mapGalleryRow(row, index) {
  const name = readFirstFilled(row, ['name', 'gallery_name', 'gallery'])
  const slug = readFirstFilled(row, ['slug'], slugify(name))
  const coordinateOverride = GALLERY_COORDINATE_OVERRIDES[slug] || {}

  return {
    id: readFirstFilled(row, ['id'], `gal-sheet-${index + 1}`),
    slug,
    name,
    precinct: readFirstFilled(row, ['precinct', 'area', 'neighbourhood'], 'Unspecified'),
    suburb: readFirstFilled(row, ['suburb'], ''),
    postcode: readFirstFilled(row, ['postcode'], ''),
    address: GALLERY_ADDRESS_OVERRIDES[slug] || readFirstFilled(row, ['address'], ''),
    latitude: coordinateOverride.latitude ?? toNumber(readFirstFilled(row, ['latitude', 'lat'])),
    longitude: coordinateOverride.longitude ?? toNumber(readFirstFilled(row, ['longitude', 'lng', 'lon'])),
    website: readFirstFilled(row, ['website', 'url'], ''),
    instagram: readFirstFilled(row, ['instagram', 'instagram_url'], ''),
    phone: readFirstFilled(row, ['phone', 'contact_phone'], ''),
    email: readFirstFilled(row, ['email', 'contact_email'], ''),
    openingHours: parseOpeningHours(
      readFirstFilled(row, ['opening_hours', 'hours', 'openinghours'], '')
    ),
    about: readFirstFilled(row, ['about', 'description'], '')
  }
}

function mapExhibitionRow(row, index, galleriesBySlug) {
  const title = readFirstFilled(row, ['title', 'exhibition_title', 'exhibition'])
  const candidateSlug = readFirstFilled(row, ['gallery_slug', 'gallery'])
  const gallerySlug = galleriesBySlug.has(candidateSlug)
    ? candidateSlug
    : slugify(readFirstFilled(row, ['gallery_name', 'gallery']))
  const fallbackId = readFirstFilled(row, ['id'], `ex-sheet-${index + 1}`)
  const fallbackSlug = slugify(`${gallerySlug}-${title}-${fallbackId}`)

  return {
    id: fallbackId,
    slug: readFirstFilled(row, ['slug'], fallbackSlug),
    gallerySlug,
    title,
    artist: readFirstFilled(row, ['artist', 'artists'], ''),
    summary: readFirstFilled(row, ['summary', 'description'], ''),
    startDate: readFirstFilled(row, ['start_date', 'start'], ''),
    endDate: readFirstFilled(row, ['end_date', 'end'], ''),
    openingDate: readFirstFilled(row, ['opening_date', 'opening'], readFirstFilled(row, ['start_date', 'start'], '')),
    openingTime: readFirstFilled(row, ['opening_time'], ''),
    openingInformation: readFirstFilled(row, ['opening_information'], ''),
    imageUrl: readFirstFilled(row, ['image_url', 'image']) || SHEET_EXHIBITION_IMAGE_OVERRIDES[`${gallerySlug}::${slugify(title)}`] || '',
    cost: readFirstFilled(row, ['cost', 'entry'], 'Free'),
    location: readFirstFilled(row, ['location'], '')
  }
}

async function fetchCsv(url) {
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`)
  }

  return response.text()
}

function shouldLogFallback(error) {
  if (process.env.NODE_ENV !== 'development') {
    return true
  }

  const message = `${error?.message || ''} ${error?.cause?.message || ''}`
  return !message.includes('ENOTFOUND')
}

function logFallback(message, error) {
  if (shouldLogFallback(error)) {
    console.error(message, error)
  }
}

function filterPublicExhibitionsByRecency(exhibitions) {
  return exhibitions.filter((exhibition) => {
    const relevantDate = exhibition.endDate || exhibition.startDate || exhibition.openingDate

    if (!relevantDate) {
      return true
    }

    return compareISO(relevantDate, PUBLIC_EXHIBITION_START_DATE) >= 0
  })
}

export async function loadSheetSiteData() {
  const galleryCsvUrl = process.env.NEXT_PUBLIC_GALLERIES_SHEET_URL
  const exhibitionCsvUrl = process.env.NEXT_PUBLIC_EXHIBITIONS_SHEET_URL

  if (!galleryCsvUrl || !exhibitionCsvUrl) {
    return {
      galleries: [],
      exhibitions: [],
      source: 'empty'
    }
  }

  try {
    const [galleryCsv, exhibitionCsv] = await Promise.all([
      fetchCsv(galleryCsvUrl),
      fetchCsv(exhibitionCsvUrl)
    ])

    const galleryRows = parseSheetRows(galleryCsv)
    const exhibitionRows = parseSheetRows(exhibitionCsv)
    const normalizedGalleryRows = galleryRows.length > 1 ? galleryRows.slice(1).map((row) => ({
      gallery_name: row[0] || '',
      name: row[0] || '',
      location: row[1] || '',
      suburb: row[1] || '',
      precinct: row[1] || '',
      url: row[2] || '',
      website: row[2] || ''
    })) : parseCsv(galleryCsv)
    const exhibitionHeaderIndex = exhibitionRows.findIndex((row) =>
      row.some((cell) => slugify(cell) === 'gallery') &&
      row.some((cell) => slugify(cell) === 'exhibition')
    )
    const normalizedExhibitionRows = (exhibitionHeaderIndex >= 0
      ? exhibitionRows.slice(exhibitionHeaderIndex + 1)
      : []
    ).map((row) => ({
      id: row[0] || '',
      gallery: row[1] || '',
      gallery_name: row[1] || '',
      location: row[2] || '',
      exhibition: row[3] || '',
      start_date: normalizeSheetDate(row[10] || row[4] || ''),
      end_date: normalizeSheetDate(row[11] || row[5] || ''),
      opening_information: row[6] || '',
      rating: row[7] || '',
      featured: row[8] || '',
      ongoing: row[9] || '',
      image_url: row[12] || ''
    }))

    const mappedGalleries = normalizedGalleryRows
      .map((row, index) => mapGalleryRow(row, index))
      .filter((gallery) => gallery.name && gallery.slug)

    const galleriesBySlug = new Map(mappedGalleries.map((gallery) => [gallery.slug, gallery]))

    const mappedExhibitions = normalizedExhibitionRows
      .map((row, index) => mapExhibitionRow(row, index, galleriesBySlug))
      .filter((exhibition) => exhibition.title && galleriesBySlug.has(exhibition.gallerySlug))

    if (!mappedGalleries.length) {
      throw new Error('No gallery rows were parsed from Google Sheets.')
    }

    return {
      galleries: mappedGalleries,
      exhibitions: mappedExhibitions,
      source: 'google-sheets'
    }
  } catch (error) {
    logFallback('Sheet loading failed.', error)

    return {
      galleries: [],
      exhibitions: [],
      source: 'empty'
    }
  }
}

export async function loadGalleryDirectoryData() {
  try {
    const supabaseGalleries = await loadSupabaseGalleries()

    if (supabaseGalleries.length) {
      return {
        galleries: supabaseGalleries,
        source: 'supabase'
      }
    }
  } catch (error) {
    logFallback('Falling back to sheet galleries because Supabase loading failed.', error)
  }

  const sheetData = await loadSheetSiteData()

  return {
    galleries: sheetData.galleries,
    source: sheetData.source
  }
}

async function loadSiteDataUncached() {
  // These sources are independent. Loading them together avoids stacking three
  // remote round trips on every cold render. Resolve each raw source once so a
  // gallery API failure cannot trigger a duplicate Sheet download.
  const [galleryResult, exhibitionResult, sheetData] = await Promise.all([
    loadSupabaseGalleries()
      .then((galleries) => ({ galleries, error: null }))
      .catch((error) => ({ galleries: [], error })),
    loadSupabasePublicExhibitions()
      .then((records) => records.map(mapAdminRecordToExhibition))
      .catch((error) => {
        return { error }
      }),
    loadSheetSiteData().catch((error) => {
      logFallback('Sheet loading failed.', error)
      return { galleries: [], exhibitions: [], source: 'empty' }
    })
  ])

  if (galleryResult.error) {
    logFallback('Falling back to sheet galleries because Supabase loading failed.', galleryResult.error)
  }
  if (exhibitionResult.error) {
    logFallback('Supabase exhibition loading failed.', exhibitionResult.error)
  }

  const supabaseExhibitions = exhibitionResult.error ? [] : exhibitionResult
  let galleries = galleryResult.galleries.length
    ? galleryResult.galleries
    : sheetData.galleries

  if (galleryResult.error && exhibitionResult.error && sheetData.source === 'empty') {
    throw new Error('All public catalogue sources failed.')
  }

  // Merge galleries: keep directory galleries, add any sheet-only galleries by slug.
  const knownGallerySlugs = new Set(galleries.map((gallery) => gallery.slug))
  const sheetOnlyGalleries = sheetData.galleries.filter(
    (gallery) => gallery.slug && !knownGallerySlugs.has(gallery.slug)
  )
  galleries = [...galleries, ...sheetOnlyGalleries]

  // Merge exhibitions: preserve source order, then collapse public duplicates using
  // gallery + display artist/title + date range. The richer record wins.
  const mergedExhibitions = dedupeExhibitions([
    ...supabaseExhibitions,
    ...sheetData.exhibitions
  ])

  const manualGalleries = buildManualGalleries(mergedExhibitions, galleries)

  return {
    galleries: [...galleries, ...manualGalleries],
    exhibitions: filterPublicExhibitionsByRecency(mergedExhibitions),
    source: 'merged'
  }
}

// Public catalogue data changes far less often than it is read. A short shared
// cache keeps navigation responsive while limiting publication staleness to one
// minute after an admin or Sheet update.
export const loadSiteData = unstable_cache(
  loadSiteDataUncached,
  ['public-site-data-v1'],
  { revalidate: 60, tags: [PUBLIC_SITE_DATA_CACHE_TAG] }
)
