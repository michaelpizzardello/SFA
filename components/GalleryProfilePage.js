import BackLinkButton from './BackLinkButton'
import Link from 'next/link'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'

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
        return (
          <li key={exhibition.id} className="exhibition-item">
            {exhibition.imageUrl ? (
              <div className="item-image-frame">
                <img className="item-image" src={exhibition.imageUrl} alt={exhibition.title} />
              </div>
            ) : null}
            <div className="item-body">
              <div className="item-head">
                <h3 className="item-title">{exhibition.title}</h3>
              </div>
              {exhibition.artist ? <p className="item-artist">{exhibition.artist}</p> : null}
              <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
              {exhibition.openingInformation ? (
                <p className="item-meta">{exhibition.openingInformation}</p>
              ) : exhibition.openingDate ? (
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
  const visitItems = [
    gallery.address ? <span>{gallery.address}</span> : null,
    gallery.phone ? <a href={`tel:${sanitizePhone(gallery.phone)}`}>{gallery.phone}</a> : null,
    gallery.email ? <a href={`mailto:${gallery.email}`}>{gallery.email}</a> : null,
    gallery.website ? (
      <a href={gallery.website} target="_blank" rel="noreferrer">
        Website
      </a>
    ) : null,
    gallery.instagram ? (
      <a href={gallery.instagram} target="_blank" rel="noreferrer">
        Instagram
      </a>
    ) : null
  ].filter(Boolean)
  const hasVisitDetails = visitItems.length > 0 || gallery.openingHours?.length > 0
  const hasCurrentExhibitions = groupedExhibitions.current.length > 0
  const hasUpcomingExhibitions = groupedExhibitions.upcoming.length > 0
  const hasPastExhibitions = groupedExhibitions.past.length > 0

  return (
    <>
      <section className="profile-hero">
        <BackLinkButton fallbackHref="/galleries" label="Back" />
        <h1>{gallery.name}</h1>
        <p className="item-kicker">{gallery.precinct}</p>
        {gallery.address ? <p className="item-meta">{gallery.address}</p> : null}
        {gallery.address ? (
          <a className="button button-secondary" href={directionsHref} target="_blank" rel="noreferrer">
            Get directions
          </a>
        ) : null}
        {hasCurrentExhibitions ? (
          <p className="item-meta">Current exhibitions: {groupedExhibitions.current.length}</p>
        ) : null}
      </section>

      {hasVisitDetails || gallery.about ? <section className="page-block">
        <div className="profile-columns">
          {hasVisitDetails ? <article>
            <h2>Visit</h2>
            {visitItems.length ? (
              <ul className="detail-list">
                {visitItems.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            ) : null}

            {gallery.openingHours?.length ? (
              <>
                <h3>Opening hours</h3>
                <ul className="detail-list">
                  {gallery.openingHours.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </>
            ) : null}
          </article> : null}

          {gallery.about ? (
            <article>
              <details className="profile-disclosure">
                <summary>About</summary>
                <p className="section-copy">{gallery.about}</p>
              </details>
            </article>
          ) : null}
        </div>
      </section> : null}

      {hasCurrentExhibitions ? <section className="page-block">
        <h2>Current Exhibitions</h2>
        <ExhibitionList exhibitions={groupedExhibitions.current} />
      </section> : null}

      {hasUpcomingExhibitions ? <section className="page-block">
        <h2>Upcoming Exhibitions</h2>
        <ExhibitionList exhibitions={groupedExhibitions.upcoming} />
      </section> : null}

      {hasPastExhibitions ? <section className="page-block">
        <details className="profile-disclosure">
          <summary>Past Exhibitions ({groupedExhibitions.past.length})</summary>
          <ExhibitionList exhibitions={groupedExhibitions.past} />
        </details>
      </section> : null}
    </>
  )
}
