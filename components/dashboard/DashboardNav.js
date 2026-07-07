'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutAction } from '@/lib/actions/auth'

const LINKS = [
  ['/dashboard', 'Overview'],
  ['/dashboard/profile', 'Profile'],
  ['/dashboard/exhibitions', 'Exhibitions']
]

export default function DashboardNav({ isSuperAdmin = false }) {
  const pathname = usePathname()
  return (
    <header className="dash-nav">
      <Link href="/dashboard" className="dash-nav__brand">
        <span className="dash-nav__wordmark">Sydney Art Finder</span>
        <span className="dash-nav__sub">Gallery dashboard</span>
      </Link>
      <nav className="dash-nav__links">
        {LINKS.map(([href, label]) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`dash-nav__link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="dash-nav__util">
        {isSuperAdmin ? (
          <Link href="/console" className="dash-nav__utillink">
            Console
          </Link>
        ) : null}
        <Link href="/" className="dash-nav__utillink">
          View site
        </Link>
        <form action={signOutAction}>
          <button className="dash-nav__utillink" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
