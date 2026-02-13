export const SYDNEY_CENTER = { lat: -33.8688, lng: 151.2093 }
export const SYDNEY_DEFAULT_ZOOM = 11

export function hasValidCoordinates(gallery) {
  return (
    Number.isFinite(gallery.latitude) &&
    Number.isFinite(gallery.longitude) &&
    Math.abs(gallery.latitude) <= 90 &&
    Math.abs(gallery.longitude) <= 180
  )
}

export function normalizeQueryString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

export function normalizeSort(value) {
  return value === 'precinct' ? 'precinct' : 'alphabetical'
}

export function normalizeOpeningWindow(value) {
  const allowed = new Set(['current-upcoming', 'tonight', 'week', 'all'])
  return allowed.has(value) ? value : 'current-upcoming'
}

export function toFiniteNumber(value) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseMapView(query) {
  const lat = toFiniteNumber(query.lat)
  const lng = toFiniteNumber(query.lng)
  const zoom = toFiniteNumber(query.zoom)

  if (lat === null || lng === null || zoom === null) {
    return null
  }

  return { lat, lng, zoom }
}

export function parseBounds(value) {
  if (typeof value !== 'string') {
    return null
  }

  const [west, south, east, north] = value.split(',').map((entry) => Number.parseFloat(entry))
  const values = [west, south, east, north]

  if (values.some((entry) => !Number.isFinite(entry))) {
    return null
  }

  if (west >= east || south >= north) {
    return null
  }

  return { west, south, east, north }
}

export function serializeBounds(bounds) {
  if (!bounds) {
    return ''
  }

  return [bounds.west, bounds.south, bounds.east, bounds.north]
    .map((value) => value.toFixed(6))
    .join(',')
}

export function isInsideBounds(gallery, bounds) {
  if (!bounds) {
    return true
  }

  return (
    gallery.longitude >= bounds.west &&
    gallery.longitude <= bounds.east &&
    gallery.latitude >= bounds.south &&
    gallery.latitude <= bounds.north
  )
}
