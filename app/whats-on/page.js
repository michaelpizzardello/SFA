import DataBadge from '../../components/DataBadge'
import WhatsOnPageClient from '../../components/WhatsOnPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import { normalizeOpeningWindow, normalizeQueryString } from '../../lib/utils/map'

export const dynamic = 'force-dynamic'

export default async function WhatsOnPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    openingWindow: normalizeOpeningWindow(normalizeQueryString(params.openingWindow))
  }

  return (
    <>
      <DataBadge source={data.source} />
      <WhatsOnPageClient galleries={data.galleries} exhibitions={data.exhibitions} initialFilters={initialFilters} />
    </>
  )
}
