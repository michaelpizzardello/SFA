import { getAllExhibitions } from '@/lib/data/adminConsole'
import { setExhibitionHiddenAction } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function ConsoleExhibitionsPage() {
  const exhibitions = await getAllExhibitions()

  return (
    <section className="dashboard-panel">
      <div className="section-head">
        <h1>Exhibitions</h1>
        <span className="results-meta">{exhibitions.length} total</span>
      </div>
      <ul className="dashboard-list">
        {exhibitions.map((e) => (
          <li key={e.id} className="dashboard-row">
            <div className="dashboard-row-main">
              <p className="dashboard-row-title">{e.exhibition_name}</p>
              <p className="row-meta">
                {e.gallery_name} · {formatDate(e.start_date)}
                {e.source && e.source !== 'manual' ? ` · ${e.source}` : ''}
              </p>
            </div>
            <div className="dashboard-row-actions">
              <span
                className={`status-tag ${
                  e.hidden_by_admin ? 'status-past' : e.published ? 'status-current' : 'status-upcoming'
                }`}
              >
                {e.hidden_by_admin ? 'Hidden' : e.published ? 'Live' : 'Draft'}
              </span>
              <form action={setExhibitionHiddenAction}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="hidden" value={(!e.hidden_by_admin).toString()} />
                <button className="text-link text-link-button" type="submit">
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
