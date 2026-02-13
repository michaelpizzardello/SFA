'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { filterExhibitions, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'

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
  const [filtersOpen, setFiltersOpen] = useState(false)

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

    if (viewMode === 'all') {
      filters.push({
        key: 'viewMode',
        label: 'Date: All dates'
      })
    }

    if (viewMode === 'opening-tonight') {
      filters.push({
        key: 'viewMode',
        label: 'Date: Opening tonight'
      })
    }

    if (viewMode === 'opening-week') {
      filters.push({
        key: 'viewMode',
        label: 'Date: Opening this week'
      })
    }

    if (precinct !== 'all') {
      filters.push({
        key: 'precinct',
        label: `Precinct: ${precinct}`
      })
    }

    if (search.trim()) {
      filters.push({
        key: 'search',
        label: `Search: ${search.trim()}`
      })
    }

    if (selectedGalleries.size > 0) {
      filters.push({
        key: 'galleries',
        label: `Galleries: ${selectedGalleries.size}`
      })
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

  function clearAllFilters() {
    setSearch('')
    setPrecinct('all')
    setStatusFilter('current-upcoming')
    setOpeningFilter('any')
    setSelectedGalleries(new Set())
  }

  function clearAppliedFilter(filterKey) {
    if (filterKey === 'search') {
      setSearch('')
      return
    }

    if (filterKey === 'precinct') {
      setPrecinct('all')
      return
    }

    if (filterKey === 'viewMode') {
      setStatusFilter('current-upcoming')
      setOpeningFilter('any')
      return
    }

    if (filterKey === 'galleries') {
      setSelectedGalleries(new Set())
    }
  }

  return (
    <section className="page-block">
      <div className="section-head">
        <h1>What's On</h1>
      </div>
      <p className="section-copy">Current and upcoming exhibitions across Sydney galleries.</p>

      <div className="whats-on-control-row">
        <label className="field">
          <span className="visually-hidden">Search exhibitions</span>
          <input
            type="search"
            placeholder="Search exhibitions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="button button-secondary button-utility icon-button filter-icon-button"
          aria-label="Open filters"
          onClick={() => setFiltersOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M3 6v2h10V6H3zm0 10v2h6v-2H3zm10 0v2h8v-2h-8zm-4-5v2h12v-2H9zm8-5v2h4V6h-4z"
              fill="currentColor"
            />
          </svg>
          <span className="visually-hidden">Filters</span>
        </button>
      </div>

      <div className="segmented-control" role="group" aria-label="Date window quick filters">
        <button
          type="button"
          className={viewMode === 'current-upcoming' ? 'is-active' : ''}
          onClick={() => handleViewModeChange('current-upcoming')}
        >
          Current + upcoming
        </button>
        <button
          type="button"
          className={viewMode === 'all' ? 'is-active' : ''}
          onClick={() => handleViewModeChange('all')}
        >
          All dates
        </button>
        <button
          type="button"
          className={viewMode === 'opening-tonight' ? 'is-active' : ''}
          onClick={() => handleViewModeChange('opening-tonight')}
        >
          Tonight
        </button>
        <button
          type="button"
          className={viewMode === 'opening-week' ? 'is-active' : ''}
          onClick={() => handleViewModeChange('opening-week')}
        >
          This week
        </button>
      </div>

      {filtersOpen ? (
        <div className="filter-sheet-overlay" role="presentation" onClick={() => setFiltersOpen(false)}>
          <section
            className="filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Exhibition filters"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="filter-sheet-head">
              <h2>Filters</h2>
              <button type="button" className="text-link text-link-button" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <div className="filter-sheet-body">
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

              <button type="button" className="button button-secondary" onClick={clearAllFilters}>
                Clear all filters
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="results-status-block">
        {activeFilters.length ? (
          <div className="active-filters" aria-label="Applied filters">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="filter-pill is-removable"
                onClick={() => clearAppliedFilter(filter.key)}
              >
                {filter.label} ×
              </button>
            ))}
          </div>
        ) : null}

        <p className="results-meta">
          {filteredExhibitions.length} {filteredExhibitions.length === 1 ? 'exhibition' : 'exhibitions'}
        </p>
      </div>

      {filteredExhibitions.length ? (
        <ul className="exhibition-list exhibition-list-compact">
          {filteredExhibitions.map((exhibition) => {
            const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
            const status = getExhibitionStatus(exhibition)

            return (
              <li key={exhibition.id} className="exhibition-item">
                <div className="item-head">
                  <h2 className="item-title">{exhibition.title}</h2>
                  <span className={`status-tag status-${status}`}>{statusLabels[status]}</span>
                </div>
                <p className="item-artist">{exhibition.artist}</p>
                <p className="item-meta">
                  {gallery?.name || 'Unknown gallery'} | {gallery?.precinct || 'Unspecified precinct'}
                </p>
                <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                {exhibition.openingDate ? (
                  <p className="item-meta">
                    Opening: {formatDate(exhibition.openingDate)}
                    {exhibition.openingTime ? ` | ${exhibition.openingTime}` : ''}
                  </p>
                ) : null}
                <div className="item-actions">
                  <Link
                    className="text-link"
                    href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}
                  >
                    View details
                  </Link>
                  <Link
                    className="text-link text-link-secondary"
                    href={`/gallery/${encodeURIComponent(exhibition.gallerySlug)}`}
                  >
                    Gallery
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
