import { Manrope, Fraunces } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './globals.css'
import './redesign.css'
import SiteNav from '../components/SiteNav'

// Editorial high-contrast serif for display, paired with Manrope for clean UI/body text.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic']
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700']
})

export const metadata = {
  title: 'Sydney Art Finder | Your guide to the Sydney art scene',
  description:
    'Sydney Art Finder is your guide to galleries, exhibitions, and opening nights across Sydney.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        <div className="site-shell">
          <SiteNav />
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  )
}
