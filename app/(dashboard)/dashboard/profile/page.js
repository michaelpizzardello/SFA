import ProfileEditor from '@/components/dashboard/ProfileEditor'
import { getOwnedGalleries } from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardProfilePage() {
  const { galleries } = await getOwnedGalleries()
  if (!galleries.length) {
    return (
      <section className="dash-panel">
        <p className="empty-state">No gallery is linked to your account yet.</p>
      </section>
    )
  }
  return (
    <section className="dash-panel">
      <ProfileEditor gallery={galleries[0]} />
    </section>
  )
}
