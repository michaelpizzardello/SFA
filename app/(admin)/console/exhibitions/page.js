import { getAllExhibitions } from '@/lib/data/adminConsole'
import ConsoleExhibitionsClient from '@/components/admin/ConsoleExhibitionsClient'

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
      <ConsoleExhibitionsClient exhibitions={exhibitions} />
    </section>
  )
}
