'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'
import { splitTitle } from '../lib/utils/splitTitle'

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

  const touchStartX = useRef(null)
  const go = (dir) => setIndex((p) => (p + dir + count) % count)
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e) {
    if (touchStartX.current == null || count <= 1) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }

  if (!count) return null
  const safeIndex = index % count

  return (
    <section
      className="home-hero"
      aria-roledescription="carousel"
      aria-label="Featured exhibitions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map(({ exhibition, gallery }, idx) => {
        const active = idx === safeIndex
        const { artist, title } = splitTitle(exhibition.artist, exhibition.title)
        return (
          <Link
            key={exhibition.id}
            href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}
            className={`home-hero__slide${active ? ' is-active' : ''}`}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
          >
            <img className="home-hero__img" src={exhibition.imageUrl} alt="" />
            <span className="home-hero__scrim" aria-hidden="true" />
            <span className="home-hero__body">
              <span className="home-hero__eyebrow">On now</span>
              {artist ? <span className="home-hero__artist">{artist}</span> : null}
              <span className={`home-hero__title${artist ? '' : ' home-hero__title--solo'}`}>{title}</span>
              <span className="home-hero__meta">
                {(gallery?.name || exhibition.galleryName) + ' · ' + formatDateRange(exhibition.startDate, exhibition.endDate)}
              </span>
            </span>
          </Link>
        )
      })}

      {count > 1 ? (
        <div className="home-hero__dots" role="tablist" aria-label="Choose featured exhibition">
          {slides.map((s, idx) => (
            <button
              key={s.exhibition.id}
              type="button"
              role="tab"
              aria-selected={idx === safeIndex}
              aria-label={`Show featured exhibition ${idx + 1} of ${count}`}
              className={`home-hero__dot${idx === safeIndex ? ' is-active' : ''}`}
              onClick={() => setIndex(idx)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
