'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/whats-on', label: "What's On", match: (p) => p === '/whats-on' || p.startsWith('/exhibition/') },
  { href: '/galleries', label: 'Galleries', match: (p) => p === '/galleries' || p.startsWith('/gallery/') },
  { href: '/map', label: 'Map', match: (p) => p.startsWith('/map') }
]

const TABS = [
  { href: '/', label: 'Home', match: (p) => p === '/' },
  { href: '/whats-on', label: "What's On", match: (p) => p === '/whats-on' || p.startsWith('/exhibition/') },
  { href: '/map', label: 'Map', match: (p) => p.startsWith('/map') },
  { href: '/galleries', label: 'Galleries', match: (p) => p === '/galleries' || p.startsWith('/gallery/') },
  { href: '/dashboard', label: 'Account', match: (p) => p.startsWith('/dashboard') || p.startsWith('/login') }
]

export default function SiteNav() {
  const pathname = usePathname()
  const isMapRoute = pathname.startsWith('/map')

  return (
    <>
      <header className={`site-header${isMapRoute ? ' is-map-route' : ''}`}>
        <Link className="site-header__brand" href="/">
          Sydney Art Finder
        </Link>

        <form className="header__search" action="/whats-on" role="search">
          <input
            className="field"
            type="search"
            name="search"
            placeholder="Search exhibitions, galleries, precincts"
            aria-label="Search"
          />
          <button type="submit" className="visually-hidden">
            Search
          </button>
        </form>

        <nav className="header__nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.match(pathname) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="link-arrow header__signin" href="/dashboard">
          Sign in
        </Link>
      </header>

      <nav className={`tabbar${isMapRoute ? ' is-map-route' : ''}`} aria-label="Primary">
        {TABS.map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.match(pathname) ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
