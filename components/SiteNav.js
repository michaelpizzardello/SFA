'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import SearchField from './SearchField'
import SearchIcon from './icons/SearchIcon'

const NAV = [
  { href: '/whats-on', label: "What's On", match: (p) => p === '/whats-on' || p.startsWith('/exhibition/') },
  { href: '/galleries', label: 'Galleries', match: (p) => p === '/galleries' || p.startsWith('/gallery/') },
  { href: '/map', label: 'Map', match: (p) => p.startsWith('/map') }
]

const TABS = [
  { href: '/', label: 'Home', icon: 'home', match: (p) => p === '/' },
  { href: '/whats-on', label: "What's On", icon: 'whatson', match: (p) => p === '/whats-on' || p.startsWith('/exhibition/') },
  { href: '/map', label: 'Map', icon: 'map', match: (p) => p.startsWith('/map') },
  { href: '/galleries', label: 'Galleries', icon: 'galleries', match: (p) => p === '/galleries' || p.startsWith('/gallery/') },
  { href: '/dashboard', label: 'Account', icon: 'account', match: (p) => p.startsWith('/dashboard') || p.startsWith('/login') }
]

const ICON = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  whatson: 'M4 6h16M4 6v14h16V6M4 6 7 3m13 3-3-3M8 11h3v3H8z',
  map: 'M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z M12 9.5a1.5 1.5 0 1 0 0 .01',
  galleries: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  account: 'M5 20a7 7 0 0 1 14 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'
}

function TabIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON[name]} />
    </svg>
  )
}

export default function SiteNav() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  const isAppRoute = /^\/(dashboard|login|forgot-password|reset-password|console)/.test(pathname)
  const isMapRoute = pathname.startsWith('/map')

  useEffect(() => setSearchOpen(false), [pathname])
  useEffect(() => {
    if (!searchOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setSearchOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  // The dashboard, auth and console routes render their own chrome — no public header/tabbar there.
  if (isAppRoute) return null

  return (
    <>
      <header className={`site-header${isMapRoute ? ' is-map-route' : ''}`}>
        <Link className="site-header__brand" href="/">
          Sydney Art Finder
        </Link>

        <nav className="header__nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.match(pathname) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header__right">
          <button
            type="button"
            className="header__search-btn"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <Link className="header__signin" href="/dashboard">
            Sign in
          </Link>
        </div>
      </header>

      {searchOpen ? (
        <>
          <div className="search-overlay__scrim" onClick={() => setSearchOpen(false)} role="presentation" />
          <div className="search-overlay">
            <form className="search-overlay__inner container" action="/whats-on" role="search">
              <SearchField name="search" placeholder="Search exhibitions, galleries, precincts" aria-label="Search" autoFocus />
              <button type="button" className="search-overlay__close" onClick={() => setSearchOpen(false)}>
                Close
              </button>
              <button type="submit" className="visually-hidden">
                Search
              </button>
            </form>
          </div>
        </>
      ) : null}

      <nav className={`tabbar${isMapRoute ? ' is-map-route' : ''}`} aria-label="Primary">
        {TABS.map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.match(pathname) ? 'page' : undefined}>
            <TabIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
