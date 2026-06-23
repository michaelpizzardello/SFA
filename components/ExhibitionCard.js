import Link from 'next/link'
import { formatDate } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'

// Editorial, image-forward exhibition card (Ocula/Artsy style). Always shows a media tile —
// the image when present, otherwise a typographic fallback on a warm tint, so a catalogue with
// few photos still reads as a designed grid rather than text rows.
const TINTS = ['#ece2d2', '#e7ddcd', '#efe1d7', '#e4e2d2', '#efdfd9', '#e6e0cd', '#efe6da']

function tintFor(value) {
  let hash = 0
  const s = String(value || 'x')
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return TINTS[hash % TINTS.length]
}

const STATUS_LABEL = { current: 'On now', upcoming: 'Opening soon', past: 'Past' }

export default function ExhibitionCard({ exhibition, gallery, status }) {
  const href = `/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`
  const galleryName = gallery?.name || exhibition.galleryName || ''
  const precinct = gallery?.precinct || exhibition.location || ''
  const range = exhibition.endDate
    ? `${formatDate(exhibition.startDate)} – ${formatDate(exhibition.endDate)}`
    : formatDate(exhibition.startDate)

  return (
    <Link href={href} className="ex-card">
      <div
        className="ex-card-media"
        style={exhibition.imageUrl ? undefined : { backgroundColor: tintFor(exhibition.title || galleryName) }}
      >
        {exhibition.imageUrl ? (
          <img className="ex-card-img" src={exhibition.imageUrl} alt="" loading="lazy" />
        ) : (
          <span className="ex-card-fallback">{exhibition.artist || exhibition.title}</span>
        )}
        {status ? <span className={`ex-card-status ex-status-${status}`}>{STATUS_LABEL[status] || status}</span> : null}
      </div>
      <div className="ex-card-body">
        {exhibition.artist ? <p className="ex-card-artist">{exhibition.artist}</p> : null}
        <p className="ex-card-title">{exhibition.title}</p>
        {galleryName ? (
          <p className="ex-card-gallery">
            {galleryName}
            {precinct ? `, ${precinct}` : ''}
          </p>
        ) : null}
        <p className="ex-card-date">{range}</p>
      </div>
    </Link>
  )
}
