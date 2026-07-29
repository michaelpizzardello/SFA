'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'
import { splitTitle } from '../lib/utils/splitTitle'

// Auto-rotating featured-exhibition banner (Ocula-style). Slides = [{exhibition, gallery}] with images.
export default function HeroBanner({ slides }) {
  const [index, setIndex] = useState(0)
  const [rotationEnabled, setRotationEnabled] = useState(true)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [loadedIndices, setLoadedIndices] = useState(() => new Set([0]))
  const failedIndicesRef = useRef(new Set())
  const slideRequestRef = useRef(0)
  const count = slides.length

  function showSlide(nextIndex) {
    let safeNextIndex = ((nextIndex % count) + count) % count
    for (let offset = 0; offset < count; offset += 1) {
      const candidate = (safeNextIndex + offset) % count
      if (!failedIndicesRef.current.has(candidate)) {
        safeNextIndex = candidate
        break
      }
    }

    if (failedIndicesRef.current.size >= count) return

    const requestId = slideRequestRef.current + 1
    slideRequestRef.current = requestId
    if (loadedIndices.has(safeNextIndex)) {
      setIndex(safeNextIndex)
      return
    }

    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      setLoadedIndices((current) => new Set(current).add(safeNextIndex))
      if (slideRequestRef.current === requestId) setIndex(safeNextIndex)
    }
    image.onerror = () => {
      failedIndicesRef.current.add(safeNextIndex)
      if (slideRequestRef.current === requestId) showSlide(safeNextIndex + 1)
    }
    image.src = slides[safeNextIndex].exhibition.imageUrl
  }

  useEffect(() => {
    if (count <= 1 || !rotationEnabled || hoverPaused) return undefined
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }
    const timer = setInterval(() => showSlide(index + 1), 5500)
    return () => clearInterval(timer)
  }, [count, hoverPaused, index, loadedIndices, rotationEnabled])

  const touchStartX = useRef(null)
  const go = (dir) => showSlide(index + dir)
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
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setRotationEnabled(false)}
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
            {loadedIndices.has(idx) ? (
              <img
                className="home-hero__img"
                src={exhibition.imageUrl}
                alt=""
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
            ) : null}
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
        <div className="home-hero__controls">
          <button
            type="button"
            className="home-hero__rotation"
            aria-label={rotationEnabled ? 'Pause featured exhibitions' : 'Play featured exhibitions'}
            onClick={() => setRotationEnabled((enabled) => !enabled)}
          >
            {rotationEnabled ? 'Pause' : 'Play'}
          </button>
          <div className="home-hero__dots" role="group" aria-label="Choose featured exhibition">
            {slides.map((s, idx) => (
              <button
                key={s.exhibition.id}
                type="button"
                aria-pressed={idx === safeIndex}
                aria-label={`Show featured exhibition ${idx + 1} of ${count}`}
                className={`home-hero__dot${idx === safeIndex ? ' is-active' : ''}`}
                onClick={() => showSlide(idx)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
