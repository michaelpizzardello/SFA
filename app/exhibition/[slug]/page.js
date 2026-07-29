import { notFound, permanentRedirect } from 'next/navigation'
import ExhibitionProfilePage from '../../../components/ExhibitionProfilePage'
import { loadSiteData } from '../../../lib/data/loadData'
import {
  getCanonicalExhibitionSlug,
  getExhibitionBySlug,
  getGalleryBySlug
} from '../../../lib/utils/exhibitions'

export const revalidate = 60

export async function generateStaticParams() {
  const data = await loadSiteData()
  return data.exhibitions
    .filter((exhibition) => exhibition.slug)
    .map((exhibition) => ({ slug: exhibition.slug }))
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
