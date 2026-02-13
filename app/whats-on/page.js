import DataBadge from '../../components/DataBadge'
import WhatsOnPageClient from '../../components/WhatsOnPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import { normalizeOpeningWindow, normalizeQueryString } from '../../lib/utils/map'

export const dynamic = 'force-dynamic'

const validStatus = new Set(['current-upcoming', 'all'])
const validOpening = new Set(['any', 'tonight', 'week'])

export default async function WhatsOnPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const selectedGalleries =
    typeof params.galleries === 'string' && params.galleries.trim()
      ? params.galleries
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
      : []

  const legacyOpeningWindow = normalizeOpeningWindow(normalizeQueryString(params.openingWindow))

  let status = normalizeQueryString(params.status, 'current-upcoming')
  let opening = normalizeQueryString(params.opening, 'any')

  if (!validStatus.has(status) && !validOpening.has(opening)) {
    if (legacyOpeningWindow === 'all') {
      status = 'all'
      opening = 'any'
    } else if (legacyOpeningWindow === 'tonight' || legacyOpeningWindow === 'week') {
      status = 'current-upcoming'
      opening = legacyOpeningWindow
    } else {
      status = 'current-upcoming'
      opening = 'any'
    }
  } else {
    if (!validStatus.has(status)) {
      status = 'current-upcoming'
    }

    if (!validOpening.has(opening)) {
      opening = 'any'
    }
  }

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    status,
    opening,
    selectedGalleries
  }

  return (
    <>
      <DataBadge source={data.source} />
      <WhatsOnPageClient galleries={data.galleries} exhibitions={data.exhibitions} initialFilters={initialFilters} />
    </>
  )
}
