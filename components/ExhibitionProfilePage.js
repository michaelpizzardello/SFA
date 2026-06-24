import Link from 'next/link'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { getExhibitionStatus } from '../lib/utils/exhibitions'

const STATUS_LABEL = { current: 'On now', upcoming: 'Opening soon', past: 'Past' }

export default function ExhibitionProfilePage({ exhibition, gallery }) {
  const status = getExhibitionStatus(exhibition)
  const precinct = gallery?.precinct || exhibition.location || ''

  return (
    <div className="container profile">
      <Link className="back-link" href="/whats-on">
        ← What&apos;s On
      </Link>

      {exhibition.imageUrl ? (
        <div className="exhibition-image">
          <img src={exhibition.imageUrl} alt={exhibition.title} />
        </div>
      ) : null}

      <section className="profile-hero">
        <span className={`tag tag--${status}`}>{STATUS_LABEL[status]}</span>
        <h1>{exhibition.title}</h1>
        {exhibition.artist ? <p className="lead">{exhibition.artist}</p> : null}
        <div className="profile-hero__meta">
          <span className="meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
          {gallery ? (
            <Link className="link-arrow" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
              {gallery.name} →
            </Link>
          ) : (
            <span className="meta">{exhibition.galleryName}</span>
          )}
        </div>
      </section>

      {exhibition.summary ? (
        <section className="profile-section profile-about">
          <p>{exhibition.summary}</p>
        </section>
      ) : null}

      <section className="profile-section">
        <p className="eyebrow">Details</p>
        <dl className="def-list">
          <div>
            <dt>Dates</dt>
            <dd>{formatDateRange(exhibition.startDate, exhibition.endDate)}</dd>
          </div>
          {exhibition.openingInformation ? (
            <div>
              <dt>Opening</dt>
              <dd>{exhibition.openingInformation}</dd>
            </div>
          ) : exhibition.openingDate ? (
            <div>
              <dt>Opening</dt>
              <dd>
                {formatDate(exhibition.openingDate)}
                {exhibition.openingTime ? ` · ${exhibition.openingTime}` : ''}
              </dd>
            </div>
          ) : null}
          {gallery ? (
            <div>
              <dt>Gallery</dt>
              <dd>
                <Link href={`/gallery/${encodeURIComponent(gallery.slug)}`}>{gallery.name}</Link>
                {precinct ? `, ${precinct}` : ''}
              </dd>
            </div>
          ) : null}
          {gallery?.address ? (
            <div>
              <dt>Address</dt>
              <dd>{gallery.address}</dd>
            </div>
          ) : null}
          {gallery?.openingHours?.length ? (
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
    </div>
  )
}
