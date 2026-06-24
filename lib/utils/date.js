const SYDNEY_TIME_ZONE = 'Australia/Sydney'

const sydneyIsoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SYDNEY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const humanDateFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

const dayMonthFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short'
})

function toUtcDateFromIso(isoDate) {
  if (!isoDate) {
    return null
  }

  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }

  return new Date(Date.UTC(year, month - 1, day))
}

export function todayISOInSydney() {
  return sydneyIsoFormatter.format(new Date())
}

export function compareISO(firstDate, secondDate) {
  if (!firstDate && !secondDate) {
    return 0
  }

  if (!firstDate) {
    return 1
  }

  if (!secondDate) {
    return -1
  }

  if (firstDate === secondDate) {
    return 0
  }

  return firstDate < secondDate ? -1 : 1
}

export function addDaysISO(isoDate, dayCount) {
  const date = toUtcDateFromIso(isoDate)
  if (!date) {
    return isoDate
  }

  date.setUTCDate(date.getUTCDate() + dayCount)
  return date.toISOString().slice(0, 10)
}

export function getWeekRangeISO(referenceDate = todayISOInSydney()) {
  const date = toUtcDateFromIso(referenceDate)

  if (!date) {
    return {
      weekStart: referenceDate,
      weekEnd: referenceDate
    }
  }

  const dayOfWeek = date.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = addDaysISO(referenceDate, mondayOffset)
  const weekEnd = addDaysISO(weekStart, 6)

  return {
    weekStart,
    weekEnd
  }
}

export function formatDate(isoDate) {
  const date = toUtcDateFromIso(isoDate)
  if (!date) {
    return 'TBA'
  }

  return humanDateFormatter.format(date)
}

export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return 'Dates TBA'
  }

  if (startDate && !endDate) {
    return `From ${formatDate(startDate)}`
  }

  if (!startDate && endDate) {
    return `Until ${formatDate(endDate)}`
  }

  // Both present: en-dash, year printed once (after the end) when the years match.
  const start = toUtcDateFromIso(startDate)
  const end = toUtcDateFromIso(endDate)
  if (!start || !end) {
    return `${formatDate(startDate)}–${formatDate(endDate)}`
  }
  const startText = start.getUTCFullYear() === end.getUTCFullYear() ? dayMonthFormatter.format(start) : formatDate(startDate)
  return `${startText}–${formatDate(endDate)}`
}

export function isWithinRange(targetDate, startDate, endDate) {
  if (!targetDate) {
    return false
  }

  if (startDate && compareISO(targetDate, startDate) < 0) {
    return false
  }

  if (endDate && compareISO(targetDate, endDate) > 0) {
    return false
  }

  return true
}
