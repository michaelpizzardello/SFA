import { Manrope, Fraunces, Spline_Sans_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Cascade (DESIGN_SPEC §6): layered tokens/base/layout/components/pages,
// then unlayered vendor-overrides — imported last so Leaflet re-skins win.
import './styles/tokens.css'
import './styles/reset.css'
import './styles/type.css'
import './styles/layout.css'
// Components
import './styles/components/header.css'
import './styles/components/footer.css'
import './styles/components/tabbar.css'
import './styles/components/search-overlay.css'
import './styles/components/card-exhibition.css'
import './styles/components/card-gallery.css'
import './styles/components/save.css'
import './styles/components/buttons.css'
import './styles/components/forms.css'
import './styles/components/textlink.css'
import './styles/components/window-nav.css'
import './styles/components/toolbar.css'
import './styles/components/sheet.css'
import './styles/components/table.css'
import './styles/components/page-head.css'
// Pages
import './styles/pages/home.css'
import './styles/pages/whats-on.css'
import './styles/pages/galleries.css'
import './styles/pages/profile.css'
import './styles/pages/exhibition.css'
import './styles/pages/map.css'
import './styles/pages/saved.css'
import './styles/pages/auth.css'
import './styles/pages/dashboard.css'
import './styles/pages/console.css'
// Unlayered last word
import './styles/vendor-overrides.css'

import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

// Fraunces = serif (prose, wordmark, monogram). Manrope = sans (UI, names). Spline = mono (facts).
// These MUST stay the direct next/font variables — a nested alias breaks `font:` shorthand.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap'
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-text',
  weight: ['400', '500', '600'],
  display: 'swap'
})

const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap'
})

export const metadata = {
  title: 'Sydney Art Finder | Your guide to the Sydney art scene',
  description:
    'Sydney Art Finder is your guide to galleries, exhibitions, and opening nights across Sydney.'
}

// The audience and primary data sources are Sydney-based. Dynamic routes inherit
// this so user requests do not make a round trip through Vercel's US default.
export const preferredRegion = 'syd1'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="shell">
          <SiteNav />
          <main id="main" tabIndex={-1} className="shell-main">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
