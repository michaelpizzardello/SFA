import DataBadge from '../../components/DataBadge'
import MapPageClient from '../../components/MapPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import {
  normalizeQueryString,
  parseBounds,
  parseMapView,
  SYDNEY_CENTER,
  SYDNEY_DEFAULT_ZOOM
} from '../../lib/utils/map'

export const dynamic = 'force-dynamic'

export default async function MapPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const parsedMapView = parseMapView(params)
  const parsedBounds = parseBounds(params.bounds)

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    areaEnabled: normalizeQueryString(params.area) === '1' && Boolean(parsedBounds),
    viewportBounds: parsedBounds,
    selectedSlug: normalizeQueryString(params.selected),
    mapView: parsedMapView || {
      lat: SYDNEY_CENTER.lat,
      lng: SYDNEY_CENTER.lng,
      zoom: SYDNEY_DEFAULT_ZOOM
    }
  }

  return (
    <>
      <DataBadge source={data.source} />
      <MapPageClient galleries={data.galleries} initialFilters={initialFilters} />
    </>
  )
}
