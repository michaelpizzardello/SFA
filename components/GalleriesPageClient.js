'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { filterGalleries, getGalleryDirectoryData, getPrecinctOptions } from '../lib/utils/filters'
import GalleryCard from './GalleryCard'
import SearchField from './SearchField'
import { useDialog } from './useDialog'
import { IconList, IconGrid } from './icons/ViewIcons'

export default function GalleriesPageClient({ galleries, exhibitions, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [sort, setSort] = useState(initialFilters.sort)
  const [onlyOnNow, setOnlyOnNow] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Galleries deliberately lead with the monogram grid (the "Mondrian tiles" rich state); list is the toggle.
  const [view, setView] = useState('grid')

  const closeFilters = useCallback(() => setFiltersOpen(false), [])
  const sheetRef = useDialog(filtersOpen, closeFilters)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])
  const filteredGalleries = useMemo(
    () => filterGalleries(galleries, { search, precinct, sort }),
    [galleries, precinct, search, sort]
  )
  const rows = useMemo(() => {
    const base = getGalleryDirectoryData(filteredGalleries, exhibitions)
    const scoped = onlyOnNow ? base.filter((row) => (row.summary?.current || 0) > 0) : base
    // lean the index toward "what can I see now": galleries with a current show float up (stable, so
    // the chosen A–Z / precinct order is preserved within each group)
    return [...scoped].sort(
      (a, b) => Number((b.summary?.current || 0) > 0) - Number((a.summary?.current || 0) > 0)
    )
  }, [exhibitions, filteredGalleries, onlyOnNow])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) params.set('search', search.trim())
    else params.delete('search')
    if (precinct !== 'all') params.set('precinct', precinct)
    else params.delete('precinct')
    if (sort !== 'alphabetical') params.set('sort', sort)
    else params.delete('sort')
    const next = params.toString()
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [pathname, precinct, router, search, searchParams, sort])

  const applied = []
  if (precinct !== 'all') applied.push({ key: 'precinct', label: precinct })
  if (search.trim()) applied.push({ key: 'search', label: `“${search.trim()}”` })

  return (
    <div className="container">
      <header className="galleries-head">
        <h1>Galleries</h1>
      </header>

      <div className="index-toolbar">
        <SearchField
          placeholder="Search galleries"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search galleries"
        />
        <button
          type="button"
          className={`chip${onlyOnNow ? ' chip--active' : ''}`}
          aria-pressed={onlyOnNow}
          onClick={() => setOnlyOnNow((v) => !v)}
        >
          On now
        </button>
        <Link className="toolbar-control" href={precinct !== 'all' ? `/map?precinct=${encodeURIComponent(precinct)}` : '/map'}>
          Map
        </Link>
        <button type="button" className="toolbar-control" onClick={() => setFiltersOpen(true)}>
          Filters
        </button>
        <div className="view-toggle" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}>
            <IconGrid />
          </button>
          <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}>
            <IconList />
          </button>
        </div>
      </div>

      <div className="applied-row">
        <span className="results-meta">{rows.length} galleries</span>
        {applied.map((f) => (
          <span key={f.key} className="chip chip--applied">
            <span className="chip__label">{f.label}</span>
            <button
              type="button"
              aria-label={`Remove ${f.label}`}
              onClick={() => (f.key === 'precinct' ? setPrecinct('all') : setSearch(''))}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {rows.length ? (
        view === 'grid' ? (
          <div className="card-grid">
            {rows.map(({ gallery, summary }) => (
              <GalleryCard key={gallery.id} gallery={gallery} summary={summary} />
            ))}
          </div>
        ) : (
          <ul className="gal-list">
            {rows.map(({ gallery, summary }) => (
              <li key={gallery.id}>
                <Link className="gal-row" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
                  <span className="gal-row__name">{gallery.name}</span>
                  <span className="gal-row__meta">
                    {[gallery.precinct, gallery.suburb].filter(Boolean).join(' · ')}
                    {summary?.current ? ` · ${summary.current} on now` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="empty-state">No galleries match these filters.</p>
      )}

      {filtersOpen ? (
        <>
          <div className="scrim" onClick={() => setFiltersOpen(false)} role="presentation" />
          <section className="sheet" role="dialog" aria-modal="true" aria-label="Gallery filters" ref={sheetRef}>
            <div className="sheet__handle" />
            <div className="sheet__head">
              <h2>Filters</h2>
              <button type="button" className="btn--text" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <div className="sheet__body">
              <div className="field-group">
                <span className="field-label">Precinct</span>
                <select className="field" value={precinct} onChange={(e) => setPrecinct(e.target.value)}>
                  <option value="all">All precincts</option>
                  {precinctOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <span className="field-label">Sort</span>
                <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="alphabetical">A–Z</option>
                  <option value="precinct">By precinct</option>
                </select>
              </div>
            </div>
            <div className="sheet__foot">
              <button type="button" className="btn btn--primary btn--block" onClick={() => setFiltersOpen(false)}>
                Show {rows.length} galleries
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
