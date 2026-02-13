'use client'

import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { filterGalleries, getGalleryDirectoryData, getPrecinctOptions } from '../lib/utils/filters'

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

  const activeFilters = useMemo(() => {
    const filters = []

    if (search.trim()) {
      filters.push(`Search: ${search.trim()}`)
    }

    if (precinct !== 'all') {
      filters.push(`Precinct: ${precinct}`)
    }

    if (sort !== 'alphabetical') {
      filters.push('Sort: By precinct')
    }

    if (!filters.length) {
      filters.push('All galleries')
    }

    return filters
  }, [precinct, search, sort])
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

  return (
    <section className="page-block">
      <div className="section-head">
        <h1>Galleries</h1>
        <Link className="text-link" href={mapParams ? `/map?${mapParams}` : '/map'}>
          Open map view
        </Link>
      </div>
      <p className="section-copy">Search and browse the Sydney gallery directory.</p>

      <div className="section-tools">
        <button
          type="button"
          className="button button-secondary icon-button filter-icon-button"
          aria-label="Open filters"
          onClick={() => setFiltersOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 6h18l-7 8v5l-4-2v-3L3 6z" fill="currentColor" />
          </svg>
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
              <div className="filter-bar" role="group" aria-label="Gallery filters">
                <label className="field">
                  <span>Search</span>
                  <input
                    type="search"
                    placeholder="Gallery, suburb, precinct"
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

      <div className="active-filters" aria-label="Applied filters">
        {activeFilters.map((filter) => (
          <span key={filter} className="filter-pill">
            {filter}
          </span>
        ))}
      </div>

      <p className="results-meta">
        {directoryRows.length} {directoryRows.length === 1 ? 'gallery' : 'galleries'} found
      </p>

      {directoryRows.length ? (
        <ul className="directory-list">
          {directoryRows.map(({ gallery, summary }) => (
            <li key={gallery.id} className="directory-item">
              <div>
                <p className="item-kicker">{gallery.precinct}</p>
                <h2 className="item-title">{gallery.name}</h2>
                <p className="item-meta">{gallery.address}</p>
                <p className="item-meta">
                  {summary.current} current | {summary.upcoming} upcoming
                </p>
              </div>
              <Link className="text-link" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
                View profile
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-copy">No galleries match these filters.</p>
      )}
    </section>
  )
}
