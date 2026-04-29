import { notFound } from 'next/navigation'
import ExhibitionProfilePage from '../../../components/ExhibitionProfilePage'
import { loadSiteData } from '../../../lib/data/loadData'
import { getExhibitionBySlug, getGalleryBySlug } from '../../../lib/utils/exhibitions'

export const dynamic = 'force-dynamic'

export default async function ExhibitionPage({ params }) {
  const routeParams = await params
  const { slug } = routeParams
  const data = await loadSiteData()

  const exhibition = getExhibitionBySlug(data.exhibitions, slug)
  if (!exhibition) {
    notFound()
  }

  const gallery = getGalleryBySlug(data.galleries, exhibition.gallerySlug)

  return (
    <ExhibitionProfilePage exhibition={exhibition} gallery={gallery} />
  )
}
