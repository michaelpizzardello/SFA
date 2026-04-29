'use client'

import Link from 'next/link'
import { addDaysISO, compareISO, formatDate, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getGalleryBySlug } from '../lib/utils/exhibitions'
import MasonryList from './MasonryList'

function OpeningRows({ items, galleries }) {
  if (!items.length) {
    return <p className="empty-copy">No openings listed.</p>
  }

  return (
    <MasonryList
      items={items}
      className="simple-list home-opening-list masonry-grid"
      columnClassName="masonry-column"
      renderItem={(exhibition) => {
        const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
        const galleryName = gallery?.name || exhibition.galleryName || 'Unknown gallery'
        const galleryLocation = exhibition.location || gallery?.suburb || gallery?.precinct || 'Unspecified precinct'
        const exhibitionHref = `/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`

        return (
          <li key={exhibition.id} className={`simple-row home-opening-card${exhibition.imageUrl ? ' has-image' : ''}`}>
            <div className="simple-row-main">
              {exhibition.imageUrl ? (
                <Link
                  className="row-thumbnail"
                  href={exhibitionHref}
                  aria-label={`View ${exhibition.title}`}
                >
                  <img src={exhibition.imageUrl} alt="" />
                </Link>
              ) : null}
              <div>
                <p className="row-title">
                  <Link className="text-link" href={exhibitionHref}>
                    {exhibition.title}
                  </Link>
                </p>
                <p className="row-meta">
                  <span className="row-gallery-name">{galleryName}</span>
                  <span className="row-gallery-location">{galleryLocation}</span>
                </p>
                <p className="row-date">
                  {exhibition.openingInformation || formatDate(exhibition.openingDate || exhibition.startDate)}
                </p>
              </div>
            </div>
          </li>
        )
      }}
    />
  )
}

export default function HomePage({ galleries, exhibitions }) {
  const today = todayISOInSydney()
  const weekEnd = addDaysISO(today, 7)

  const todayOpenings = exhibitions
    .filter((exhibition) => exhibition.openingDate && compareISO(exhibition.openingDate, today) === 0)
    .slice(0, 4)

  const weekOpenings = exhibitions
    .filter(
      (exhibition) =>
        exhibition.openingDate &&
        compareISO(exhibition.openingDate, today) > 0 &&
        compareISO(exhibition.openingDate, weekEnd) <= 0
    )
    .sort((first, second) => compareISO(first.openingDate, second.openingDate))
    .slice(0, 6)

  return (
    <>
      <section className="hero">
        <h1>Your guide to the Sydney art scene</h1>
        <div className="hero-actions">
          <Link className="button button-primary" href="/whats-on">
            Explore What's On
          </Link>
          <Link className="button button-secondary" href="/galleries">
            Browse Galleries
          </Link>
        </div>
      </section>

      <section className="highlights-grid" aria-label="Opening highlights">
        <article className="highlight-block">
          <div className="section-head">
            <h2>Opening Today</h2>
          </div>
          <OpeningRows items={todayOpenings} galleries={galleries} />
        </article>

        <article className="highlight-block">
          <div className="section-head">
            <h2>Opening This Week</h2>
          </div>
          <OpeningRows items={weekOpenings} galleries={galleries} />
        </article>
      </section>
    </>
  )
}
