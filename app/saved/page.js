import SavedPageClient from '../../components/SavedPageClient'
import { loadSiteData } from '../../lib/data/loadData'

export const revalidate = 60

export const metadata = {
  title: 'Saved | Sydney Art Finder'
}

export default async function SavedPage() {
  const data = await loadSiteData()
  return <SavedPageClient exhibitions={data.exhibitions} galleries={data.galleries} />
}
