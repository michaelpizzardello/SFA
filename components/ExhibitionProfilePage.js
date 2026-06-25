import Link from 'next/link'
import { addDaysISO, compareISO, formatDate, formatDateRange, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import ExhibitionBackLink from './ExhibitionBackLink'
import ExhibitionCard from './ExhibitionCard'
import ShareButton from './ShareButton'

const STATUS_LABEL = { current: 'On now', upcoming: 'Opening soon', past: 'Past' }

function RelatedGrid({ items, galleries, today }) {
  return (
    <div className="card-grid">
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
  const openingNight =
    exhibition.openingInformation ||
    (exhibition.openingDate
      ? `${formatDate(exhibition.openingDate)}${exhibition.openingTime ? ` · ${exhibition.openingTime}` : ''}`
      : '')

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
  const facts = [
    openingNight && { label: 'Opening', value: openingNight },
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
    <div className="container ex2">
      <ExhibitionBackLink galleryName={gallery?.name} galleryHref={galleryHref} />

      <header className="ex2__masthead">
        <div className="ex2__kicker">
          <span>{status ? STATUS_LABEL[status] : 'Exhibition'}</span>
          {locality ? <span>{locality}</span> : null}
        </div>
        <h1 className="ex2__title">{exhibition.title}</h1>
        {exhibition.artist ? <p className="ex2__artist">{exhibition.artist}</p> : null}
        <p className="ex2__byline">
          <span className="ex2__dates">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
          {gallery ? (
            <Link className="ex2__gallery" href={galleryHref}>
              {gallery.name} →
            </Link>
          ) : exhibition.galleryName ? (
            <span className="ex2__gallery">{exhibition.galleryName}</span>
          ) : null}
        </p>
        <div className="ex2__actions">
          {mapsHref ? (
            <a className="btn btn--ghost" href={mapsHref} target="_blank" rel="noreferrer">
              Get directions
            </a>
          ) : null}
          <ShareButton title={exhibition.title} />
        </div>
      </header>

      {exhibition.imageUrl ? (
        <figure className="ex2__plate">
          <img src={exhibition.imageUrl} alt={exhibition.title} />
        </figure>
      ) : null}

      {exhibition.summary ? (
        <section className="ex2__about">
          <p>{exhibition.summary}</p>
        </section>
      ) : null}

      {facts.length ? (
        <section className="ex2__block">
          <p className="ex2__label">Details</p>
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
        <section className="ex2__block">
          <p className="ex2__label">More at {gallery?.name || 'this gallery'}</p>
          <RelatedGrid items={moreAtGallery} galleries={allGalleries} today={today} />
        </section>
      ) : null}

      {closingSoon.length ? (
        <section className="ex2__block">
          <p className="ex2__label">Closing soon across Sydney</p>
          <RelatedGrid items={closingSoon} galleries={allGalleries} today={today} />
        </section>
      ) : null}
    </div>
  )
}
