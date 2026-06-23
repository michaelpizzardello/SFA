'use client'

import Link from 'next/link'
import { compareISO, todayISOInSydney } from '../lib/utils/date'
import { getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import ExhibitionCard from './ExhibitionCard'

function Grid({ rows }) {
  return (
    <div className="ex-grid">
      {rows.map(({ exhibition, gallery, status }) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} gallery={gallery} status={status} />
      ))}
    </div>
  )
}

export default function HomePage({ galleries, exhibitions }) {
  const today = todayISOInSydney()

  const withMeta = exhibitions.map((exhibition) => ({
    exhibition,
    gallery: getGalleryBySlug(galleries, exhibition.gallerySlug),
    status: getExhibitionStatus(exhibition, today)
  }))

  const current = withMeta
    .filter((row) => row.status === 'current')
    .sort((a, b) => compareISO(b.exhibition.startDate, a.exhibition.startDate))
  const upcoming = withMeta
    .filter((row) => row.status === 'upcoming')
    .sort((a, b) => compareISO(a.exhibition.startDate, b.exhibition.startDate))

  const galleryCount = galleries.length

  return (
    <>
      <section className="home-hero">
        <p className="eyebrow">Sydney Art Finder</p>
        <h1>Your guide to the Sydney art scene</h1>
        <p className="home-hero-sub">
          {current.length
            ? `${current.length} exhibitions on now across ${galleryCount} galleries.`
            : `Discover exhibitions across ${galleryCount} Sydney galleries.`}
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/whats-on">
            Explore What&apos;s On
          </Link>
          <Link className="button button-secondary" href="/galleries">
            Browse Galleries
          </Link>
        </div>
      </section>

      {current.length ? (
        <section className="home-section">
          <div className="section-head">
            <h2>On now</h2>
            <Link className="text-link" href="/whats-on">
              See all
            </Link>
          </div>
          <Grid rows={current.slice(0, 8)} />
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="home-section">
          <div className="section-head">
            <h2>Opening soon</h2>
            <Link className="text-link" href="/whats-on?status=upcoming">
              See all
            </Link>
          </div>
          <Grid rows={upcoming.slice(0, 8)} />
        </section>
      ) : null}
    </>
  )
}
