import { Manrope, Oswald } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './globals.css'
import SiteNav from '../components/SiteNav'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700']
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
      <body className={`${oswald.variable} ${manrope.variable}`}>
        <div className="site-shell">
          <SiteNav />
          <main className="site-main">{children}</main>
        </div>
      </body>
    </html>
  )
}
