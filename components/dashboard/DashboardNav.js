'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutAction } from '@/lib/actions/auth'

const LINKS = [
  ['/dashboard', 'Overview'],
  ['/dashboard/profile', 'Profile'],
  ['/dashboard/exhibitions', 'Exhibitions']
]

export default function DashboardNav() {
  const pathname = usePathname()
  return (
    <header className="dashboard-nav">
      <Link href="/dashboard" className="dashboard-brand">
        Sydney Art Finder
      </Link>
      <nav className="dashboard-links">
        {LINKS.map(([href, label]) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`dashboard-link${active ? ' is-active' : ''}`}>
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="dashboard-nav-actions">
        <Link href="/" className="text-link">
          View site
        </Link>
        <form action={signOutAction}>
          <button className="button button-secondary button-utility" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
