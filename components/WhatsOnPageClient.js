'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formatDate, formatDateRange } from '../lib/utils/date'
import { filterExhibitions, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import FilterSlidersIcon from './icons/FilterSlidersIcon'

const statusLabels = {
  current: 'Current',
  upcoming: 'Upcoming',
  past: 'Past'
}

const statusFilterOptions = [
  { value: 'current', label: 'Current' },
  { value: 'upcoming', label: 'Upcoming' }
]

const openingFilterOptions = [
  { value: 'tonight', label: 'Opening today' },
  { value: 'week', label: 'Opening this week' }
]

const defaultStatusFilters = ['current', 'upcoming']

function normalizeStatusSelection(values) {
  const normalized = statusFilterOptions
    .map((option) => option.value)
    .filter((value) => values.includes(value))

  return normalized.length ? normalized : [...defaultStatusFilters]
}

function normalizeOpeningSelection(values) {
  return openingFilterOptions
    .map((option) => option.value)
    .filter((value) => values.includes(value))
}

function isDefaultStatusSelection(values) {
  return values.length === defaultStatusFilters.length && defaultStatusFilters.every((value) => values.includes(value))
}

function isInteractiveElement(target) {
  return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea, summary, label'))
}

export default function WhatsOnPageClient({ galleries, exhibitions, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [selectedStatuses, setSelectedStatuses] = useState(
    () => new Set(normalizeStatusSelection(initialFilters.statuses || []))
  )
  const [selectedOpeningWindows, setSelectedOpeningWindows] = useState(
    () => new Set(normalizeOpeningSelection(initialFilters.openingWindows || []))
  )
  const [filtersOpen, setFiltersOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const orderedStatuses = useMemo(
    () => normalizeStatusSelection([...selectedStatuses]),
    [selectedStatuses]
  )

  const orderedOpeningWindows = useMemo(
    () => normalizeOpeningSelection([...selectedOpeningWindows]),
    [selectedOpeningWindows]
  )

  const filteredExhibitions = useMemo(
    () =>
      filterExhibitions(galleries, exhibitions, {
        search,
        precinct,
        statuses: orderedStatuses,
        openingWindows: orderedOpeningWindows
      }),
    [exhibitions, galleries, orderedOpeningWindows, orderedStatuses, precinct, search]
  )

  const activeFilters = useMemo(() => {
    const filters = []

    if (!isDefaultStatusSelection(orderedStatuses)) {
      filters.push(`Status: ${orderedStatuses.map((status) => statusLabels[status]).join(' + ')}`)
    }

    if (orderedOpeningWindows.length) {
      filters.push(
        `Opening: ${orderedOpeningWindows
          .map((window) => openingFilterOptions.find((option) => option.value === window)?.label || window)
          .join(' + ')}`
      )
    }

    if (precinct !== 'all') {
      filters.push(`Precinct: ${precinct}`)
    }

    if (search.trim()) {
      filters.push(`Search: ${search.trim()}`)
    }

    return filters
  }, [orderedOpeningWindows, orderedStatuses, precinct, search])

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

    if (isDefaultStatusSelection(orderedStatuses)) {
      params.delete('status')
    } else {
      params.set('status', orderedStatuses.join(','))
    }

    if (orderedOpeningWindows.length) {
      params.set('opening', orderedOpeningWindows.join(','))
    } else {
      params.delete('opening')
    }

    params.delete('galleries')

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    }
  }, [orderedOpeningWindows, orderedStatuses, pathname, precinct, router, search, searchParams])

  function toggleStatus(status) {
    setSelectedStatuses((current) => {
      const next = new Set(current)

      if (next.has(status)) {
        if (next.size === 1) {
          return current
        }

        next.delete(status)
      } else {
        next.add(status)
      }

      return next
    })
  }

  function toggleOpeningWindow(window) {
    setSelectedOpeningWindows((current) => {
      const next = new Set(current)

      if (next.has(window)) {
        next.delete(window)
      } else {
        next.add(window)
      }

      return next
    })
  }

  function clearAllFilters() {
    setSearch('')
    setPrecinct('all')
    setSelectedStatuses(new Set(defaultStatusFilters))
    setSelectedOpeningWindows(new Set())
  }

  function handleExhibitionCardClick(slug, event) {
    if (isInteractiveElement(event.target)) {
      return
    }

    router.push(`/exhibition/${encodeURIComponent(slug)}`)
  }

  function handleExhibitionCardKeyDown(slug, event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    router.push(`/exhibition/${encodeURIComponent(slug)}`)
  }

  return (
    <section className="page-block">
      <div className="section-head">
        <h1>What's On</h1>
      </div>
      <p className="section-copy">Current and upcoming exhibitions across Sydney galleries.</p>

      <div className="compact-control-row">
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
              <div className="filter-bar filter-bar-two" role="group" aria-label="Exhibition filters">
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

              <div className="filter-toggle-grid">
                <div className="field">
                  <span>Status</span>
                  <div className="toggle-chip-row" role="group" aria-label="Status filters">
                    {statusFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`toggle-chip ${selectedStatuses.has(option.value) ? 'is-active' : ''}`}
                        onClick={() => toggleStatus(option.value)}
                        aria-pressed={selectedStatuses.has(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <span>Opening</span>
                  <div className="toggle-chip-row" role="group" aria-label="Opening filters">
                    {openingFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`toggle-chip ${selectedOpeningWindows.has(option.value) ? 'is-active' : ''}`}
                        onClick={() => toggleOpeningWindow(option.value)}
                        aria-pressed={selectedOpeningWindows.has(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFilters.length ? (
                <button type="button" className="button button-secondary" onClick={clearAllFilters}>
                  Clear filters
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <div className="results-status-block">
        {activeFilters.length ? (
          <div className="active-filters" aria-label="Applied filters">
            {activeFilters.map((filter) => (
              <span key={filter} className="filter-pill">
                {filter}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {filteredExhibitions.length ? (
        <ul className="exhibition-list exhibition-list-compact">
          {filteredExhibitions.map((exhibition) => {
            const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
            const status = getExhibitionStatus(exhibition)
            const exhibitionSlug = getExhibitionSlug(exhibition)

            return (
              <li
                key={exhibition.id}
                className="exhibition-item clickable-card"
                tabIndex={0}
                role="link"
                aria-label={`Open exhibition details for ${exhibition.title}`}
                onClick={(event) => handleExhibitionCardClick(exhibitionSlug, event)}
                onKeyDown={(event) => handleExhibitionCardKeyDown(exhibitionSlug, event)}
              >
                <div className="item-head">
                  <h2 className="item-title">{exhibition.title}</h2>
                  <span className={`status-tag status-${status}`}>{statusLabels[status]}</span>
                </div>
                <p className="item-artist">{exhibition.artist}</p>
                <p className="item-meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                {exhibition.openingDate ? (
                  <p className="item-meta">
                    Opening: {formatDate(exhibition.openingDate)}
                    {exhibition.openingTime ? ` | ${exhibition.openingTime}` : ''}
                  </p>
                ) : null}
                <div className="item-actions item-actions-split">
                  {gallery ? (
                    <Link className="item-gallery-link" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
                      <span className="item-gallery-name">{gallery.name}</span>
                      <span className="item-gallery-location">
                        {gallery.suburb || gallery.precinct || 'Unspecified location'}
                      </span>
                    </Link>
                  ) : null}
                  <Link
                    className="button button-subtle button-card-cta"
                    href={`/exhibition/${encodeURIComponent(exhibitionSlug)}`}
                  >
                    View details
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
