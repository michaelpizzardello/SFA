import DataBadge from '../components/DataBadge'
import HomePage from '../components/HomePage'
import { loadSiteData } from '../lib/data/loadData'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await loadSiteData()

  return (
    <>
      <DataBadge source={data.source} />
      <HomePage galleries={data.galleries} exhibitions={data.exhibitions} />
    </>
  )
}
