'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/whats-on', label: "What's On" },
  { href: '/galleries', label: 'Galleries' },
  { href: '/map', label: 'Map' }
]

function isActive(pathname, href) {
  if (href === '/') {
    return pathname === '/'
  }

  if (href === '/galleries') {
    return pathname === '/galleries' || pathname.startsWith('/gallery/')
  }

  if (href === '/whats-on') {
    return pathname === '/whats-on' || pathname.startsWith('/exhibition/')
  }

  return pathname.startsWith(href)
}

export default function SiteNav() {
  const pathname = usePathname()
  const isMapRoute = pathname.startsWith('/map')

  if (isMapRoute) {
    return null
  }

  return (
    <>
      <header className="site-header">
        <div className="brand-wrap">
          <Link className="brand" href="/">
            Sydney Art Finder
          </Link>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={`nav-link ${isActive(pathname, item.href) ? 'is-active' : ''}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <nav className="mobile-tabbar" aria-label="Mobile primary navigation">
        {navItems.map((item) => (
          <Link
            key={`mobile-${item.href}`}
            className={`mobile-tab ${isActive(pathname, item.href) ? 'is-active' : ''}`}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
