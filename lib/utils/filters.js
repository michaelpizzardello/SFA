import { addDaysISO, compareISO, isWithinRange, todayISOInSydney } from './date'
import {
  getExhibitionStatus,
  getGalleryBySlug,
  getGalleryExhibitionSummary,
  getPrecincts
} from './exhibitions'
import { hasValidCoordinates, isInsideBounds } from './map'

export function filterGalleries(galleries, { search, precinct, sort }) {
  let nextGalleries = [...galleries]

  const searchTerm = search.trim().toLowerCase()
  if (searchTerm) {
    nextGalleries = nextGalleries.filter((gallery) => {
      const haystack = [gallery.name, gallery.precinct, gallery.suburb, gallery.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchTerm)
    })
  }

  if (precinct !== 'all') {
    nextGalleries = nextGalleries.filter((gallery) => gallery.precinct === precinct)
  }

  if (sort === 'precinct') {
    nextGalleries.sort((first, second) => {
      const precinctCompare = first.precinct.localeCompare(second.precinct)
      if (precinctCompare !== 0) {
        return precinctCompare
      }

      return first.name.localeCompare(second.name)
    })
  } else {
    nextGalleries.sort((first, second) => first.name.localeCompare(second.name))
  }

  return nextGalleries
}

export function getGalleryDirectoryData(galleries, exhibitions) {
  const today = todayISOInSydney()

  return galleries.map((gallery) => ({
    gallery,
    summary: getGalleryExhibitionSummary(exhibitions, gallery.slug, today)
  }))
}

export function filterExhibitions(
  galleries,
  exhibitions,
  {
    search,
    precinct,
    openingWindow,
    openingWindows = [],
    statuses = [],
    selectedGallerySlugs = [],
    today = todayISOInSydney()
  }
) {
  const weekEnd = addDaysISO(today, 7)
  const normalizedStatuses = statuses.filter((status) => status === 'current' || status === 'upcoming')
  const normalizedOpeningWindows = openingWindows.filter((window) => window === 'tonight' || window === 'week')

  let nextExhibitions = [...exhibitions]

  const searchTerm = search.trim().toLowerCase()
  if (searchTerm) {
    nextExhibitions = nextExhibitions.filter((exhibition) => {
      const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
      const haystack = [
        exhibition.title,
        exhibition.artist,
        exhibition.summary,
        gallery?.name,
        gallery?.precinct
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchTerm)
    })
  }

  if (precinct !== 'all') {
    nextExhibitions = nextExhibitions.filter((exhibition) => {
      const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
      return gallery?.precinct === precinct
    })
  }

  if (selectedGallerySlugs.length) {
    const selectedSet = new Set(selectedGallerySlugs)
    nextExhibitions = nextExhibitions.filter((exhibition) => selectedSet.has(exhibition.gallerySlug))
  }

  if (normalizedStatuses.length) {
    const selectedStatuses = new Set(normalizedStatuses)
    nextExhibitions = nextExhibitions.filter((exhibition) => {
      const status = getExhibitionStatus(exhibition, today)
      return selectedStatuses.has(status)
    })
  } else if (openingWindow === 'current-upcoming') {
    nextExhibitions = nextExhibitions.filter((exhibition) => {
      const status = getExhibitionStatus(exhibition, today)
      return status === 'current' || status === 'upcoming'
    })
  }

  if (normalizedOpeningWindows.length) {
    const includeTonight = normalizedOpeningWindows.includes('tonight')
    const includeWeek = normalizedOpeningWindows.includes('week')

    nextExhibitions = nextExhibitions.filter((exhibition) => {
      if (!exhibition.openingDate) {
        return false
      }

      const isTonight = compareISO(exhibition.openingDate, today) === 0
      const isThisWeek = isWithinRange(exhibition.openingDate, today, weekEnd)

      return (includeTonight && isTonight) || (includeWeek && isThisWeek)
    })
  } else if (openingWindow === 'tonight') {
    nextExhibitions = nextExhibitions.filter(
      (exhibition) => exhibition.openingDate && compareISO(exhibition.openingDate, today) === 0
    )
  } else if (openingWindow === 'week') {
    nextExhibitions = nextExhibitions.filter(
      (exhibition) => exhibition.openingDate && isWithinRange(exhibition.openingDate, today, weekEnd)
    )
  }

  const statusOrder = {
    current: 0,
    upcoming: 1,
    past: 2
  }

  nextExhibitions.sort((first, second) => {
    const firstStatus = getExhibitionStatus(first, today)
    const secondStatus = getExhibitionStatus(second, today)

    if (statusOrder[firstStatus] !== statusOrder[secondStatus]) {
      return statusOrder[firstStatus] - statusOrder[secondStatus]
    }

    if (firstStatus === 'past') {
      return compareISO(second.endDate || second.startDate, first.endDate || first.startDate)
    }

    const firstDate = first.openingDate || first.startDate
    const secondDate = second.openingDate || second.startDate

    return compareISO(firstDate, secondDate)
  })

  return nextExhibitions
}

export function filterMapGalleries(galleries, { search, precinct, viewportBounds, areaEnabled }) {
  const sortedGalleries = filterGalleries(galleries, {
    search,
    precinct,
    sort: 'alphabetical'
  }).filter(hasValidCoordinates)

  if (!areaEnabled || !viewportBounds) {
    return sortedGalleries
  }

  return sortedGalleries.filter((gallery) => isInsideBounds(gallery, viewportBounds))
}

export function getPrecinctOptions(galleries) {
  return getPrecincts(galleries)
}
