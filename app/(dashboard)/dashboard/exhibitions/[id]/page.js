import { notFound } from 'next/navigation'
import ExhibitionForm from '@/components/dashboard/ExhibitionForm'
import DeleteExhibitionButton from '@/components/dashboard/DeleteExhibitionButton'
import { getOwnedGalleries, getExhibitionForOwner } from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export default async function EditExhibitionPage({ params }) {
  const { id } = await params
  const { galleries } = await getOwnedGalleries()
  if (!galleries.length) {
    return (
      <section className="dash-panel">
        <p className="empty-state">No gallery is linked to your account yet.</p>
      </section>
    )
  }

  const exhibition = await getExhibitionForOwner(id)
  const ownedIds = new Set(galleries.map((g) => g.id))
  // member_read could return another gallery's *published* row; only allow editing our own.
  if (!exhibition || !ownedIds.has(exhibition.gallery_id)) {
    notFound()
  }
  const gallery = galleries.find((g) => g.id === exhibition.gallery_id)

  return (
    <section className="dash-panel">
      <ExhibitionForm gallery={gallery} exhibition={exhibition} />
      <DeleteExhibitionButton id={exhibition.id} />
    </section>
  )
}
