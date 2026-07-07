'use client'

import Link from 'next/link'
import { compareISO, formatDate, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import { DEFAULT_WINDOW, TIME_WINDOWS, matchesWindow } from '../lib/utils/windows'
import ExhibitionCard from './ExhibitionCard'
import GalleryCard from './GalleryCard'
import HeroBanner from './HeroBanner'

const imageFirst = (a, b) => Number(Boolean(b.exhibition.imageUrl)) - Number(Boolean(a.exhibition.imageUrl))

function windowHref(slug) {
  return slug === DEFAULT_WINDOW ? '/whats-on' : `/whats-on?when=${slug}`
}

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

  // Live count per window — turns the quick-nav into a digest of the city, and teaches the IA.
  const windowCounts = Object.fromEntries(
    TIME_WINDOWS.map((w) => [w.slug, exhibitions.filter((e) => matchesWindow(e, w.slug, today)).length])
  )

  const closingSoon = current
    .filter((r) => matchesWindow(r.exhibition, 'closing-soon', today))
    .sort((a, b) => compareISO(a.exhibition.endDate, b.exhibition.endDate))
    .slice(0, 8)

  const openingThisWeek = upcoming.filter((r) => matchesWindow(r.exhibition, 'opening-this-week', today))
  const openingRows = (openingThisWeek.length ? openingThisWeek : upcoming).slice(0, 8)
  const openingTitle = openingThisWeek.length ? 'Opening this week' : 'Opening soon'
  // Fallback rows are generic upcoming shows, so the fallback link goes to the full listing —
  // never the (empty) opening-this-week window (DESIGN_SPEC §5.1.5).
  const openingHref = openingThisWeek.length ? windowHref('opening-this-week') : '/whats-on'

  const currentBySlug = new Set(current.map((r) => r.exhibition.gallerySlug))
  const galleryCards = [...galleries]
    .sort((a, b) => Number(currentBySlug.has(b.slug)) - Number(currentBySlug.has(a.slug)))
    .slice(0, 8)

  return (
    <>
      {featured.length ? <HeroBanner slides={featured} /> : null}
      <div className="container">
        {!featured.length ? (
          <section className="home-fallback">
            <p className="u-eyebrow">On in Sydney</p>
            <h1 className="home-fallback__statement">Every exhibition on in Sydney.</h1>
          </section>
        ) : null}

        {/* TIME SPINE — the structural hinge: four named windows, each a live count of the city */}
        <nav className="stat-row home-windows" aria-label="Browse by when">
          {TIME_WINDOWS.map((w) => (
            <Link key={w.slug} className="stat-cell" href={windowHref(w.slug)}>
              <span className="stat-cell__count">{windowCounts[w.slug]}</span>
              <span className="stat-cell__label">{w.label}</span>
            </Link>
          ))}
        </nav>

        {current.length ? (
          <section className="section">
            <header className="section-head">
              <h2>On now</h2>
              <Link className="link-arrow" href={windowHref('on-now')}>
                See all on now →
              </Link>
            </header>
            <div className="card-grid">
              {current.slice(0, 8).map(({ exhibition, gallery, status }) => (
                <ExhibitionCard key={exhibition.id} exhibition={exhibition} gallery={gallery} status={status} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {closingSoon.length ? (
        <div className="band home-alt">
          <div className="container">
            <section className="section">
              <header className="section-head">
                <h2>Closing soon</h2>
                <Link className="link-arrow" href={windowHref('closing-soon')}>
                  See all closing soon →
                </Link>
              </header>
              <div className="card-grid">
                {closingSoon.map(({ exhibition, gallery, status }) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} gallery={gallery} status={status} />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {openingRows.length ? (
        <div className="container">
          <section className="section">
            <header className="section-head">
              <h2>{openingTitle}</h2>
              <Link className="link-arrow" href={openingHref}>
                All →
              </Link>
            </header>
            <ul className="home-opening">
              {openingRows.map(({ exhibition, gallery }) => (
                <li key={exhibition.id}>
                  <Link className="home-opening__row" href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}>
                    <span className="home-opening__date">{formatDate(exhibition.startDate)}</span>
                    <span>
                      <span className="home-opening__title">{exhibition.title}</span>
                      <br />
                      <span className="home-opening__gallery">{gallery?.name || exhibition.galleryName}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {galleryCards.length ? (
        <div className="band home-alt">
          <div className="container">
            <section className="section">
              <header className="section-head">
                <h2>Galleries</h2>
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
        </div>
      ) : null}
    </>
  )
}
