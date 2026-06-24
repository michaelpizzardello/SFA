'use client'

import Link from 'next/link'
import { compareISO, formatDate, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import ExhibitionCard from './ExhibitionCard'
import GalleryCard from './GalleryCard'

export default function HomePage({ galleries, exhibitions }) {
  const today = todayISOInSydney()

  const withMeta = exhibitions.map((exhibition) => ({
    exhibition,
    gallery: getGalleryBySlug(galleries, exhibition.gallerySlug),
    status: getExhibitionStatus(exhibition, today)
  }))

  const current = withMeta
    .filter((r) => r.status === 'current')
    .sort((a, b) => compareISO(b.exhibition.startDate, a.exhibition.startDate))
  const upcoming = withMeta
    .filter((r) => r.status === 'upcoming')
    .sort((a, b) => compareISO(a.exhibition.startDate, b.exhibition.startDate))

  // galleries with a current show first
  const currentBySlug = new Set(current.map((r) => r.exhibition.gallerySlug))
  const galleryCards = [...galleries]
    .sort((a, b) => Number(currentBySlug.has(b.slug)) - Number(currentBySlug.has(a.slug)))
    .slice(0, 8)

  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">On in Sydney</p>
        <h1 className="hero__statement">Every exhibition worth seeing in Sydney.</h1>
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

      <div className="home-band">
        <section>
          <header className="section-head">
            <div>
              <p className="eyebrow">Now</p>
              <h2>On now</h2>
            </div>
            <Link className="link-arrow" href="/whats-on">
              All →
            </Link>
          </header>
          {current.length ? (
            <ul className="index-list">
              {current.slice(0, 7).map(({ exhibition, gallery, status }) => (
                <li key={exhibition.id}>
                  <ExhibitionCard exhibition={exhibition} gallery={gallery} status={status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Nothing on right now.</p>
          )}
        </section>

        <section>
          <header className="section-head">
            <div>
              <p className="eyebrow">Soon</p>
              <h2>Opening soon</h2>
            </div>
            <Link className="link-arrow" href="/whats-on?status=upcoming">
              All →
            </Link>
          </header>
          {upcoming.length ? (
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
          ) : (
            <p className="empty-state">No openings listed.</p>
          )}
        </section>
      </div>

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
  )
}
