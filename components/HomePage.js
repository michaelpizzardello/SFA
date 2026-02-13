import Link from 'next/link'
import { addDaysISO, compareISO, formatDate, todayISOInSydney } from '../lib/utils/date'
import { getGalleryBySlug } from '../lib/utils/exhibitions'

function OpeningRows({ items, galleries }) {
  if (!items.length) {
    return <p className="empty-copy">No openings listed.</p>
  }

  return (
    <ul className="simple-list">
      {items.map((exhibition) => {
        const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)

        return (
          <li key={exhibition.id} className="simple-row">
            <div>
              <p className="row-title">{exhibition.title}</p>
              <p className="row-meta">
                {gallery?.name || 'Unknown gallery'} | {gallery?.precinct || 'Unspecified precinct'}
              </p>
            </div>
            <p className="row-date">{formatDate(exhibition.openingDate || exhibition.startDate)}</p>
          </li>
        )
      })}
    </ul>
  )
}

export default function HomePage({ galleries, exhibitions }) {
  const today = todayISOInSydney()
  const weekEnd = addDaysISO(today, 7)

  const tonightOpenings = exhibitions
    .filter((exhibition) => exhibition.openingDate && compareISO(exhibition.openingDate, today) === 0)
    .slice(0, 4)

  const weekOpenings = exhibitions
    .filter(
      (exhibition) =>
        exhibition.openingDate &&
        compareISO(exhibition.openingDate, today) >= 0 &&
        compareISO(exhibition.openingDate, weekEnd) <= 0
    )
    .sort((first, second) => compareISO(first.openingDate, second.openingDate))
    .slice(0, 6)

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Sydney Art Finder</p>
        <h1>Your guide to the Sydney art scene</h1>
        <p className="hero-copy">
          Browse gallery profiles and track exhibition openings across Sydney in a clean, mobile-first guide.
        </p>
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
            <h2>Opening Tonight</h2>
            <Link className="text-link" href="/whats-on?opening=tonight">
              View all
            </Link>
          </div>
          <OpeningRows items={tonightOpenings} galleries={galleries} />
        </article>

        <article className="highlight-block">
          <div className="section-head">
            <h2>Opening This Week</h2>
            <Link className="text-link" href="/whats-on?opening=week">
              View all
            </Link>
          </div>
          <OpeningRows items={weekOpenings} galleries={galleries} />
        </article>
      </section>
    </>
  )
}
