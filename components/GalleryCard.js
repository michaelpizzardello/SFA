import Link from 'next/link'
import CardImage from './CardImage'
import SaveButton from './SaveButton'

function monogram(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '·'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export default function GalleryCard({ gallery, summary }) {
  const image = gallery.coverUrl || gallery.logoUrl
  const sub = [gallery.precinct, gallery.suburb].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ')
  const onView = summary?.current
    ? `${summary.current} show${summary.current > 1 ? 's' : ''} on now`
    : summary?.upcoming
      ? 'Opening soon'
      : null

  return (
    <div className="gal">
      <Link href={`/gallery/${encodeURIComponent(gallery.slug)}`} className="gal__link" aria-label={gallery.name}>
        <div className={`gal__media${image ? '' : ' gal__media--empty'}`}>
          {image ? (
            <CardImage className="gal__img" src={image} />
          ) : (
            <span className="gal__monogram" aria-hidden="true">
              {monogram(gallery.name)}
            </span>
          )}
        </div>
        <div className="gal__body">
          <p className="gal__name">{gallery.name}</p>
          {sub ? <p className="gal__meta">{sub}</p> : null}
          {onView ? <p className={`gal__onview${summary?.current ? '' : ' gal__onview--soon'}`}>{onView}</p> : null}
        </div>
      </Link>
      <SaveButton kind="gallery" slug={gallery.slug} label={gallery.name} />
    </div>
  )
}
