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
  const publishedCount = exhibitions.filter((e) => e.published).length

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
      <div className="page-head">
        <div className="page-head__title">
          <p className="item-kicker">{gallery.precinct}</p>
          <h1>{gallery.name}</h1>
        </div>
        <Link className="button button-primary" href={primary.href}>
          {primary.label}
        </Link>
      </div>

      {galleries.length > 1 ? (
        <p className="form-hint">
          You manage {galleries.length} galleries. This dashboard currently edits {gallery.name}.
        </p>
      ) : null}

      <div className="dash-cards">
        <div className="dash-card">
          <span className="dash-card__label">Exhibitions</span>
          <span className="dashboard-stat-num">{exhibitions.length}</span>
        </div>
        <div className="dash-card">
          <span className="dash-card__label">Published</span>
          <span className="dashboard-stat-num">{publishedCount}</span>
        </div>
        <div className="dash-card">
          <span className="dash-card__label">Profile</span>
          <span className={`badge ${profileIncomplete ? 'badge--draft' : 'badge--published'}`}>
            {profileIncomplete ? 'Needs setup' : 'Complete'}
          </span>
        </div>
      </div>

      {checklist.length ? (
        <div className="dash-card">
          <span className="dash-card__label">Finish setting up</span>
          <ul className="dashboard-checklist-list">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="dashboard-quick-actions">
        <Link className="button button-secondary" href="/dashboard/exhibitions">
          Manage exhibitions
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
