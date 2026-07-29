import { notFound, permanentRedirect } from 'next/navigation'
import ExhibitionProfilePage from '../../../components/ExhibitionProfilePage'
import { loadSiteData } from '../../../lib/data/loadData'
import {
  getCanonicalExhibitionSlug,
  getExhibitionBySlug,
  getGalleryBySlug
} from '../../../lib/utils/exhibitions'

export const revalidate = 60

export function generateStaticParams() {
  // Generate profiles on first request, then keep them in the ISR cache. Building
  // hundreds at once would hammer the legacy Google Sheet source.
  return []
}

export default async function ExhibitionPage({ params }) {
  const routeParams = await params
  const { slug } = routeParams
  const canonicalSlug = getCanonicalExhibitionSlug(slug)

  if (canonicalSlug !== slug) {
    permanentRedirect(`/exhibition/${encodeURIComponent(canonicalSlug)}`)
  }

  const data = await loadSiteData()

  const exhibition = getExhibitionBySlug(data.exhibitions, slug)
  if (!exhibition) {
    notFound()
  }

  const gallery = getGalleryBySlug(data.galleries, exhibition.gallerySlug)

  return (
    <ExhibitionProfilePage
      exhibition={exhibition}
      gallery={gallery}
      allExhibitions={data.exhibitions}
      allGalleries={data.galleries}
    />
  )
}
