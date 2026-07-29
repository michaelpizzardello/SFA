import Link from 'next/link'
import { addDaysISO, compareISO, formatDate, formatDateRange, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import { splitTitle } from '../lib/utils/splitTitle'
import ExhibitionBackLink from './ExhibitionBackLink'
import ExhibitionCard from './ExhibitionCard'
import ShareButton from './ShareButton'

const STATUS_LABEL = { current: 'On now', upcoming: 'Opening soon', past: 'Past' }

function RelatedGrid({ items, galleries, today }) {
  return (
    <div className="exl-grid">
      {items.map((e) => (
        <ExhibitionCard
          key={e.id}
          exhibition={e}
          gallery={getGalleryBySlug(galleries, e.gallerySlug)}
          status={getExhibitionStatus(e, today)}
        />
      ))}
    </div>
  )
}

export default function ExhibitionProfilePage({ exhibition, gallery, allExhibitions = [], allGalleries = [] }) {
  const status = getExhibitionStatus(exhibition)
  const currentSlug = getExhibitionSlug(exhibition)
  const mapsHref = gallery?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gallery.address)}`
    : null
  // openingTime is a known-empty field — never rendered (§5.5)
  const openingNight =
    exhibition.openingInformation ||
    (exhibition.openingDate ? formatDate(exhibition.openingDate) : '')

  const today = todayISOInSydney()
  const soonCutoff = addDaysISO(today, 21)
  const moreAtGallery = allExhibitions
    .filter((e) => e.gallerySlug === exhibition.gallerySlug && getExhibitionSlug(e) !== currentSlug)
    .slice(0, 3)
  const closingSoon = allExhibitions
    .filter(
      (e) =>
        getExhibitionSlug(e) !== currentSlug &&
        getExhibitionStatus(e, today) === 'current' &&
        e.endDate &&
        compareISO(e.endDate, soonCutoff) <= 0
    )
    .sort((a, b) => compareISO(a.endDate, b.endDate))
    .slice(0, 3)

  const galleryHref = gallery ? `/gallery/${encodeURIComponent(gallery.slug)}` : null
  const locality = gallery?.precinct || gallery?.suburb || exhibition.location || ''
  const { artist, title } = splitTitle(exhibition.artist, exhibition.title)
  const facts = [
    openingNight && { label: 'Opening', value: openingNight },
    { label: 'Cost', value: exhibition.cost || 'Free' },
    gallery?.address && { label: 'Address', value: gallery.address },
    gallery?.openingHours?.length && {
      label: 'Hours',
      value: gallery.openingHours.map((h) => (
        <span key={h} className="ledger__line">
          {h}
        </span>
      ))
    }
  ].filter(Boolean)

  return (
    <div className="exl">
      <div className="container">
        <ExhibitionBackLink galleryName={gallery?.name} galleryHref={galleryHref} />

        <header className="exl-masthead">
          <div className="exl-kicker">
            <span>{status ? STATUS_LABEL[status] : 'Exhibition'}</span>
            {locality ? <span>{locality}</span> : null}
          </div>
          {artist ? (
            <h1 className="exl-h1">{artist}</h1>
          ) : (
            <h1 className="exl-h1 exl-h1--title">{title}</h1>
          )}
          {artist && title ? <p className="exl-sub">{title}</p> : null}
          <p className="exl-byline">
            <span className="exl-dates">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
            {gallery ? (
              <Link className="exl-gallery" href={galleryHref}>
                {gallery.name}{' '}
                <span className="exl-gallery__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ) : exhibition.galleryName ? (
              <span className="exl-gallery">{exhibition.galleryName}</span>
            ) : null}
          </p>
          <div className="exl-actions">
            {mapsHref ? (
              <a className="btn btn--outline" href={mapsHref} target="_blank" rel="noreferrer">
                Get directions
              </a>
            ) : null}
            <ShareButton title={exhibition.title} className="btn btn--text" />
          </div>
        </header>

        {exhibition.imageUrl ? (
          <figure className="exl-plate">
            <img src={exhibition.imageUrl} alt={exhibition.title} decoding="async" />
          </figure>
        ) : null}

        {exhibition.summary ? (
          <section className="exl-about">
            <p className="u-serif">{exhibition.summary}</p>
          </section>
        ) : null}

        {facts.length ? (
          <section className="exl-details">
            <p className="u-eyebrow exl-label">Details</p>
            <dl className="ledger">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {moreAtGallery.length ? (
          <section className="exl-section">
            <header className="section-head">
              <h2>More at {gallery?.name || 'this gallery'}</h2>
            </header>
            <RelatedGrid items={moreAtGallery} galleries={allGalleries} today={today} />
          </section>
        ) : null}
      </div>

      {closingSoon.length ? (
        <section className="band exl-closing">
          <div className="container">
            <header className="section-head">
              <h2>Closing soon across Sydney</h2>
            </header>
            <RelatedGrid items={closingSoon} galleries={allGalleries} today={today} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
