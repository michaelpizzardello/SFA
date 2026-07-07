'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import InstagramIcon from './icons/InstagramIcon'
import { SAF_INSTAGRAM } from '../lib/site'
import { isChromelessRoute } from '../lib/utils/chrome'

// Public footer (light, §4.2) — rendered as a SIBLING of <main>. Gallery access lives HERE
// (not the top header) — the public audience never signs in; galleries do, occasionally.
// (Admin console is intentionally NOT here — it's internal tooling reached from the dashboard.)
export default function SiteFooter({ signedIn = false }) {
  const pathname = usePathname()
  if (isChromelessRoute(pathname) || pathname.startsWith('/map')) return null

  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__wordmark">
            Sydney Art Finder
          </Link>
          <p className="site-footer__tag">Exhibitions, galleries and openings across Sydney.</p>
          <a className="site-footer__social" href={SAF_INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Instagram">
            <InstagramIcon size={20} />
          </a>
        </div>

        <nav className="site-footer__col" aria-label="Browse">
          <p className="site-footer__label">Browse</p>
          <Link href="/whats-on">What&apos;s On</Link>
          <Link href="/galleries">Galleries</Link>
          <Link href="/map">Map</Link>
          <Link href="/saved">Saved</Link>
        </nav>

        <nav className="site-footer__col" aria-label="For galleries">
          <p className="site-footer__label">For galleries</p>
          {signedIn ? (
            <Link href="/dashboard">Gallery dashboard</Link>
          ) : (
            <Link href="/login">Gallery login</Link>
          )}
        </nav>
      </div>
      <div className="container site-footer__base">
        <span className="meta">© {year} Sydney Art Finder</span>
      </div>
    </footer>
  )
}
