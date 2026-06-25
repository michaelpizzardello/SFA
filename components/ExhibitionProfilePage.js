import Link from 'next/link'
import { addDaysISO, compareISO, formatDate, formatDateRange, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
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

  return (
    <div className="container profile">
      <Link className="back-link" href="/whats-on">
        ← What&apos;s On
      </Link>

      <div className={`exhibition-detail__top${exhibition.imageUrl ? '' : ' exhibition-detail__top--noimg'}`}>
        {exhibition.imageUrl ? (
          <div className="exhibition-image">
            <img src={exhibition.imageUrl} alt={exhibition.title} />
          </div>
        ) : null}

        <section className="profile-hero">
          {status ? <span className={`tag tag--${status}`}>{STATUS_LABEL[status]}</span> : null}
          <h1>{exhibition.title}</h1>
          {exhibition.artist ? <p className="lead">{exhibition.artist}</p> : null}
          <div className="profile-hero__meta">
            <span className="meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
            {gallery ? (
              <Link className="link-arrow" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
                {gallery.name} →
              </Link>
            ) : (
              <span className="meta">{exhibition.galleryName}</span>
            )}
          </div>
          <div className="profile-hero__actions">
            {mapsHref ? (
              <a className="btn btn--ghost" href={mapsHref} target="_blank" rel="noreferrer">
                Get directions
              </a>
            ) : null}
            <ShareButton title={exhibition.title} />
          </div>
        </section>
      </div>

      {exhibition.summary ? (
        <section className="profile-section profile-about">
          <p>{exhibition.summary}</p>
        </section>
      ) : null}

      {openingNight || gallery?.address || gallery?.openingHours?.length ? (
        <section className="profile-section">
          <p className="eyebrow">Details</p>
          <dl className="def-list">
            {openingNight ? (
              <div>
                <dt>Opening</dt>
                <dd>{openingNight}</dd>
              </div>
            ) : null}
            {gallery?.address ? (
              <div>
                <dt>Address</dt>
                <dd>{gallery.address}</dd>
              </div>
            ) : null}
            {gallery?.openingHours?.length ? (
              <div>
                <dt>Hours</dt>
                <dd>
                  {gallery.openingHours.map((h) => (
                    <div key={h}>{h}</div>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {moreAtGallery.length ? (
        <section className="profile-section">
          <p className="eyebrow">More at {gallery?.name || 'this gallery'}</p>
          <RelatedGrid items={moreAtGallery} galleries={allGalleries} today={today} />
        </section>
      ) : null}

      {closingSoon.length ? (
        <section className="profile-section">
          <p className="eyebrow">Closing soon across Sydney</p>
          <RelatedGrid items={closingSoon} galleries={allGalleries} today={today} />
        </section>
      ) : null}
    </div>
  )
}
