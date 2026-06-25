import WhatsOnPageClient from '../../components/WhatsOnPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import { normalizeQueryString } from '../../lib/utils/map'
import { normalizeWindow } from '../../lib/utils/windows'

export const dynamic = 'force-dynamic'

export default async function WhatsOnPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const initialFilters = {
    when: normalizeWindow(normalizeQueryString(params.when)),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    search: normalizeQueryString(params.search)
  }

  return (
    <WhatsOnPageClient galleries={data.galleries} exhibitions={data.exhibitions} initialFilters={initialFilters} />
  )
}
