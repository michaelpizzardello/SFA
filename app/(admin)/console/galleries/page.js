import Link from 'next/link'
import { getAllGalleries } from '@/lib/data/adminConsole'
import { setGalleryHiddenAction } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

export default async function ConsoleGalleriesPage() {
  const galleries = await getAllGalleries()

  return (
    <section className="dash-panel">
      <div className="page-head">
        <div className="page-head__main">
          <h1 className="page-head__title">Galleries</h1>
          <p className="page-head__sub">{galleries.length} total</p>
        </div>
      </div>
      <ul className="table con-table">
        {galleries.map((g) => (
          <li className="table__row" key={g.id}>
            <p className="table__primary con-table__name">{g.name}</p>
            <p className="table__fact">
              {g.precinct}
              {g.is_claimed ? ' · claimed' : ' · unclaimed'}
            </p>
            <span className={`table__status${g.hidden_by_admin ? ' table__status--muted' : ''}`}>
              {g.hidden_by_admin ? 'Hidden' : 'Visible'}
            </span>
            <div className="table__actions">
              <Link className="btn btn--text" href={`/gallery/${g.slug}`}>
                View
              </Link>
              <form action={setGalleryHiddenAction}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="hidden" value={(!g.hidden_by_admin).toString()} />
                <button className={`btn ${g.hidden_by_admin ? 'btn--text' : 'btn--danger-text'}`} type="submit">
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
