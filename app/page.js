import HomePage from '../components/HomePage'
import { loadSiteData } from '../lib/data/loadData'

export const revalidate = 60

export default async function Page() {
  const data = await loadSiteData()

  return (
    <HomePage galleries={data.galleries} exhibitions={data.exhibitions} />
  )
}
