'use client'

import Link from 'next/link'
import { compareISO, formatDate, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import ExhibitionCard from './ExhibitionCard'
import GalleryCard from './GalleryCard'
import HeroBanner from './HeroBanner'

const imageFirst = (a, b) => Number(Boolean(b.exhibition.imageUrl)) - Number(Boolean(a.exhibition.imageUrl))

export default function HomePage({ galleries, exhibitions }) {
  const today = todayISOInSydney()

  const withMeta = exhibitions.map((exhibition) => ({
    exhibition,
    gallery: getGalleryBySlug(galleries, exhibition.gallerySlug),
    status: getExhibitionStatus(exhibition, today)
  }))

  const current = withMeta
    .filter((r) => r.status === 'current')
    .sort((a, b) => imageFirst(a, b) || compareISO(b.exhibition.startDate, a.exhibition.startDate))
  const upcoming = withMeta
    .filter((r) => r.status === 'upcoming')
    .sort((a, b) => compareISO(a.exhibition.startDate, b.exhibition.startDate))

  const featured = current.filter((r) => r.exhibition.imageUrl).slice(0, 6)

  const currentBySlug = new Set(current.map((r) => r.exhibition.gallerySlug))
  const galleryCards = [...galleries]
    .sort((a, b) => Number(currentBySlug.has(b.slug)) - Number(currentBySlug.has(a.slug)))
    .slice(0, 8)

  return (
    <>
      {featured.length ? <HeroBanner slides={featured} /> : null}
      <div className="container">
        {featured.length ? (
          <section className="home-intro">
            <p className="eyebrow">On in Sydney</p>
            <p className="meta hero__count">
              {galleries.length} galleries · {exhibitions.length} exhibitions ·{' '}
              <Link className="text-link" href="/whats-on">
                Browse all →
              </Link>
            </p>
          </section>
        ) : (
          <section className="hero">
            <p className="eyebrow">On in Sydney</p>
            <h1 className="hero__statement">Every exhibition on in Sydney.</h1>
            <p className="meta hero__count">
              {galleries.length} galleries · {exhibitions.length} exhibitions
            </p>
            <div className="hero__actions">
              <Link className="link-arrow" href="/whats-on">
                Browse what&apos;s on →
              </Link>
              <Link className="link-arrow" href="/galleries">
                All galleries →
              </Link>
            </div>
          </section>
        )}

      {current.length ? (
        <section className="section">
          <header className="section-head">
            <div>
              <p className="eyebrow">Now</p>
              <h2>On now</h2>
            </div>
            <Link className="link-arrow" href="/whats-on">
              All exhibitions →
            </Link>
          </header>
          <div className="card-grid">
            {current.slice(0, 8).map(({ exhibition, gallery, status }) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} gallery={gallery} status={status} />
            ))}
          </div>
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="section">
          <header className="section-head">
            <div>
              <p className="eyebrow">Soon</p>
              <h2>Opening soon</h2>
            </div>
            <Link className="link-arrow" href="/whats-on?status=upcoming">
              All →
            </Link>
          </header>
          <ul className="opening-list">
            {upcoming.slice(0, 8).map(({ exhibition, gallery }) => (
              <li key={exhibition.id}>
                <Link className="opening-row" href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}>
                  <span className="opening-row__date">{formatDate(exhibition.startDate)}</span>
                  <span>
                    <span className="opening-row__title">{exhibition.title}</span>
                    <br />
                    <span className="opening-row__gallery">{gallery?.name || exhibition.galleryName}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section">
        <header className="section-head">
          <div>
            <p className="eyebrow">Directory</p>
            <h2>Galleries</h2>
          </div>
          <Link className="link-arrow" href="/galleries">
            All galleries →
          </Link>
        </header>
        <div className="card-grid">
          {galleryCards.map((gallery) => (
            <GalleryCard key={gallery.id} gallery={gallery} />
          ))}
        </div>
      </section>
      </div>
    </>
  )
}
