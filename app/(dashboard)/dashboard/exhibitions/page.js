import Link from 'next/link'
import { getOwnedGalleries, getGalleryExhibitions } from '@/lib/data/dashboard'
import { togglePublishAction, deleteExhibitionAction } from '@/lib/actions/exhibitions'
import { formatDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function DashboardExhibitionsPage() {
  const { galleries } = await getOwnedGalleries()
  if (!galleries.length) {
    return (
      <section className="dashboard-panel">
        <p className="section-copy">No gallery is linked to your account yet.</p>
      </section>
    )
  }

  const gallery = galleries[0]
  const exhibitions = await getGalleryExhibitions(gallery.id)

  return (
    <section className="dashboard-panel">
      <div className="section-head">
        <h1>Exhibitions</h1>
        <Link className="button button-primary button-utility" href="/dashboard/exhibitions/new">
          Add exhibition
        </Link>
      </div>

      {exhibitions.length ? (
        <ul className="dashboard-list">
          {exhibitions.map((e) => (
            <li key={e.id} className="dashboard-row">
              <div className="dashboard-row-main">
                <p className="dashboard-row-title">{e.exhibition_name}</p>
                <p className="row-meta">
                  {e.artist ? `${e.artist} · ` : ''}
                  {formatDate(e.start_date)}
                  {e.end_date ? ` – ${formatDate(e.end_date)}` : ''}
                </p>
              </div>
              <div className="dashboard-row-actions">
                <span className={`status-tag ${e.published ? 'status-current' : 'status-past'}`}>
                  {e.published ? 'Published' : 'Draft'}
                </span>
                <Link className="text-link" href={`/dashboard/exhibitions/${e.id}`}>
                  Edit
                </Link>
                <form action={togglePublishAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="published" value={(!e.published).toString()} />
                  <button className="text-link text-link-button" type="submit">
                    {e.published ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-copy">
          No exhibitions yet.{' '}
          <Link className="text-link" href="/dashboard/exhibitions/new">
            Add your first one.
          </Link>
        </p>
      )}
    </section>
  )
}
