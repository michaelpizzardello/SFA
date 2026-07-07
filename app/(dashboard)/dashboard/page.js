import Link from 'next/link'
import { getOwnedGalleries, getGalleryExhibitions } from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardOverview() {
  const { user, galleries } = await getOwnedGalleries()

  if (!galleries.length) {
    return (
      <section className="dash-panel">
        <h1 className="page-head__title">No gallery linked yet</h1>
        <p className="empty-state">
          Your account ({user?.email}) isn&apos;t linked to a gallery yet. Ask the Sydney Art Finder team
          to connect your gallery, then refresh this page.
        </p>
      </section>
    )
  }

  const gallery = galleries[0]
  const exhibitions = await getGalleryExhibitions(gallery.id)
  const publishedCount = exhibitions.filter((e) => e.published).length

  const checklist = []
  if (!gallery.about) checklist.push({ label: 'Add an About description', href: '/dashboard/profile' })
  if (!gallery.cover_url && !gallery.logo_url) checklist.push({ label: 'Upload a cover image', href: '/dashboard/profile' })
  if (gallery.latitude == null || gallery.longitude == null) checklist.push({ label: 'Set your map location', href: '/dashboard/profile' })
  if (!exhibitions.length) checklist.push({ label: 'Add your first exhibition', href: '/dashboard/exhibitions/new' })

  // Single clear primary action, driven by setup state (Artsy partner-dashboard pattern).
  const profileIncomplete = !gallery.about || (!gallery.cover_url && !gallery.logo_url) || gallery.latitude == null || gallery.longitude == null
  const primary = profileIncomplete
    ? { href: '/dashboard/profile', label: 'Complete your profile' }
    : { href: '/dashboard/exhibitions/new', label: 'Add exhibition' }

  return (
    <section className="dash-panel">
      <div className="page-head">
        <div className="page-head__main">
          <p className="page-head__kicker">{gallery.precinct}</p>
          <h1 className="page-head__title">{gallery.name}</h1>
        </div>
        <Link className="btn btn--primary page-head__action" href={primary.href}>
          {primary.label}
        </Link>
      </div>

      {galleries.length > 1 ? (
        <p className="dash-hint">
          You manage {galleries.length} galleries. This dashboard currently edits {gallery.name}.
        </p>
      ) : null}

      <div className="stat-row dash-stats">
        <div className="stat-cell">
          <span className="stat-cell__count">{exhibitions.length}</span>
          <span className="stat-cell__label">Exhibitions</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__count">{publishedCount}</span>
          <span className="stat-cell__label">Published</span>
        </div>
        <div className="stat-cell">
          <span className="dash-stat-word">{profileIncomplete ? 'Needs setup' : 'Complete'}</span>
          <span className="stat-cell__label">Profile</span>
        </div>
      </div>

      {checklist.length ? (
        <div className="dash-checklist">
          <h2 className="u-eyebrow">Finish setting up</h2>
          <ul>
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="dash-actions">
        <Link className="action-link" href="/dashboard/exhibitions">
          Manage exhibitions
        </Link>
        <Link className="action-link" href="/dashboard/profile">
          Edit profile
        </Link>
        <Link className="action-link" href={`/gallery/${gallery.slug}`}>
          View public page
        </Link>
      </div>
    </section>
  )
}
