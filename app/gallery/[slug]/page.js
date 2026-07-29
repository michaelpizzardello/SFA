import { notFound } from 'next/navigation'
import GalleryProfilePage from '../../../components/GalleryProfilePage'
import { loadSiteData } from '../../../lib/data/loadData'
import { getExhibitionsByGallery, getExhibitionStatus, getGalleryBySlug } from '../../../lib/utils/exhibitions'

export const revalidate = 60

export async function generateStaticParams() {
  const data = await loadSiteData()
  return data.galleries
    .filter((gallery) => gallery.slug)
    .map((gallery) => ({ slug: gallery.slug }))
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
