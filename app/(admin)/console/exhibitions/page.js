import Link from 'next/link'
import { getAllExhibitions } from '@/lib/data/adminConsole'
import { setExhibitionHiddenAction } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function ConsoleExhibitionsPage() {
  const exhibitions = await getAllExhibitions()

  return (
    <section className="dash-panel">
      <div className="page-head">
        <div className="page-head__main">
          <h1 className="page-head__title">Exhibitions</h1>
          <p className="page-head__sub">{exhibitions.length} total</p>
        </div>
      </div>
      <ul className="table con-table">
        {exhibitions.map((e) => (
          <li className="table__row" key={e.id}>
            <p className="table__primary table__primary--work con-table__name">{e.exhibition_name}</p>
            <p className="table__fact">
              {e.gallery_name} · {formatDate(e.start_date)}
              {e.source && e.source !== 'manual' ? ` · ${e.source}` : ''}
            </p>
            <span className={`table__status${e.published && !e.hidden_by_admin ? '' : ' table__status--muted'}`}>
              {e.hidden_by_admin ? 'Hidden' : e.published ? 'Published' : 'Draft'}
            </span>
            <div className="table__actions">
              {e.slug ? (
                <Link className="btn btn--text" href={`/exhibition/${e.slug}`}>
                  View
                </Link>
              ) : null}
              <form action={setExhibitionHiddenAction}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="hidden" value={(!e.hidden_by_admin).toString()} />
                <button className={`btn ${e.hidden_by_admin ? 'btn--text' : 'btn--danger-text'}`} type="submit">
                  {e.hidden_by_admin ? 'Unhide' : 'Hide'}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
