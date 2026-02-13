import DataBadge from '../../components/DataBadge'
import WhatsOnPageClient from '../../components/WhatsOnPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import { normalizeOpeningWindow, normalizeQueryString } from '../../lib/utils/map'

export const dynamic = 'force-dynamic'

const defaultStatuses = ['current', 'upcoming']
const validStatuses = new Set(defaultStatuses)
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

function parseStatusSelections(rawStatus, legacyOpeningWindow) {
  const entries = parseCommaList(rawStatus)
  const parsedStatuses = entries.filter((entry) => validStatuses.has(entry))

  if (parsedStatuses.length) {
    return [...new Set(parsedStatuses)]
  }

  if (entries.includes('current-upcoming') || entries.includes('all')) {
    return [...defaultStatuses]
  }

  if (legacyOpeningWindow === 'all' || legacyOpeningWindow === 'current-upcoming') {
    return [...defaultStatuses]
  }

  return [...defaultStatuses]
}

function parseOpeningSelections(rawOpening, legacyOpeningWindow) {
  const entries = parseCommaList(rawOpening)
  const parsedOpening = entries.filter((entry) => validOpeningWindows.has(entry))

  if (parsedOpening.length) {
    return [...new Set(parsedOpening)]
  }

  if (entries.includes('any')) {
    return []
  }

  if (legacyOpeningWindow === 'tonight' || legacyOpeningWindow === 'week') {
    return [legacyOpeningWindow]
  }

  return []
}

export default async function WhatsOnPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const legacyOpeningWindow = normalizeOpeningWindow(normalizeQueryString(params.openingWindow))

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    statuses: parseStatusSelections(normalizeQueryString(params.status), legacyOpeningWindow),
    openingWindows: parseOpeningSelections(normalizeQueryString(params.opening), legacyOpeningWindow)
  }

  return (
    <>
      <DataBadge source={data.source} />
      <WhatsOnPageClient galleries={data.galleries} exhibitions={data.exhibitions} initialFilters={initialFilters} />
    </>
  )
}
