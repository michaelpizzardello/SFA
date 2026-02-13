import { sampleExhibitions, sampleGalleries } from './sampleData'

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

function readFirstFilled(row, keys, fallback = '') {
  const foundKey = keys.find((key) => row[key])
  return foundKey ? row[foundKey] : fallback
}

function toNumber(value) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function mapGalleryRow(row, index) {
  const name = readFirstFilled(row, ['name', 'gallery_name'])
  const slug = readFirstFilled(row, ['slug'], slugify(name))

  return {
    id: readFirstFilled(row, ['id'], `gal-sheet-${index + 1}`),
    slug,
    name,
    precinct: readFirstFilled(row, ['precinct', 'area', 'neighbourhood'], 'Unspecified'),
    suburb: readFirstFilled(row, ['suburb'], ''),
    postcode: readFirstFilled(row, ['postcode'], ''),
    address: readFirstFilled(row, ['address'], ''),
    latitude: toNumber(readFirstFilled(row, ['latitude', 'lat'])),
    longitude: toNumber(readFirstFilled(row, ['longitude', 'lng', 'lon'])),
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
  const title = readFirstFilled(row, ['title', 'exhibition_title'])
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
    artist: readFirstFilled(row, ['artist', 'artists'], 'Group Exhibition'),
    summary: readFirstFilled(row, ['summary', 'description'], ''),
    startDate: readFirstFilled(row, ['start_date', 'start'], ''),
    endDate: readFirstFilled(row, ['end_date', 'end'], ''),
    openingDate: readFirstFilled(row, ['opening_date', 'opening'], ''),
    openingTime: readFirstFilled(row, ['opening_time'], ''),
    cost: readFirstFilled(row, ['cost', 'entry'], 'Free')
  }
}

async function fetchCsv(url) {
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`)
  }

  return response.text()
}

export async function loadSiteData() {
  const galleryCsvUrl = process.env.NEXT_PUBLIC_GALLERIES_SHEET_URL
  const exhibitionCsvUrl = process.env.NEXT_PUBLIC_EXHIBITIONS_SHEET_URL

  if (!galleryCsvUrl || !exhibitionCsvUrl) {
    return {
      galleries: sampleGalleries,
      exhibitions: sampleExhibitions,
      source: 'sample'
    }
  }

  try {
    const [galleryCsv, exhibitionCsv] = await Promise.all([
      fetchCsv(galleryCsvUrl),
      fetchCsv(exhibitionCsvUrl)
    ])

    const mappedGalleries = parseCsv(galleryCsv)
      .map((row, index) => mapGalleryRow(row, index))
      .filter((gallery) => gallery.name && gallery.slug)

    const galleriesBySlug = new Map(mappedGalleries.map((gallery) => [gallery.slug, gallery]))

    const mappedExhibitions = parseCsv(exhibitionCsv)
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
    console.error('Falling back to sample dataset because sheet loading failed.', error)

    return {
      galleries: sampleGalleries,
      exhibitions: sampleExhibitions,
      source: 'sample'
    }
  }
}
