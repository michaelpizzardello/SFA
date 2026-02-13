import DataBadge from '../../components/DataBadge'
import GalleriesPageClient from '../../components/GalleriesPageClient'
import { loadSiteData } from '../../lib/data/loadData'
import { normalizeQueryString, normalizeSort } from '../../lib/utils/map'

export const dynamic = 'force-dynamic'

export default async function GalleriesPage({ searchParams }) {
  const params = (await searchParams) || {}
  const data = await loadSiteData()

  const initialFilters = {
    search: normalizeQueryString(params.search),
    precinct: normalizeQueryString(params.precinct, 'all') || 'all',
    sort: normalizeSort(normalizeQueryString(params.sort))
  }

  return (
    <>
      <DataBadge source={data.source} />
      <GalleriesPageClient galleries={data.galleries} exhibitions={data.exhibitions} initialFilters={initialFilters} />
    </>
  )
}
