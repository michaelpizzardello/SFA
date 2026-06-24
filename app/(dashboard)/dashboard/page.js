import Link from 'next/link'
import { getOwnedGalleries, getGalleryExhibitions } from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardOverview() {
  const { user, galleries } = await getOwnedGalleries()

  if (!galleries.length) {
    return (
      <section className="dashboard-panel">
        <h1>No gallery linked yet</h1>
        <p className="section-copy">
          Your account ({user?.email}) isn&apos;t linked to a gallery yet. Ask the Sydney Art Finder team
          to connect your gallery, then refresh this page.
        </p>
      </section>
    )
  }

  const gallery = galleries[0]
  const exhibitions = await getGalleryExhibitions(gallery.id)

  const checklist = []
  if (!gallery.about) checklist.push({ label: 'Add an About description', href: '/dashboard/profile' })
  if (!gallery.cover_url && !gallery.logo_url) checklist.push({ label: 'Upload a logo or cover image', href: '/dashboard/profile' })
  if (gallery.latitude == null || gallery.longitude == null) checklist.push({ label: 'Set your map location', href: '/dashboard/profile' })
  if (!exhibitions.length) checklist.push({ label: 'Add your first exhibition', href: '/dashboard/exhibitions/new' })

  // Single clear primary action, driven by setup state (Artsy partner-dashboard pattern).
  const profileIncomplete = !gallery.about || (!gallery.cover_url && !gallery.logo_url) || gallery.latitude == null || gallery.longitude == null
  const primary = profileIncomplete
    ? { href: '/dashboard/profile', label: 'Complete your profile' }
    : { href: '/dashboard/exhibitions/new', label: 'Add exhibition' }

  return (
    <section className="dashboard-panel">
      <p className="item-kicker">{gallery.precinct}</p>
      <h1>{gallery.name}</h1>
      {galleries.length > 1 ? (
        <p className="form-hint">
          You manage {galleries.length} galleries. This dashboard currently edits {gallery.name}.
        </p>
      ) : null}

      {checklist.length ? (
        <div className="dashboard-checklist">
          <h2>Finish setting up</h2>
          <ul>
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="section-copy">Your gallery profile is complete.</p>
      )}

      <div className="dashboard-quick-actions">
        <Link className="button button-primary" href={primary.href}>
          {primary.label}
        </Link>
        <Link className="button button-secondary" href="/dashboard/exhibitions">
          Exhibitions
        </Link>
        <Link className="button button-secondary" href="/dashboard/profile">
          Edit profile
        </Link>
        <Link className="text-link" href={`/gallery/${gallery.slug}`}>
          View public page
        </Link>
      </div>
    </section>
  )
}
