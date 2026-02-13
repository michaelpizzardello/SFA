import Link from 'next/link'
import BackLinkButton from './BackLinkButton'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { getExhibitionStatus } from '../lib/utils/exhibitions'

const statusLabels = {
  current: 'Current',
  upcoming: 'Upcoming',
  past: 'Past'
}

export default function ExhibitionProfilePage({ exhibition, gallery }) {
  const status = getExhibitionStatus(exhibition)

  return (
    <>
      <section className="profile-hero">
        <BackLinkButton fallbackHref="/whats-on" label="Back" />
        <h1>{exhibition.title}</h1>
        <p className="item-meta">{exhibition.artist}</p>
        <span className={`status-tag status-${status}`}>{statusLabels[status]}</span>
        <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
        {exhibition.openingDate ? (
          <p className="item-meta">
            Opening: {formatDate(exhibition.openingDate)}
            {exhibition.openingTime ? ` | ${exhibition.openingTime}` : ''}
          </p>
        ) : null}
        {gallery ? (
          <Link className="button button-secondary" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
            View {gallery.name}
          </Link>
        ) : null}
      </section>

      <section className="page-block">
        <h2>Visit details</h2>
        <ul className="detail-list">
          <li>Date range: {formatDateRange(exhibition.startDate, exhibition.endDate)}</li>
          {exhibition.openingDate ? (
            <li>
              Opening: {formatDate(exhibition.openingDate)}
              {exhibition.openingTime ? ` at ${exhibition.openingTime}` : ''}
            </li>
          ) : null}
          <li>Cost: {exhibition.cost || 'Free'}</li>
          {gallery ? <li>Gallery: {gallery.name}</li> : null}
          {gallery?.address ? <li>Address: {gallery.address}</li> : null}
        </ul>
      </section>

      <section className="page-block">
        <h2>About this exhibition</h2>
        <p className="section-copy">{exhibition.summary || 'Details coming soon.'}</p>
      </section>
    </>
  )
}
