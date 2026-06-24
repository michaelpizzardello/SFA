import Link from 'next/link'
import { formatDateRange, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'
import CardImage from './CardImage'
import SaveButton from './SaveButton'

function daysUntil(iso, today) {
  const a = Date.parse(`${iso}T00:00:00Z`)
  const b = Date.parse(`${today}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((a - b) / 86400000)
}

// Cards carry NO status pill by default (status comes from the section/grouping + the grey date,
// per Ocula/Artsy). The ONE exception is genuine urgency: a current show closing within a week.
function resolveTag(exhibition, status) {
  if (status === 'current' && exhibition.endDate) {
    const d = daysUntil(exhibition.endDate, todayISOInSydney())
    if (d != null && d >= 0 && d <= 7) {
      const label = d === 0 ? 'Closes today' : d === 1 ? 'Closes tomorrow' : `Closes in ${d} days`
      return { cls: 'closing', label }
    }
  }
  return null
}

export default function ExhibitionCard({ exhibition, gallery, status }) {
  const href = `/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`
  const galleryName = gallery?.name || exhibition.galleryName || ''
  const precinct = gallery?.precinct || exhibition.location || ''
  const range = formatDateRange(exhibition.startDate, exhibition.endDate)
  const tag = status ? resolveTag(exhibition, status) : null

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
          {tag ? <span className={`tag tag--${tag.cls} ex__tag`}>{tag.label}</span> : null}
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
      <SaveButton kind="exhibition" slug={getExhibitionSlug(exhibition)} label={exhibition.title} />
    </div>
  )
}
