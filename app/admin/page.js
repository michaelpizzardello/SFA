import { cookies } from 'next/headers'
import AdminPageClient from '../../components/AdminPageClient'
import { isAdminAuthenticated } from '../../lib/admin/auth'
import { loadAdminStore } from '../../lib/admin/store'
import { loadGalleryDirectoryData } from '../../lib/data/loadData'
import { formatDate, getWeekRangeISO, todayISOInSydney } from '../../lib/utils/date'

export const dynamic = 'force-dynamic'

function LoginView({ error }) {
  return (
    <section className="admin-shell">
      <div className="admin-card">
        <div className="section-head">
          <h1>Admin</h1>
        </div>
        <p className="section-copy">Sign in to manage this week&apos;s exhibitions.</p>
        {error ? <p className="admin-error">Password incorrect.</p> : null}
        <form className="admin-form-stack" action="/api/admin/login" method="post">
          <input type="hidden" name="redirectTo" value="/admin" />
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button className="button button-primary" type="submit">
            Log in
          </button>
        </form>
      </div>
    </section>
  )
}

export default async function AdminPage({ searchParams }) {
  const params = (await searchParams) || {}
  const cookieStore = await cookies()
  const authenticated = isAdminAuthenticated(cookieStore)

  if (!authenticated) {
    return <LoginView error={params.error === 'invalid'} />
  }

  const galleryDirectory = await loadGalleryDirectoryData()
  const adminStore = await loadAdminStore()
  const today = todayISOInSydney()
  const initialWeek = getWeekRangeISO(today)

  return (
    <AdminPageClient
      galleries={galleryDirectory.galleries}
      initialRecords={adminStore.exhibitions}
      initialWeek={initialWeek}
      initialWeekLabel={`${formatDate(initialWeek.weekStart)} – ${formatDate(initialWeek.weekEnd)}`}
    />
  )
}
