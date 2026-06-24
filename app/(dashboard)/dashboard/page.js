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
  if (!gallery.about) checklist.push('Add an About description for your gallery')
  if (!gallery.cover_url && !gallery.logo_url) checklist.push('Upload a logo or cover image')
  if (gallery.latitude == null || gallery.longitude == null) checklist.push('Set your map location')
  if (!exhibitions.length) checklist.push('Add your first exhibition')

  return (
    <section className="dashboard-panel">
      <p className="item-kicker">{gallery.precinct}</p>
      <h1>{gallery.name}</h1>
      {galleries.length > 1 ? (
        <p className="form-hint">
          You manage {galleries.length} galleries. This dashboard currently edits {gallery.name}.
        </p>
      ) : null}

      <p className="row-meta">
        {exhibitions.length} exhibition{exhibitions.length === 1 ? '' : 's'} · {publishedCount} published
      </p>

      {checklist.length ? (
        <div className="dashboard-checklist">
          <h2>Finish setting up</h2>
          <ul>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="section-copy">Your gallery profile is complete.</p>
      )}

      <div className="dashboard-quick-actions">
        <Link className="button button-primary" href="/dashboard/exhibitions/new">
          Add exhibition
        </Link>
        <Link className="button button-secondary" href="/dashboard/profile">
          Edit profile
        </Link>
        <Link className="button button-secondary" href={`/gallery/${gallery.slug}`}>
          View public page
        </Link>
      </div>
    </section>
  )
}
