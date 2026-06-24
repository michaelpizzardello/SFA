import { Manrope, Fraunces, Spline_Sans_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Base: tokens + reset
import './globals.css'
import './styles/base.css'
import './styles/layout.css'
// Components
import './styles/components/buttons.css'
import './styles/components/forms.css'
import './styles/components/chips.css'
import './styles/components/tags.css'
import './styles/components/card-exhibition.css'
import './styles/components/card-gallery.css'
import './styles/components/header.css'
import './styles/components/tabbar.css'
import './styles/components/sheet.css'
import './styles/components/index-list.css'
// Pages
import './styles/pages/home.css'
import './styles/pages/whats-on.css'
import './styles/pages/galleries.css'
import './styles/pages/profile.css'
import './styles/pages/map.css'
import './styles/pages/auth.css'
import './styles/pages/dashboard.css'

import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import { getAuthContext } from '../lib/auth/roles'

// Fraunces = display (serif titles, editorial). Manrope = sans (names, UI). Spline = mono (facts).
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap'
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-text',
  weight: ['400', '500', '600', '700'],
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

export default async function RootLayout({ children }) {
  const { user } = await getAuthContext()

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
            <SiteFooter signedIn={Boolean(user)} />
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
