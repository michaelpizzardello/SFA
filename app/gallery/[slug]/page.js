import { notFound } from 'next/navigation'
import GalleryProfilePage from '../../../components/GalleryProfilePage'
import { loadSiteData } from '../../../lib/data/loadData'
import { getExhibitionsByGallery, getExhibitionStatus, getGalleryBySlug } from '../../../lib/utils/exhibitions'

export const revalidate = 60

export function generateStaticParams() {
  // Generate profiles on first request, then keep them in the ISR cache. Building
  // hundreds at once would hammer the legacy Google Sheet source.
  return []
}

export default async function GalleryPage({ params }) {
  const routeParams = await params
  const { slug } = routeParams
  const data = await loadSiteData()

  const gallery = getGalleryBySlug(data.galleries, slug)
  if (!gallery) {
    notFound()
  }

  const exhibitions = getExhibitionsByGallery(data.exhibitions, slug)
  const groupedExhibitions = {
    current: exhibitions.filter((exhibition) => getExhibitionStatus(exhibition) === 'current'),
    upcoming: exhibitions.filter((exhibition) => getExhibitionStatus(exhibition) === 'upcoming'),
    past: exhibitions.filter((exhibition) => getExhibitionStatus(exhibition) === 'past')
  }

  return (
    <GalleryProfilePage gallery={gallery} groupedExhibitions={groupedExhibitions} />
  )
}
