import BackLinkButton from './BackLinkButton'
import Link from 'next/link'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus } from '../lib/utils/exhibitions'

const statusLabels = {
  current: 'Current',
  upcoming: 'Upcoming',
  past: 'Past'
}

function sanitizePhone(phoneNumber) {
  return phoneNumber.replace(/[^\d+]/g, '')
}

function ExhibitionList({ exhibitions }) {
  if (!exhibitions.length) {
    return <p className="empty-copy">No exhibitions listed.</p>
  }

  return (
    <ul className="exhibition-list">
      {exhibitions.map((exhibition) => {
        const status = getExhibitionStatus(exhibition)

        return (
          <li key={exhibition.id} className="exhibition-item">
            <div className="item-head">
              <h3 className="item-title">{exhibition.title}</h3>
              <span className={`status-tag status-${status}`}>{statusLabels[status]}</span>
            </div>
            <p className="item-artist">{exhibition.artist}</p>
            <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
            {exhibition.openingDate ? (
              <p className="item-meta">
                Opening: {formatDate(exhibition.openingDate)}
                {exhibition.openingTime ? ` | ${exhibition.openingTime}` : ''}
              </p>
            ) : null}
            <div className="item-actions">
              <Link
                className="text-link"
                href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}
              >
                Exhibition details
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function GalleryProfilePage({ gallery, groupedExhibitions }) {
  const mapsQuery = encodeURIComponent(gallery.address || gallery.name)
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <>
      <section className="profile-hero">
        <BackLinkButton fallbackHref="/galleries" label="Back" />
        <h1>{gallery.name}</h1>
        <p className="item-kicker">{gallery.precinct}</p>
        <p className="item-meta">{gallery.address}</p>
        <a className="button button-secondary" href={directionsHref} target="_blank" rel="noreferrer">
          Get directions
        </a>
        <p className="item-meta">Current exhibitions: {groupedExhibitions.current.length}</p>
      </section>

      <section className="page-block">
        <div className="profile-columns">
          <article>
            <h2>Visit</h2>
            <ul className="detail-list">
              <li>{gallery.address}</li>
              {gallery.phone ? (
                <li>
                  <a href={`tel:${sanitizePhone(gallery.phone)}`}>{gallery.phone}</a>
                </li>
              ) : null}
              {gallery.email ? (
                <li>
                  <a href={`mailto:${gallery.email}`}>{gallery.email}</a>
                </li>
              ) : null}
              {gallery.website ? (
                <li>
                  <a href={gallery.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                </li>
              ) : null}
              {gallery.instagram ? (
                <li>
                  <a href={gallery.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>

            <h3>Opening hours</h3>
            <ul className="detail-list">
              {gallery.openingHours?.length
                ? gallery.openingHours.map((entry) => <li key={entry}>{entry}</li>)
                : <li>Hours not listed</li>}
            </ul>
          </article>

          <article>
            <details className="profile-disclosure">
              <summary>About</summary>
              <p className="section-copy">{gallery.about || 'Gallery details coming soon.'}</p>
            </details>
          </article>
        </div>
      </section>

      <section className="page-block">
        <h2>Current Exhibitions</h2>
        <ExhibitionList exhibitions={groupedExhibitions.current} />
      </section>

      <section className="page-block">
        <h2>Upcoming Exhibitions</h2>
        <ExhibitionList exhibitions={groupedExhibitions.upcoming} />
      </section>

      <section className="page-block">
        <details className="profile-disclosure">
          <summary>Past Exhibitions ({groupedExhibitions.past.length})</summary>
          <ExhibitionList exhibitions={groupedExhibitions.past} />
        </details>
      </section>
    </>
  )
}
