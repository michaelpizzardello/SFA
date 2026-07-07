import InviteGalleryForm from '@/components/admin/InviteGalleryForm'
import { getAllGalleries, getAllExhibitions } from '@/lib/data/adminConsole'

export const dynamic = 'force-dynamic'

export default async function ConsoleOverview() {
  const [galleries, exhibitions] = await Promise.all([getAllGalleries(), getAllExhibitions()])
  const claimed = galleries.filter((g) => g.is_claimed).length
  const hiddenGalleries = galleries.filter((g) => g.hidden_by_admin).length
  const publishedEx = exhibitions.filter((e) => e.published && !e.hidden_by_admin).length

  return (
    <section className="dash-panel">
      <div className="page-head">
        <div className="page-head__main">
          <h1 className="page-head__title">Overview</h1>
        </div>
      </div>

      <div className="stat-row con-stats">
        <div className="stat-cell">
          <span className="stat-cell__count">{galleries.length}</span>
          <span className="stat-cell__label">Galleries</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__count">{claimed}</span>
          <span className="stat-cell__label">Claimed</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__count">{publishedEx}</span>
          <span className="stat-cell__label">Live exhibitions</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__count">{hiddenGalleries}</span>
          <span className="stat-cell__label">Hidden</span>
        </div>
      </div>

      <InviteGalleryForm galleries={galleries} />
    </section>
  )
}
