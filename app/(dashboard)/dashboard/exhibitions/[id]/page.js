import { notFound } from 'next/navigation'
import ExhibitionForm from '@/components/dashboard/ExhibitionForm'
import { getOwnedGalleries, getExhibitionForOwner } from '@/lib/data/dashboard'
import { deleteExhibitionAction } from '@/lib/actions/exhibitions'

export const dynamic = 'force-dynamic'

export default async function EditExhibitionPage({ params }) {
  const { id } = await params
  const { galleries } = await getOwnedGalleries()
  if (!galleries.length) {
    return (
      <section className="dashboard-panel">
        <p className="section-copy">No gallery is linked to your account yet.</p>
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
    <section className="dashboard-panel">
      <ExhibitionForm gallery={gallery} exhibition={exhibition} />
      <form action={deleteExhibitionAction} className="dashboard-delete">
        <input type="hidden" name="id" value={exhibition.id} />
        <button className="button button-secondary" type="submit">
          Delete exhibition
        </button>
      </form>
    </section>
  )
}
