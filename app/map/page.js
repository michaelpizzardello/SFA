import MapPageClient from '../../components/MapPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import {
  normalizeQueryString,
  parseBounds,
  parseMapView,
  SYDNEY_CENTER,
  SYDNEY_DEFAULT_ZOOM
} from '../../lib/utils/map'
import { isTimeWindow } from '../../lib/utils/windows'

export const dynamic = 'force-dynamic'

export default async function MapPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const parsedMapView = parseMapView(params)
  const parsedBounds = parseBounds(params.bounds)
  const rawWhen = normalizeQueryString(params.when)

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    // 'galleries' = browse spaces (all pins); a time window = the shared What's On lens
    when: isTimeWindow(rawWhen) ? rawWhen : 'galleries',
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
