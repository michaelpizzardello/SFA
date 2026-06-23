import Link from 'next/link'
import InviteGalleryForm from '@/components/admin/InviteGalleryForm'
import { getAllGalleries, getAllExhibitions } from '@/lib/data/adminConsole'

export const dynamic = 'force-dynamic'

export default async function ConsoleOverview() {
  const [galleries, exhibitions] = await Promise.all([getAllGalleries(), getAllExhibitions()])
  const claimed = galleries.filter((g) => g.is_claimed).length
  const hiddenGalleries = galleries.filter((g) => g.hidden_by_admin).length
  const publishedEx = exhibitions.filter((e) => e.published && !e.hidden_by_admin).length

  return (
    <section className="dashboard-panel">
      <h1>Console</h1>

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <span className="dashboard-stat-num">{galleries.length}</span>
          <span className="dashboard-stat-label">Galleries</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-num">{claimed}</span>
          <span className="dashboard-stat-label">Claimed</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-num">{publishedEx}</span>
          <span className="dashboard-stat-label">Live exhibitions</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-num">{hiddenGalleries}</span>
          <span className="dashboard-stat-label">Hidden</span>
        </div>
      </div>

      <InviteGalleryForm galleries={galleries} />

      <div className="dashboard-quick-actions">
        <Link className="button button-secondary" href="/console/galleries">
          Manage galleries
        </Link>
        <Link className="button button-secondary" href="/console/exhibitions">
          Manage exhibitions
        </Link>
      </div>
    </section>
  )
}
