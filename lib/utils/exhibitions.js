import { compareISO, todayISOInSydney } from './date'
import { splitTitle } from './splitTitle'

const EXHIBITION_SLUG_REDIRECTS = {
  'gallery-144-formerly-outsider-lily-mortensen-gr-nsel-s-boundless':
    'gallery-144-formerly-outsider-gr-nsel-s-boundless'
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getExhibitionSlug(exhibition) {
  if (exhibition.slug) {
    return exhibition.slug
  }

  if (exhibition.id) {
    return slugify(exhibition.id)
  }

  return slugify(`${exhibition.gallerySlug || 'exhibition'}-${exhibition.title || 'untitled'}`)
}

function normalizeIdentityPart(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()
}

export function getExhibitionIdentity(exhibition) {
  const { artist, title } = splitTitle(exhibition.artist, exhibition.title)

  return [
    exhibition.gallerySlug,
    artist,
    title,
    exhibition.startDate || exhibition.openingDate,
    exhibition.endDate
  ]
    .map(normalizeIdentityPart)
    .join('::')
}

function exhibitionCompleteness(exhibition) {
  return [
    exhibition.imageUrl && 8,
    exhibition.summary && 4,
    exhibition.openingInformation && 2,
    exhibition.location && 1
  ].reduce((total, value) => total + (Number(value) || 0), 0)
}

export function dedupeExhibitions(exhibitions) {
  const deduped = []
  const indexByIdentity = new Map()

  for (const exhibition of exhibitions) {
    const identity = getExhibitionIdentity(exhibition)
    const existingIndex = indexByIdentity.get(identity)

    if (existingIndex === undefined) {
      indexByIdentity.set(identity, deduped.length)
      deduped.push(exhibition)
      continue
    }

    if (exhibitionCompleteness(exhibition) > exhibitionCompleteness(deduped[existingIndex])) {
      deduped[existingIndex] = exhibition
    }
  }

  return deduped
}

export function getCanonicalExhibitionSlug(slug) {
  return EXHIBITION_SLUG_REDIRECTS[slug] || slug
}

export function getGalleryBySlug(galleries, slug) {
  return galleries.find((gallery) => gallery.slug === slug) || null
}

export function getPrecincts(galleries) {
  // Trim + case-insensitive dedupe: raw data carries variants like "Darlinghurst "
  const seen = new Map()
  for (const gallery of galleries) {
    const raw = String(gallery.precinct || '').trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (!seen.has(key)) seen.set(key, raw)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b))
}

export function getExhibitionStatus(exhibition, today = todayISOInSydney()) {
  const startDate = exhibition.startDate || exhibition.openingDate
  const endDate = exhibition.endDate

  if (endDate && compareISO(today, endDate) > 0) {
    return 'past'
  }

  if (startDate && compareISO(today, startDate) < 0) {
    return 'upcoming'
  }

  if (startDate && !endDate && compareISO(today, startDate) > 0) {
    return 'past'
  }

  return 'current'
}

export function getExhibitionsByGallery(exhibitions, gallerySlug) {
  return exhibitions
    .filter((exhibition) => exhibition.gallerySlug === gallerySlug)
    .sort((first, second) =>
      compareISO(second.startDate || second.openingDate, first.startDate || first.openingDate)
    )
}

export function getExhibitionBySlug(exhibitions, slug) {
  return exhibitions.find((exhibition) => getExhibitionSlug(exhibition) === slug) || null
}

export function getGalleryExhibitionSummary(exhibitions, gallerySlug, today = todayISOInSydney()) {
  return exhibitions
    .filter((exhibition) => exhibition.gallerySlug === gallerySlug)
    .reduce(
      (summary, exhibition) => {
        const status = getExhibitionStatus(exhibition, today)
        summary[status] += 1
        return summary
      },
      { current: 0, upcoming: 0, past: 0 }
    )
}
