import Link from 'next/link'
import { formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'

// One markup for grid-card AND list-row (list view hides .ex__media via CSS).
// Title-first per the locked hierarchy + the real schema (artist/image are optional upside fields).
const STATUS_LABEL = { current: 'On now', upcoming: 'Opening soon', past: 'Past', closing: 'Closing soon' }

export default function ExhibitionCard({ exhibition, gallery, status }) {
  const href = `/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`
  const galleryName = gallery?.name || exhibition.galleryName || ''
  const precinct = gallery?.precinct || exhibition.location || ''
  const range = formatDateRange(exhibition.startDate, exhibition.endDate)

  return (
    <Link href={href} className="ex">
      <div className="ex__media">
        {exhibition.imageUrl ? (
          <img className="ex__img" src={exhibition.imageUrl} alt="" loading="lazy" />
        ) : precinct ? (
          <span className="ex__placeholder-label" aria-hidden="true">
            {precinct}
          </span>
        ) : null}
      </div>
      <div className="ex__body">
        {status ? <span className={`tag tag--${status} ex__tag`}>{STATUS_LABEL[status] || status}</span> : null}
        <h3 className="ex__title title-work">{exhibition.title}</h3>
        {exhibition.artist ? <p className="ex__artist">{exhibition.artist}</p> : null}
        {galleryName ? (
          <p className="ex__gallery">
            {galleryName}
            {precinct ? `, ${precinct}` : ''}
          </p>
        ) : null}
        <p className="ex__meta meta">{range}</p>
      </div>
    </Link>
  )
}
