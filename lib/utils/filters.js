import { addDaysISO, compareISO, isWithinRange, todayISOInSydney } from './date'
import {
  getExhibitionStatus,
  getGalleryBySlug,
  getGalleryExhibitionSummary,
  getPrecincts
} from './exhibitions'
import { hasValidCoordinates, isInsideBounds } from './map'
import { isTimeWindow, matchesWindow, sortForWindow } from './windows'

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

function getDayDistanceFromToday(date, today) {
  if (!date) {
    return Number.POSITIVE_INFINITY
  }

  const dateTime = Date.parse(`${date}T00:00:00Z`)
  const todayTime = Date.parse(`${today}T00:00:00Z`)

  if (!Number.isFinite(dateTime) || !Number.isFinite(todayTime)) {
    return Number.POSITIVE_INFINITY
  }

  return Math.abs(Math.round((dateTime - todayTime) / 86400000))
}

export function filterExhibitions(
  galleries,
  exhibitions,
  {
    search,
    precinct,
    when,
    openingWindow,
    openingWindows = [],
    statuses = [],
    selectedGallerySlugs = [],
    today = todayISOInSydney()
  }
) {
  const windowMode = isTimeWindow(when)
  const weekEnd = addDaysISO(today, 7)
  const normalizedStatuses = statuses.filter((status) => status === 'current' || status === 'upcoming')
  const effectiveStatuses = normalizedStatuses.length ? normalizedStatuses : ['current', 'upcoming']
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
        exhibition.galleryName,
        exhibition.location,
        gallery?.name,
        gallery?.precinct,
        gallery?.suburb
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

  if (windowMode) {
    // Time-spine mode: a single named window (on-now / this-weekend / opening-this-week /
    // closing-soon) is the organising predicate — it supersedes the legacy status + opening toggles.
    nextExhibitions = nextExhibitions.filter((exhibition) => matchesWindow(exhibition, when, today))
  } else {
    const selectedStatuses = new Set(effectiveStatuses)
    nextExhibitions = nextExhibitions.filter((exhibition) => {
      const status = getExhibitionStatus(exhibition, today)
      return selectedStatuses.has(status)
    })

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
  }

  nextExhibitions.sort((first, second) => {
    const firstStatus = getExhibitionStatus(first, today)
    const secondStatus = getExhibitionStatus(second, today)

    if (firstStatus === 'past' && secondStatus === 'past') {
      return compareISO(second.endDate || second.startDate, first.endDate || first.startDate)
    }

    if (firstStatus === 'past') {
      return 1
    }

    if (secondStatus === 'past') {
      return -1
    }

    const firstDate = first.openingDate || first.startDate
    const secondDate = second.openingDate || second.startDate
    const distanceCompare =
      getDayDistanceFromToday(firstDate, today) - getDayDistanceFromToday(secondDate, today)

    if (distanceCompare !== 0) {
      return distanceCompare
    }

    return compareISO(firstDate, secondDate)
  })

  if (windowMode) {
    nextExhibitions = sortForWindow(nextExhibitions, when, today)
  }

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
