import DashboardNav from '@/components/dashboard/DashboardNav'
import { getAuthContext } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Gallery dashboard | Sydney Art Finder'
}

export default async function DashboardLayout({ children }) {
  const { isSuperAdmin } = await getAuthContext()
  return (
    <div className="dash-shell">
      <DashboardNav isSuperAdmin={isSuperAdmin} />
      <div className="dash-main">{children}</div>
    </div>
  )
}
