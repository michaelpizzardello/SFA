import Link from 'next/link'
import ExhibitionCard from './ExhibitionCard'
import FollowButton from './FollowButton'
import GalleryTabs from './GalleryTabs'
import ShareButton from './ShareButton'

function sanitizePhone(phoneNumber) {
  return phoneNumber.replace(/[^\d+]/g, '')
}

function instagramHandle(value) {
  const handle = value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/+$/, '')
    .replace(/^@/, '')
  return handle ? `@${handle}` : 'Instagram'
}

function ExGrid({ exhibitions, gallery }) {
  return (
    <div className="card-grid">
      {exhibitions.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} gallery={gallery} />
      ))}
    </div>
  )
}

export default function GalleryProfilePage({ gallery, groupedExhibitions }) {
  const mapsQuery = encodeURIComponent(gallery.address || gallery.name)
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
  const sub = [gallery.precinct, gallery.suburb].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ')

  const contact = [
    gallery.address && { label: 'Address', value: gallery.address },
    gallery.phone && { label: 'Phone', value: <a href={`tel:${sanitizePhone(gallery.phone)}`}>{gallery.phone}</a> },
    gallery.email && { label: 'Email', value: <a href={`mailto:${gallery.email}`}>{gallery.email}</a> },
    gallery.website && {
      label: 'Website',
      value: (
        <a href={gallery.website} target="_blank" rel="noreferrer">
          {gallery.website.replace(/^https?:\/\//, '')}
        </a>
      )
    },
    gallery.instagram && {
      label: 'Instagram',
      value: (
        <a href={gallery.instagram} target="_blank" rel="noreferrer">
          {instagramHandle(gallery.instagram)}
        </a>
      )
    }
  ].filter(Boolean)

  const cover = gallery.coverUrl
  const { current, upcoming, past } = groupedExhibitions
  const hasExhibitions = current.length || upcoming.length || past.length
  const locationLine = sub || gallery.suburb || ''
  const hasVisit = contact.length || gallery.openingHours?.length

  // Tab sub-nav (the wayfinding element Ocula + Artsy both lead with). Only sections
  // that actually have content become tabs, so a sparse gallery doesn't get a hollow bar.
  const tabs = [
    hasExhibitions && { id: 'exhibitions', label: 'Exhibitions' },
    gallery.about && { id: 'about', label: 'About' },
    hasVisit && { id: 'visit', label: 'Visit' }
  ].filter(Boolean)

  return (
    <div className="container profile gallery-profile">
      <Link className="back-link" href="/galleries">
        ← Galleries
      </Link>

      {cover ? (
        <div className="profile-cover">
          <img src={cover} alt="" />
        </div>
      ) : null}

      <header className="gallery-hero">
        <div className="gallery-hero__id">
          {gallery.logoUrl ? <img className="gallery-hero__logo" src={gallery.logoUrl} alt="" /> : null}
          <div className="gallery-hero__head">
            <h1>{gallery.name}</h1>
            {locationLine ? <p className="gallery-hero__loc">{locationLine}</p> : null}
          </div>
        </div>
        <div className="gallery-hero__actions">
          <FollowButton slug={gallery.slug} label={gallery.name} />
          <ShareButton title={gallery.name} />
        </div>
      </header>

      {tabs.length >= 2 ? <GalleryTabs tabs={tabs} /> : null}

      {current.length ? (
        <section id="exhibitions" className="profile-section">
          <h2>On now</h2>
          <ExGrid exhibitions={current} gallery={gallery} />
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="profile-section" id={current.length ? undefined : 'exhibitions'}>
          <h2>Opening soon</h2>
          <ExGrid exhibitions={upcoming} gallery={gallery} />
        </section>
      ) : null}

      {past.length ? (
        <section className="profile-section" id={current.length || upcoming.length ? undefined : 'exhibitions'}>
          <h2>Past</h2>
          <ExGrid exhibitions={past} gallery={gallery} />
        </section>
      ) : null}

      {gallery.about ? (
        <section id="about" className="profile-section profile-about">
          <h2>About</h2>
          <p>{gallery.about}</p>
        </section>
      ) : null}

      {hasVisit ? (
        <section id="visit" className="profile-section gallery-visit">
          <h2>Visit</h2>
          <div className="gallery-visit__cols">
            {gallery.openingHours?.length ? (
              <div className="gallery-visit__hours">
                <p className="eyebrow">Hours</p>
                {gallery.openingHours.map((h) => (
                  <p key={h} className="gallery-visit__hour">{h}</p>
                ))}
              </div>
            ) : null}
            {contact.length ? (
              <dl className="def-list">
                {contact.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {gallery.address ? (
            <a className="btn btn--ghost gallery-visit__directions" href={directionsHref} target="_blank" rel="noreferrer">
              Get directions
            </a>
          ) : null}
        </section>
      ) : null}

      {!hasExhibitions ? (
        <section className="profile-section">
          <p className="text-muted">No exhibitions listed yet.</p>
        </section>
      ) : null}
    </div>
  )
}
