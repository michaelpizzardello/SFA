import ExhibitionForm from '@/components/dashboard/ExhibitionForm'
import { getOwnedGalleries } from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export default async function NewExhibitionPage() {
  const { galleries } = await getOwnedGalleries()
  if (!galleries.length) {
    return (
      <section className="dashboard-panel">
        <p className="section-copy">No gallery is linked to your account yet.</p>
      </section>
    )
  }
  return (
    <section className="dashboard-panel">
      <ExhibitionForm gallery={galleries[0]} />
    </section>
  )
}
