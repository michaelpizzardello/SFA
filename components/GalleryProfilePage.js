import Link from 'next/link'
import ExhibitionCard from './ExhibitionCard'
import FollowButton from './FollowButton'
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

  return (
    <div className="container profile">
      <Link className="back-link" href="/galleries">
        ← Galleries
      </Link>

      {cover ? (
        <div className="profile-cover">
          <img src={cover} alt="" />
        </div>
      ) : null}

      <section className="gallery-hero">
        {gallery.logoUrl ? <img className="gallery-hero__logo" src={gallery.logoUrl} alt="" /> : null}
        <div className="gallery-hero__head">
          {sub ? <p className="eyebrow">{sub}</p> : null}
          <h1>{gallery.name}</h1>
          {gallery.address || gallery.suburb ? (
            <p className="gallery-hero__loc meta">{gallery.address || gallery.suburb}</p>
          ) : null}
          <div className="gallery-hero__actions">
            <FollowButton slug={gallery.slug} label={gallery.name} />
            <ShareButton title={gallery.name} />
            {gallery.address ? (
              <a className="btn btn--ghost" href={directionsHref} target="_blank" rel="noreferrer">
                Directions
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {gallery.about ? (
        <section className="profile-section profile-about">
          <p>{gallery.about}</p>
        </section>
      ) : null}

      {current.length ? (
        <section className="profile-section">
          <h2>Current exhibitions</h2>
          <ExGrid exhibitions={current} gallery={gallery} />
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="profile-section">
          <h2>Upcoming</h2>
          <ExGrid exhibitions={upcoming} gallery={gallery} />
        </section>
      ) : null}

      {past.length ? (
        <section className="profile-section">
          <h2>Past</h2>
          <ExGrid exhibitions={past} gallery={gallery} />
        </section>
      ) : null}

      {contact.length || gallery.openingHours?.length ? (
        <section className="profile-section gallery-visit">
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
