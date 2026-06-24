'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutAction } from '@/lib/actions/auth'

const LINKS = [
  ['/console', 'Overview'],
  ['/console/galleries', 'Galleries'],
  ['/console/exhibitions', 'Exhibitions']
]

export default function ConsoleNav() {
  const pathname = usePathname()
  return (
    <header className="dashboard-nav">
      <Link href="/console" className="dashboard-brand">
        SAF Console
      </Link>
      <nav className="dashboard-links">
        {LINKS.map(([href, label]) => {
          const active = href === '/console' ? pathname === href : pathname.startsWith(href)
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
