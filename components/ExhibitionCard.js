import Link from 'next/link'
import { formatDateRange, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'
import { addReturnContext } from '../lib/utils/navigation'
import { splitTitle } from '../lib/utils/splitTitle'
import CardImage from './CardImage'
import SaveButton from './SaveButton'

function daysUntil(iso, today) {
  const a = Date.parse(`${iso}T00:00:00Z`)
  const b = Date.parse(`${today}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((a - b) / 86400000)
}

// Cards carry NO status by default (the section/grouping + the grey date carry it). The ONE
// exception is genuine urgency: a current show closing within a week — an ink eyebrow, never accent.
function resolveUrgency(exhibition, status) {
  if (status === 'current' && exhibition.endDate) {
    const d = daysUntil(exhibition.endDate, todayISOInSydney())
    if (d != null && d >= 0 && d <= 7) {
      return d === 0 ? 'Closes today' : d === 1 ? 'Closes tomorrow' : `Closes in ${d} days`
    }
  }
  return null
}

// Ladder (§4.6): urgency → ARTIST → italic title → gallery → mono dates → mono location.
export default function ExhibitionCard({ exhibition, gallery, status, returnHref, returnLabel }) {
  const href = addReturnContext(
    `/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`,
    returnHref,
    returnLabel
  )
  const galleryName = gallery?.name || exhibition.galleryName || ''
  const precinct = gallery?.precinct || exhibition.location || ''
  const range = formatDateRange(exhibition.startDate, exhibition.endDate)
  const urgency = status ? resolveUrgency(exhibition, status) : null
  const { artist, title } = splitTitle(exhibition.artist, exhibition.title)

  return (
    <div className="ex">
      <Link href={href} className="ex__link" aria-label={`${exhibition.title}${galleryName ? ` — ${galleryName}` : ''}`}>
        <div className="ex__media">
          {exhibition.imageUrl ? (
            <CardImage className="ex__img" src={exhibition.imageUrl} />
          ) : precinct ? (
            <span className="ex__placeholder-label" aria-hidden="true">
              {precinct}
            </span>
          ) : null}
        </div>
        <div className="ex__body">
          {urgency ? <span className="ex__urgency">{urgency}</span> : null}
          {artist ? <p className="ex__artist">{artist}</p> : null}
          <h3 className="ex__title">{title}</h3>
          {galleryName ? <p className="ex__gallery">{galleryName}</p> : null}
          <p className="ex__dates">{range}</p>
          {precinct ? <p className="ex__location">{precinct}</p> : null}
        </div>
      </Link>
      <SaveButton kind="exhibition" slug={getExhibitionSlug(exhibition)} label={exhibition.title} />
    </div>
  )
}
