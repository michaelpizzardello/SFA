import Link from 'next/link'
import ExhibitionCard from './ExhibitionCard'

function sanitizePhone(phoneNumber) {
  return phoneNumber.replace(/[^\d+]/g, '')
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
          Instagram
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

      <section className="profile-hero">
        <p className="eyebrow">{sub}</p>
        <h1>{gallery.name}</h1>
        <div className="profile-hero__meta">
          {gallery.address ? <span className="meta">{gallery.address}</span> : null}
          {gallery.address ? (
            <a className="btn btn--ghost" href={directionsHref} target="_blank" rel="noreferrer">
              Get directions
            </a>
          ) : null}
        </div>
      </section>

      {gallery.about ? (
        <section className="profile-section profile-about">
          <p>{gallery.about}</p>
        </section>
      ) : null}

      <div className="profile-cols">
        {contact.length || gallery.openingHours?.length ? (
          <section className="profile-section">
            <h2>Visit</h2>
            <dl className="def-list">
              {contact.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
              {gallery.openingHours?.length ? (
                <div>
                  <dt>Hours</dt>
                  <dd>
                    {gallery.openingHours.map((h) => (
                      <div key={h}>{h}</div>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}
      </div>

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

      {!hasExhibitions ? (
        <section className="profile-section">
          <p className="text-muted">No exhibitions listed yet.</p>
        </section>
      ) : null}
    </div>
  )
}
