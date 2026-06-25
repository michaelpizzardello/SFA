import { addDaysISO, compareISO, getWeekRangeISO, isWithinRange, todayISOInSydney } from './date'
import { getExhibitionStatus } from './exhibitions'

// TIME is the organising spine of SAF: human-named, URL-addressable windows computed purely
// from startDate/endDate (the only always-present fields) — no schema, no opening-night object.
export const CLOSING_SOON_DAYS = 14
export const OPENING_WEEK_DAYS = 7

export const TIME_WINDOWS = [
  { slug: 'on-now', label: 'On Now', short: 'On now' },
  { slug: 'this-weekend', label: 'This Weekend', short: 'This weekend' },
  { slug: 'opening-this-week', label: 'Opening This Week', short: 'Opening this week' },
  { slug: 'closing-soon', label: 'Closing Soon', short: 'Closing soon' }
]

export const TIME_WINDOW_SLUGS = TIME_WINDOWS.map((w) => w.slug)
export const DEFAULT_WINDOW = 'on-now'

export function isTimeWindow(slug) {
  return TIME_WINDOW_SLUGS.includes(slug)
}

export function normalizeWindow(slug) {
  return isTimeWindow(slug) ? slug : DEFAULT_WINDOW
}

export function getWindow(slug) {
  return TIME_WINDOWS.find((w) => w.slug === slug) || null
}

export function getWindowLabel(slug) {
  return getWindow(slug)?.label || ''
}

// Saturday + Sunday of the current week (getWeekRangeISO is Mon–Sun).
function weekendRange(today) {
  const { weekStart, weekEnd } = getWeekRangeISO(today)
  return { weekendStart: addDaysISO(weekStart, 5), weekendEnd: weekEnd }
}

// Does the exhibition belong in this time window today? Pure date math.
export function matchesWindow(exhibition, when, today = todayISOInSydney()) {
  const status = getExhibitionStatus(exhibition, today)
  const { startDate, endDate } = exhibition

  switch (when) {
    case 'on-now':
      return status === 'current'
    case 'opening-this-week':
      return (
        status === 'upcoming' &&
        !!startDate &&
        isWithinRange(startDate, today, addDaysISO(today, OPENING_WEEK_DAYS))
      )
    case 'closing-soon':
      return (
        status === 'current' &&
        !!endDate &&
        isWithinRange(endDate, today, addDaysISO(today, CLOSING_SOON_DAYS))
      )
    case 'this-weekend': {
      if (!startDate) return false
      const { weekendStart, weekendEnd } = weekendRange(today)
      const close = endDate || startDate
      // the show is open at some point across the coming weekend
      return compareISO(startDate, weekendEnd) <= 0 && compareISO(close, weekendStart) >= 0
    }
    default:
      return true
  }
}

// Window-aware ordering: surface the most time-urgent first within each window.
export function sortForWindow(exhibitions, when, today = todayISOInSydney()) {
  const list = [...exhibitions]
  if (when === 'closing-soon') {
    return list.sort((a, b) => compareISO(a.endDate || a.startDate, b.endDate || b.startDate))
  }
  if (when === 'opening-this-week' || when === 'this-weekend') {
    return list.sort((a, b) => compareISO(a.startDate || a.openingDate, b.startDate || b.openingDate))
  }
  return list
}
