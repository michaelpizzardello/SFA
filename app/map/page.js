import MapPageClient from '../../components/MapPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import {
  normalizeOpeningWindow,
  normalizeQueryString,
  parseBounds,
  parseMapView,
  SYDNEY_CENTER,
  SYDNEY_DEFAULT_ZOOM
} from '../../lib/utils/map'

export const dynamic = 'force-dynamic'

const validStatuses = new Set(['current', 'upcoming'])
const validOpeningWindows = new Set(['tonight', 'week'])

function parseCommaList(value) {
  if (typeof value !== 'string') {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseStatusSelections(rawStatus) {
  return [...new Set(parseCommaList(rawStatus).filter((entry) => validStatuses.has(entry)))]
}

function parseOpeningSelections(rawOpening, legacyOpeningWindow) {
  const parsedOpening = parseCommaList(rawOpening).filter((entry) => validOpeningWindows.has(entry))

  if (parsedOpening.length) {
    return [...new Set(parsedOpening)]
  }

  if (legacyOpeningWindow === 'tonight' || legacyOpeningWindow === 'week') {
    return [legacyOpeningWindow]
  }

  return []
}

export default async function MapPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const parsedMapView = parseMapView(params)
  const parsedBounds = parseBounds(params.bounds)
  const legacyOpeningWindow = normalizeOpeningWindow(normalizeQueryString(params.openingWindow))

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    statuses: parseStatusSelections(normalizeQueryString(params.status)),
    openingWindows: parseOpeningSelections(normalizeQueryString(params.opening), legacyOpeningWindow),
    areaEnabled: normalizeQueryString(params.area) === '1' && Boolean(parsedBounds),
    viewportBounds: parsedBounds,
    selectedSlug: normalizeQueryString(params.selected),
    sheetDetent: normalizeQueryString(params.sheet, 'collapsed'),
    mapView: parsedMapView || {
      lat: SYDNEY_CENTER.lat,
      lng: SYDNEY_CENTER.lng,
      zoom: SYDNEY_DEFAULT_ZOOM
    }
  }

  return (
    <MapPageClient galleries={data.galleries} exhibitions={data.exhibitions} initialFilters={initialFilters} />
  )
}
