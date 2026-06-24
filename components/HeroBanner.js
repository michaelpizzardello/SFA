'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'

// Auto-rotating featured-exhibition banner (Ocula-style). Slides = [{exhibition, gallery}] with images.
export default function HeroBanner({ slides }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  useEffect(() => {
    if (count <= 1 || paused) return undefined
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }
    const timer = setInterval(() => setIndex((p) => (p + 1) % count), 5500)
    return () => clearInterval(timer)
  }, [count, paused])

  if (!count) return null
  const safeIndex = index % count

  return (
    <section
      className="hero-banner"
      aria-roledescription="carousel"
      aria-label="Featured exhibitions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map(({ exhibition, gallery }, idx) => {
        const active = idx === safeIndex
        return (
          <Link
            key={exhibition.id}
            href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}
            className={`hero-slide${active ? ' is-active' : ''}`}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
          >
            <img className="hero-slide__img" src={exhibition.imageUrl} alt="" />
            <span className="hero-slide__scrim" aria-hidden="true" />
            <span className="hero-slide__body">
              <span className="hero-slide__eyebrow">On now · Featured</span>
              <span className="hero-slide__title">{exhibition.title}</span>
              <span className="hero-slide__meta">
                {(gallery?.name || exhibition.galleryName) + ' · ' + formatDateRange(exhibition.startDate, exhibition.endDate)}
              </span>
            </span>
          </Link>
        )
      })}

      {count > 1 ? (
        <div className="hero-dots" role="tablist" aria-label="Choose featured exhibition">
          {slides.map((s, idx) => (
            <button
              key={s.exhibition.id}
              type="button"
              role="tab"
              aria-selected={idx === safeIndex}
              aria-label={`Show featured exhibition ${idx + 1} of ${count}`}
              className={`hero-dot${idx === safeIndex ? ' is-active' : ''}`}
              onClick={() => setIndex(idx)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
