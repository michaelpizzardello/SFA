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
      {exhibition.imageUrl ? (
        <section className="page-block exhibition-image-block">
          <div className="exhibition-image-frame">
            <img className="exhibition-image" src={exhibition.imageUrl} alt={exhibition.title} />
          </div>
        </section>
      ) : null}

      <section className="profile-hero">
        <BackLinkButton fallbackHref="/whats-on" label="Back" />
        <h1>{exhibition.title}</h1>
        {exhibition.artist ? <p className="item-meta">{exhibition.artist}</p> : null}
        <span className={`status-tag status-${status}`}>{statusLabels[status]}</span>
        <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
        {exhibition.openingInformation ? <p className="item-meta">{exhibition.openingInformation}</p> : null}
        {gallery ? (
          <Link className="button button-secondary" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
            View {gallery.name}
          </Link>
        ) : null}
      </section>

      <section className="page-block">
        <h2>Visit details</h2>
        <div className="exhibition-detail-list">
          <p>{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
          {exhibition.openingInformation ? (
            <p>{exhibition.openingInformation}</p>
          ) : exhibition.openingDate ? (
            <p>
              Opening: {formatDate(exhibition.openingDate)}
              {exhibition.openingTime ? ` at ${exhibition.openingTime}` : ''}
            </p>
          ) : null}
          {gallery ? <p>{gallery.name}</p> : null}
          {gallery?.address ? <p>{gallery.address}</p> : null}
        </div>
      </section>

      {exhibition.summary ? (
        <section className="page-block">
          <h2>About this exhibition</h2>
          <p className="section-copy">{exhibition.summary}</p>
        </section>
      ) : null}
    </>
  )
}
