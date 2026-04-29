import { compareISO, todayISOInSydney } from './date'

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

export function getGalleryBySlug(galleries, slug) {
  return galleries.find((gallery) => gallery.slug === slug) || null
}

export function getPrecincts(galleries) {
  return [...new Set(galleries.map((gallery) => gallery.precinct).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
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
