import Link from 'next/link'
import { getOwnedGalleries, getGalleryExhibitions } from '@/lib/data/dashboard'
import { togglePublishAction } from '@/lib/actions/exhibitions'
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
  const publishedCount = exhibitions.filter((e) => e.published).length

  return (
    <section className="dashboard-panel">
      <div className="page-head">
        <div className="page-head__title">
          <h1>Exhibitions</h1>
          {exhibitions.length ? (
            <span className="page-head__sub">
              {exhibitions.length} total · {publishedCount} published
            </span>
          ) : null}
        </div>
        <Link className="button button-primary" href="/dashboard/exhibitions/new">
          Add exhibition
        </Link>
      </div>

      {exhibitions.length ? (
        <ul className="dash-rows">
          {exhibitions.map((e) => (
            <li key={e.id}>
              <div className="dash-row">
                <div className="dash-row__media">
                  {e.image_url ? <img src={e.image_url} alt="" /> : null}
                </div>
                <div className="dash-row__main">
                  <p className="dash-row__title">{e.exhibition_name}</p>
                  <p className="row-meta">
                    {e.artist ? `${e.artist} · ` : ''}
                    {formatDate(e.start_date)}
                    {e.end_date ? ` – ${formatDate(e.end_date)}` : ''}
                  </p>
                </div>
                <span className={`badge ${e.published ? 'badge--published' : 'badge--draft'}`}>
                  {e.published ? 'Published' : 'Draft'}
                </span>
                <div className="dash-row__actions">
                  <Link className="text-link" href={`/dashboard/exhibitions/${e.id}`}>
                    Edit
                  </Link>
                  <form action={togglePublishAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="published" value={(!e.published).toString()} />
                    <button className="text-link-button" type="submit">
                      {e.published ? 'Unpublish' : 'Publish'}
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="dash-empty">
          <p>No exhibitions yet. Add your first one so it appears on Sydney Art Finder.</p>
          <Link className="button button-primary" href="/dashboard/exhibitions/new">
            Add exhibition
          </Link>
        </div>
      )}
    </section>
  )
}
