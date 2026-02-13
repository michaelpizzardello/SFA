'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { filterExhibitions, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'

const statusLabels = {
  current: 'Current',
  upcoming: 'Upcoming',
  past: 'Past'
}

function mapToWindowMode(statusFilter, openingFilter) {
  if (openingFilter === 'tonight') {
    return 'tonight'
  }

  if (openingFilter === 'week') {
    return 'week'
  }

  return statusFilter === 'all' ? 'all' : 'current-upcoming'
}

function getViewMode(statusFilter, openingFilter) {
  if (openingFilter === 'tonight') {
    return 'opening-tonight'
  }

  if (openingFilter === 'week') {
    return 'opening-week'
  }

  return statusFilter === 'all' ? 'all' : 'current-upcoming'
}

export default function WhatsOnPageClient({ galleries, exhibitions, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [statusFilter, setStatusFilter] = useState(initialFilters.status)
  const [openingFilter, setOpeningFilter] = useState(initialFilters.opening)
  const [selectedGalleries, setSelectedGalleries] = useState(new Set(initialFilters.selectedGalleries))

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const sortedGalleries = useMemo(
    () => [...galleries].sort((first, second) => first.name.localeCompare(second.name)),
    [galleries]
  )

  const windowMode = mapToWindowMode(statusFilter, openingFilter)
  const viewMode = getViewMode(statusFilter, openingFilter)

  const filteredExhibitions = useMemo(
    () =>
      filterExhibitions(galleries, exhibitions, {
        search,
        precinct,
        openingWindow: windowMode,
        selectedGallerySlugs: [...selectedGalleries]
      }),
    [exhibitions, galleries, openingFilter, precinct, search, selectedGalleries, statusFilter, windowMode]
  )

  const activeFilters = useMemo(() => {
    const filters = []

    if (viewMode === 'current-upcoming') {
      filters.push('Date window: Current + upcoming')
    }

    if (viewMode === 'all') {
      filters.push('Date window: All dates')
    }

    if (viewMode === 'opening-tonight') {
      filters.push('Date window: Opening tonight')
    }

    if (viewMode === 'opening-week') {
      filters.push('Date window: Opening this week')
    }

    if (precinct !== 'all') {
      filters.push(`Precinct: ${precinct}`)
    }

    if (search.trim()) {
      filters.push(`Search: ${search.trim()}`)
    }

    if (selectedGalleries.size > 0) {
      filters.push(`Galleries: ${selectedGalleries.size}`)
    }

    return filters
  }, [precinct, search, selectedGalleries, viewMode])

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

    if (statusFilter !== 'current-upcoming') {
      params.set('status', statusFilter)
    } else {
      params.delete('status')
    }

    if (openingFilter !== 'any') {
      params.set('opening', openingFilter)
    } else {
      params.delete('opening')
    }

    if (selectedGalleries.size > 0) {
      params.set('galleries', [...selectedGalleries].join(','))
    } else {
      params.delete('galleries')
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    }
  }, [openingFilter, pathname, precinct, router, search, searchParams, selectedGalleries, statusFilter])

  function toggleGallery(gallerySlug) {
    setSelectedGalleries((current) => {
      const next = new Set(current)

      if (next.has(gallerySlug)) {
        next.delete(gallerySlug)
      } else {
        next.add(gallerySlug)
      }

      return next
    })
  }

  function handleViewModeChange(nextViewMode) {
    if (nextViewMode === 'all') {
      setStatusFilter('all')
      setOpeningFilter('any')
      return
    }

    if (nextViewMode === 'opening-tonight') {
      setStatusFilter('current-upcoming')
      setOpeningFilter('tonight')
      return
    }

    if (nextViewMode === 'opening-week') {
      setStatusFilter('current-upcoming')
      setOpeningFilter('week')
      return
    }

    setStatusFilter('current-upcoming')
    setOpeningFilter('any')
  }

  function resetAdvancedFilters() {
    setSelectedGalleries(new Set())
  }

  return (
    <section className="page-block">
      <div className="section-head">
        <h1>What's On</h1>
      </div>
      <p className="section-copy">Current and upcoming exhibitions across Sydney galleries.</p>

      <div className="filter-bar filter-bar-three" role="group" aria-label="Exhibition filters">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Exhibition, artist, gallery"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Date window</span>
          <select value={viewMode} onChange={(event) => handleViewModeChange(event.target.value)}>
            <option value="current-upcoming">Current + upcoming</option>
            <option value="all">All dates</option>
            <option value="opening-tonight">Opening tonight</option>
            <option value="opening-week">Opening this week</option>
          </select>
        </label>

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
      </div>

      <details className="whats-on-advanced">
        <summary>Advanced gallery filters</summary>
        <div className="whats-on-advanced-panel">
          <label className="field">
            <span>Galleries</span>
            <select
              value=""
              onChange={(event) => {
                if (!event.target.value) {
                  return
                }

                toggleGallery(event.target.value)
                event.target.value = ''
              }}
            >
              <option value="">Add gallery filter</option>
              {sortedGalleries.map((gallery) => (
                <option key={gallery.id} value={gallery.slug}>
                  {gallery.name}
                </option>
              ))}
            </select>
          </label>

          <div className="active-filters" aria-label="Selected galleries">
            {[...selectedGalleries].map((slug) => {
              const matchedGallery = galleries.find((gallery) => gallery.slug === slug)

              if (!matchedGallery) {
                return null
              }

              return (
                <button
                  key={slug}
                  type="button"
                  className="filter-pill is-removable"
                  onClick={() => toggleGallery(slug)}
                >
                  Remove {matchedGallery.name}
                </button>
              )
            })}
          </div>

          <button type="button" className="button button-secondary" onClick={resetAdvancedFilters}>
            Clear gallery filters
          </button>
        </div>
      </details>

      <div className="active-filters" aria-label="Applied filters">
        {activeFilters.map((filter) => (
          <span key={filter} className="filter-pill">
            {filter}
          </span>
        ))}
      </div>

      <p className="results-meta">
        {filteredExhibitions.length} {filteredExhibitions.length === 1 ? 'exhibition' : 'exhibitions'} shown
      </p>

      {filteredExhibitions.length ? (
        <ul className="exhibition-list">
          {filteredExhibitions.map((exhibition) => {
            const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
            const status = getExhibitionStatus(exhibition)

            return (
              <li key={exhibition.id} className="exhibition-item">
                <div className="item-head">
                  <h2 className="item-title">{exhibition.title}</h2>
                  <span className={`status-tag status-${status}`}>{statusLabels[status]}</span>
                </div>
                <p className="item-meta">{exhibition.artist}</p>
                <p className="item-meta">
                  {gallery?.name || 'Unknown gallery'} | {gallery?.precinct || 'Unspecified precinct'}
                </p>
                <p className="item-copy">{exhibition.summary || 'Details coming soon.'}</p>
                <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                {exhibition.openingDate ? (
                  <p className="item-meta">
                    Opening: {formatDate(exhibition.openingDate)}
                    {exhibition.openingTime ? ` | ${exhibition.openingTime}` : ''}
                  </p>
                ) : null}
                <div className="item-actions">
                  <Link className="text-link" href={`/gallery/${encodeURIComponent(exhibition.gallerySlug)}`}>
                    Gallery profile
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="empty-copy">No exhibitions match these filters.</p>
      )}
    </section>
  )
}
