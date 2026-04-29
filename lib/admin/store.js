import { randomUUID } from 'node:crypto'
import { formatDate, getWeekRangeISO, todayISOInSydney } from '../utils/date'
import {
  deleteSupabaseAdminExhibition,
  deleteSupabaseAdminImage,
  insertSupabaseAdminExhibition,
  loadSupabaseAdminExhibitionById,
  loadSupabaseAdminExhibitions,
  updateSupabaseAdminExhibition
} from '../data/supabase'

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toIsoDate(value) {
  if (!value) {
    return ''
  }

  const normalized = String(value).trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : ''
}

function toOptionalString(value) {
  return String(value || '').trim()
}

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function toBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1
}

function createOpeningInformation(openingDate, openingTime) {
  if (!openingDate) {
    return ''
  }

  if (!openingTime) {
    return `Opening ${formatDate(openingDate)}`
  }

  return `Opening ${formatDate(openingDate)} | ${openingTime}`
}

function normalizeAdminRecord(record) {
  const exhibitionName = toOptionalString(record.exhibitionName || record.title)
  const startDate = toIsoDate(record.startDate || record.openingDate)
  const endDate = toIsoDate(record.endDate)
  const referenceDate = startDate || todayISOInSydney()
  const { weekStart, weekEnd } = record.weekStart && record.weekEnd
    ? { weekStart: toIsoDate(record.weekStart), weekEnd: toIsoDate(record.weekEnd) }
    : getWeekRangeISO(referenceDate)

  return {
    id: toOptionalString(record.id) || randomUUID(),
    slug: toOptionalString(record.slug) || slugify(`${record.gallerySlug || 'exhibition'}-${exhibitionName}`),
    weekStart: weekStart || referenceDate,
    weekEnd: weekEnd || referenceDate,
    galleryMode: record.galleryMode === 'manual' ? 'manual' : 'index',
    gallerySlug: toOptionalString(record.gallerySlug),
    galleryName: toOptionalString(record.galleryName),
    location: toOptionalString(record.location),
    exhibitionName,
    startDate,
    endDate,
    openingInformation: toOptionalString(record.openingInformation),
    imageUrl: toOptionalString(record.imageUrl),
    rating: toOptionalNumber(record.rating),
    featured: toBoolean(record.featured),
    ongoing: toBoolean(record.ongoing),
    artist: toOptionalString(record.artist),
    summary: toOptionalString(record.summary),
    cost: toOptionalString(record.cost) || 'Free',
    createdAt: toOptionalString(record.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function buildGalleryLookup(galleries) {
  const bySlug = new Map()
  const byName = new Map()

  galleries.forEach((gallery) => {
    bySlug.set(gallery.slug, gallery)
    byName.set(gallery.name.trim().toLowerCase(), gallery)
  })

  return { bySlug, byName }
}

function normalizeGallerySelection(input, galleries) {
  const { bySlug, byName } = buildGalleryLookup(galleries)
  const selectedGallery = bySlug.get(toOptionalString(input.gallerySlug))
  const manualGalleryName = toOptionalString(input.manualGalleryName)
  const manualNameMatch = manualGalleryName ? byName.get(manualGalleryName.toLowerCase()) : null

  if (selectedGallery) {
    return {
      galleryMode: 'index',
      gallerySlug: selectedGallery.slug,
      galleryName: selectedGallery.name,
      location: toOptionalString(input.location) || selectedGallery.suburb || selectedGallery.precinct || ''
    }
  }

  if (manualNameMatch) {
    return {
      galleryMode: 'index',
      gallerySlug: manualNameMatch.slug,
      galleryName: manualNameMatch.name,
      location: toOptionalString(input.location) || manualNameMatch.suburb || manualNameMatch.precinct || ''
    }
  }

  if (!manualGalleryName) {
    throw new Error('Gallery is required.')
  }

  return {
    galleryMode: 'manual',
    gallerySlug: `manual-${slugify(manualGalleryName)}`,
    galleryName: manualGalleryName,
    location: toOptionalString(input.location)
  }
}

function createRecordFromInput(input, galleries, existingRecord = null) {
  const gallerySelection = normalizeGallerySelection(input, galleries)
  const exhibitionName = toOptionalString(input.exhibitionName)
  const startDate = toIsoDate(input.startDate)
  const endDate = toIsoDate(input.endDate)
  const weekStart = toIsoDate(input.weekStart) || getWeekRangeISO(startDate || todayISOInSydney()).weekStart
  const weekEnd = toIsoDate(input.weekEnd) || getWeekRangeISO(startDate || todayISOInSydney()).weekEnd

  if (!exhibitionName) {
    throw new Error('Exhibition name is required.')
  }

  if (!startDate) {
    throw new Error('Start date is required.')
  }

  return normalizeAdminRecord({
    id: existingRecord?.id || randomUUID(),
    slug: existingRecord?.slug || slugify(`${gallerySelection.gallerySlug}-${exhibitionName}`),
    weekStart,
    weekEnd,
    ...gallerySelection,
    exhibitionName,
    startDate,
    endDate,
    openingInformation: input.openingInformation,
    imageUrl: input.imageUrl,
    rating: input.rating,
    featured: input.featured ?? existingRecord?.featured,
    ongoing: input.ongoing ?? existingRecord?.ongoing,
    artist: input.artist ?? existingRecord?.artist,
    summary: input.summary ?? existingRecord?.summary,
    cost: input.cost ?? existingRecord?.cost,
    createdAt: existingRecord?.createdAt
  })
}

export function mapAdminRecordToExhibition(record) {
  return {
    id: record.id,
    slug: record.slug,
    gallerySlug: record.gallerySlug,
    galleryName: record.galleryName,
    title: record.exhibitionName,
    artist: record.artist || '',
    summary: record.summary || '',
    startDate: record.startDate,
    endDate: record.endDate,
    openingDate: record.startDate,
    openingTime: '',
    openingInformation: record.openingInformation || '',
    imageUrl: record.imageUrl || '',
    cost: record.cost || 'Free',
    rating: record.rating,
    featured: Boolean(record.featured),
    ongoing: Boolean(record.ongoing),
    location: record.location || ''
  }
}

export function buildManualGalleries(records, galleries) {
  const galleryLookup = new Set(galleries.map((gallery) => gallery.slug))
  const manualGalleries = []

  records.forEach((record) => {
    if (!record.gallerySlug || galleryLookup.has(record.gallerySlug) || !record.galleryName) {
      return
    }

    galleryLookup.add(record.gallerySlug)
    manualGalleries.push({
      id: `gal-admin-${record.gallerySlug}`,
      slug: record.gallerySlug,
      name: record.galleryName,
      precinct: record.location || 'Unspecified',
      suburb: record.location || '',
      postcode: '',
      address: '',
      latitude: null,
      longitude: null,
      website: '',
      instagram: '',
      phone: '',
      email: '',
      openingHours: [],
      about: ''
    })
  })

  return manualGalleries
}

async function loadExistingRecord(id) {
  const record = await loadSupabaseAdminExhibitionById(id)

  if (!record) {
    throw new Error('Exhibition not found.')
  }

  return normalizeAdminRecord(record)
}

export async function loadAdminStore() {
  const exhibitions = await loadSupabaseAdminExhibitions()

  return {
    version: 2,
    exhibitions: exhibitions.map(normalizeAdminRecord)
  }
}

export async function createAdminExhibition(input, galleries = []) {
  const record = createRecordFromInput(input, galleries)
  return insertSupabaseAdminExhibition(record)
}

export async function updateAdminExhibition(id, input, galleries = []) {
  const existingRecord = await loadExistingRecord(id)
  const updatedRecord = createRecordFromInput(
    {
      ...existingRecord,
      ...input
    },
    galleries,
    existingRecord
  )

  const persistedRecord = await updateSupabaseAdminExhibition(id, updatedRecord)

  if (existingRecord.imageUrl && existingRecord.imageUrl !== persistedRecord.imageUrl) {
    await deleteSupabaseAdminImage(existingRecord.imageUrl)
  }

  return persistedRecord
}

export async function deleteAdminExhibition(id) {
  const existingRecord = await loadExistingRecord(id)

  await deleteSupabaseAdminExhibition(id)

  if (existingRecord.imageUrl) {
    await deleteSupabaseAdminImage(existingRecord.imageUrl)
  }
}
