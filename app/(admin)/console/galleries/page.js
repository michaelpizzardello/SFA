import Link from 'next/link'
import { getAllGalleries } from '@/lib/data/adminConsole'
import { setGalleryHiddenAction } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

export default async function ConsoleGalleriesPage() {
  const galleries = await getAllGalleries()

  return (
    <section className="dashboard-panel">
      <div className="section-head">
        <h1>Galleries</h1>
        <span className="results-meta">{galleries.length} total</span>
      </div>
      <ul className="dashboard-list">
        {galleries.map((g) => (
          <li key={g.id} className="dashboard-row">
            <div className="dashboard-row-main">
              <p className="dashboard-row-title">{g.name}</p>
              <p className="row-meta">
                {g.precinct}
                {g.is_claimed ? ' · claimed' : ' · unclaimed'}
              </p>
            </div>
            <div className="dashboard-row-actions">
              <span className={`status-tag ${g.hidden_by_admin ? 'status-past' : 'status-current'}`}>
                {g.hidden_by_admin ? 'Hidden' : 'Visible'}
              </span>
              <Link className="text-link" href={`/gallery/${g.slug}`}>
                View
              </Link>
              <form action={setGalleryHiddenAction}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="hidden" value={(!g.hidden_by_admin).toString()} />
                <button className={`text-link-button ${g.hidden_by_admin ? '' : 'text-link-danger'}`} type="submit">
                  {g.hidden_by_admin ? 'Unhide' : 'Hide'}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
