import ConsoleNav from '@/components/admin/ConsoleNav'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Console | Sydney Art Finder'
}

export default function ConsoleLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <ConsoleNav />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
