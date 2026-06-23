import DashboardNav from '@/components/dashboard/DashboardNav'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Gallery dashboard | Sydney Art Finder'
}

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <DashboardNav />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
