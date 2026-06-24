import Link from 'next/link'

function monogram(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '·'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export default function GalleryCard({ gallery, currentCount = 0 }) {
  const image = gallery.coverUrl || gallery.logoUrl
  const sub = [gallery.precinct, gallery.suburb].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ')

  return (
    <Link href={`/gallery/${encodeURIComponent(gallery.slug)}`} className="gal">
      <div className="gal__media">
        {image ? (
          <img className="gal__img" src={image} alt="" loading="lazy" />
        ) : (
          <span className="gal__monogram" aria-hidden="true">
            {monogram(gallery.name)}
          </span>
        )}
      </div>
      <div className="gal__body">
        <p className="gal__name">{gallery.name}</p>
        {sub ? <p className="gal__meta meta">{sub}</p> : null}
        {currentCount > 0 ? <p className="gal__count">{currentCount} current</p> : null}
      </div>
    </Link>
  )
}
