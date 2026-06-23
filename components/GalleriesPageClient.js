'use client'

import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { filterGalleries, getGalleryDirectoryData, getPrecinctOptions } from '../lib/utils/filters'
import FilterSlidersIcon from './icons/FilterSlidersIcon'

function isInteractiveElement(target) {
  return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea, summary, label'))
}

// Deterministic warm tint for a gallery's fallback tile (cold start — galleries have no images yet).
const TILE_TINTS = ['#efe6d8', '#e9e0d2', '#f1e3da', '#e6e4d6', '#efe0db', '#e8e2d0', '#f0e7dd']

function tintStyle(name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return { backgroundColor: TILE_TINTS[hash % TILE_TINTS.length] }
}

function monogram(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '·'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export default function GalleriesPageClient({ galleries, exhibitions, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [sort, setSort] = useState(initialFilters.sort)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const filteredGalleries = useMemo(
    () => filterGalleries(galleries, { search, precinct, sort }),
    [galleries, precinct, search, sort]
  )

  const directoryRows = useMemo(
    () => getGalleryDirectoryData(filteredGalleries, exhibitions),
    [exhibitions, filteredGalleries]
  )

  const mapParams = new URLSearchParams(
    precinct !== 'all' || search.trim()
      ? {
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(precinct !== 'all' ? { precinct } : {})
        }
      : {}
  ).toString()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    if (precinct !== 'all') {
      params.set('precinct', precinct)
    } else {
      params.delete('precinct')
    }

    if (sort !== 'alphabetical') {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    }
  }, [pathname, precinct, router, search, searchParams, sort])

  function handleGalleryCardClick(gallerySlug, event) {
    if (isInteractiveElement(event.target)) {
      return
    }

    router.push(`/gallery/${encodeURIComponent(gallerySlug)}`)
  }

  function handleGalleryCardKeyDown(gallerySlug, event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    router.push(`/gallery/${encodeURIComponent(gallerySlug)}`)
  }

  return (
    <section className="page-block">
      <div className="section-head">
        <h1>Galleries</h1>
        <Link className="text-link" href={mapParams ? `/map?${mapParams}` : '/map'}>
          Open map view
        </Link>
      </div>

      <div className="compact-control-row">
        <label className="field">
          <span className="visually-hidden">Search galleries</span>
          <input
            type="search"
            placeholder="Search galleries"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="button button-secondary icon-button filter-icon-button"
          aria-label="Open filters"
          onClick={() => setFiltersOpen(true)}
        >
          <FilterSlidersIcon />
          <span className="visually-hidden">Filters</span>
        </button>
      </div>

      {filtersOpen ? (
        <div className="filter-sheet-overlay" role="presentation" onClick={() => setFiltersOpen(false)}>
          <section
            className="filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Gallery filters"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="filter-sheet-head">
              <h2>Filters</h2>
              <button type="button" className="text-link text-link-button" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <div className="filter-sheet-body">
              <div className="filter-bar filter-bar-two" role="group" aria-label="Gallery filters">
                <label className="field">
                  <span>Precinct</span>
                  <select value={precinct} onChange={(event) => setPrecinct(event.target.value)}>
                    <option value="all">All precincts</option>
                    {precinctOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Sort</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="alphabetical">A-Z</option>
                    <option value="precinct">By precinct</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {directoryRows.length ? (
        <>
          <p className="results-meta">{directoryRows.length} galleries</p>
          <ul className="gallery-grid">
            {directoryRows.map(({ gallery, summary }) => {
              const image = gallery.coverUrl || gallery.logoUrl
              const currentCount = summary?.current || 0
              return (
                <li
                  key={gallery.id}
                  className="gallery-card clickable-card"
                  tabIndex={0}
                  role="link"
                  aria-label={`Open gallery profile for ${gallery.name}`}
                  onClick={(event) => handleGalleryCardClick(gallery.slug, event)}
                  onKeyDown={(event) => handleGalleryCardKeyDown(gallery.slug, event)}
                >
                  <div className="gallery-card-media" style={tintStyle(gallery.name)}>
                    {image ? (
                      <img className="gallery-card-image" src={image} alt="" loading="lazy" />
                    ) : (
                      <span className="gallery-card-monogram" aria-hidden="true">
                        {monogram(gallery.name)}
                      </span>
                    )}
                    {currentCount ? <span className="gallery-card-flag">{currentCount} on now</span> : null}
                  </div>
                  <div className="gallery-card-body">
                    <p className="item-kicker">{gallery.precinct}</p>
                    <h2 className="gallery-card-title">{gallery.name}</h2>
                    {gallery.address ? <p className="item-meta">{gallery.address}</p> : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="empty-copy">No galleries match these filters.</p>
      )}
    </section>
  )
}
