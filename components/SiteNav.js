'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import SearchIcon from './icons/SearchIcon'
import StarIcon from './icons/StarIcon'
import InstagramIcon from './icons/InstagramIcon'
import { SAF_INSTAGRAM } from '../lib/site'
import { isChromelessRoute } from '../lib/utils/chrome'

const NAV = [
  { href: '/whats-on', label: "What's On", match: (p) => p === '/whats-on' || p.startsWith('/exhibition/') },
  { href: '/galleries', label: 'Galleries', match: (p) => p === '/galleries' || p.startsWith('/gallery/') },
  { href: '/map', label: 'Map', match: (p) => p.startsWith('/map') }
]

const TABS = [
  { href: '/', label: 'Home', icon: 'home', match: (p) => p === '/' },
  { href: '/whats-on', label: "What's On", icon: 'whatson', match: (p) => p === '/whats-on' || p.startsWith('/exhibition/') },
  { href: '/galleries', label: 'Galleries', icon: 'galleries', match: (p) => p === '/galleries' || p.startsWith('/gallery/') },
  { href: '/map', label: 'Map', icon: 'map', match: (p) => p.startsWith('/map') }
]

const ICON = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  whatson: 'M4 6h16M4 6v14h16V6M4 6 7 3m13 3-3-3M8 11h3v3H8z',
  map: 'M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z M12 9.5a1.5 1.5 0 1 0 0 .01',
  galleries: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'
}

function TabIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON[name]} />
    </svg>
  )
}

export default function SiteNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchButtonRef = useRef(null)
  const searchInputRef = useRef(null)

  const isMapRoute = pathname.startsWith('/map')

  useEffect(() => setSearchOpen(false), [pathname])
  useEffect(() => {
    if (!searchOpen) return undefined
    searchInputRef.current?.focus()
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setSearchOpen(false)
      requestAnimationFrame(() => searchButtonRef.current?.focus())
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  const closeSearch = () => {
    setSearchOpen(false)
    requestAnimationFrame(() => searchButtonRef.current?.focus())
  }

  const goToSearchResults = (rawQuery) => {
    const query = String(rawQuery || '').trim()
    setSearchOpen(false)
    router.push(query ? `/whats-on?search=${encodeURIComponent(query)}` : '/whats-on')
  }

  const submitSearch = (event) => {
    event.preventDefault()
    goToSearchResults(searchInputRef.current?.value)
  }

  // Dashboard, auth and console routes render their own chrome — no public header/tabbar there.
  if (isChromelessRoute(pathname)) return null

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
            ref={searchButtonRef}
            type="button"
            className="header__icon-btn"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <Link
            className="header__icon-btn"
            href="/saved"
            aria-label="Saved"
            aria-current={pathname === '/saved' ? 'page' : undefined}
          >
            <StarIcon />
          </Link>
          <a
            className="header__icon-btn header__icon-btn--instagram"
            href={SAF_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
        </div>
      </header>

      {searchOpen ? (
        <>
          <div className="search-overlay__scrim" onClick={closeSearch} role="presentation" />
          <div className="search-overlay">
            <form className="search-overlay__inner container" action="/whats-on" role="search" onSubmit={submitSearch}>
              <label className="visually-hidden" htmlFor="site-search">
                Search
              </label>
              <input
                ref={searchInputRef}
                id="site-search"
                className="field field--line search-overlay__input"
                type="search"
                name="search"
                placeholder="Search exhibitions, galleries, precincts"
                enterKeyHint="search"
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  goToSearchResults(event.currentTarget.value)
                }}
                autoFocus
              />
              <button type="button" className="search-overlay__close" onClick={closeSearch}>
                Close
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
