import HomePage from '../components/HomePage'
import { loadSiteData } from '../lib/data/loadData'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await loadSiteData()

  return (
    <HomePage galleries={data.galleries} exhibitions={data.exhibitions} />
  )
}
