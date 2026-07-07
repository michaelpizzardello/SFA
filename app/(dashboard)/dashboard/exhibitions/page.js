import Link from 'next/link'
import { getOwnedGalleries, getGalleryExhibitions } from '@/lib/data/dashboard'
import { togglePublishAction } from '@/lib/actions/exhibitions'
import { formatDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function DashboardExhibitionsPage() {
  const { galleries } = await getOwnedGalleries()
  if (!galleries.length) {
    return (
      <section className="dash-panel">
        <p className="empty-state">No gallery is linked to your account yet.</p>
      </section>
    )
  }

  const gallery = galleries[0]
  const exhibitions = await getGalleryExhibitions(gallery.id)
  const publishedCount = exhibitions.filter((e) => e.published).length

  return (
    <section className="dash-panel">
      <div className="page-head">
        <div className="page-head__main">
          <h1 className="page-head__title">Exhibitions</h1>
          {exhibitions.length ? (
            <p className="page-head__sub">
              {exhibitions.length} total · {publishedCount} published
            </p>
          ) : null}
        </div>
        <Link className="btn btn--primary page-head__action" href="/dashboard/exhibitions/new">
          Add exhibition
        </Link>
      </div>

      {exhibitions.length ? (
        <ul className="table dash-extable">
          {exhibitions.map((e) => (
            <li className="table__row" key={e.id}>
              {e.image_url ? (
                <img className="table__thumb" src={e.image_url} alt="" />
              ) : (
                <div className="table__thumb" aria-hidden="true" />
              )}
              <div className="dash-extable__main">
                <p className="table__primary table__primary--work">{e.exhibition_name}</p>
                <p className="table__fact">
                  {e.artist ? `${e.artist} · ` : ''}
                  {formatDate(e.start_date)}
                  {e.end_date ? ` – ${formatDate(e.end_date)}` : ''}
                </p>
              </div>
              <span className={`table__status${e.published ? '' : ' table__status--muted'}`}>
                {e.published ? 'Published' : 'Draft'}
              </span>
              <div className="table__actions">
                <Link className="btn btn--text" href={`/dashboard/exhibitions/${e.id}`}>
                  Edit
                </Link>
                <form action={togglePublishAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="published" value={(!e.published).toString()} />
                  <button className="btn btn--text" type="submit">
                    {e.published ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>No exhibitions yet. Add your first one so it appears on Sydney Art Finder.</p>
          <Link className="btn btn--primary" href="/dashboard/exhibitions/new">
            Add exhibition
          </Link>
        </div>
      )}
    </section>
  )
}
