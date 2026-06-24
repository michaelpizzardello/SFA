'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { todayISOInSydney } from '../lib/utils/date'
import { filterExhibitions, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import ExhibitionCard from './ExhibitionCard'
import { useDialog } from './useDialog'
import { IconList, IconGrid } from './icons/ViewIcons'

const statusFilterOptions = [
  { value: 'current', label: 'On now' },
  { value: 'upcoming', label: 'Opening soon' }
]
const statusLabel = (s) => statusFilterOptions.find((o) => o.value === s)?.label || s
const openingFilterOptions = [
  { value: 'tonight', label: 'Opening today' },
  { value: 'week', label: 'Opening this week' }
]
const defaultStatusFilters = ['current', 'upcoming']

function normalizeStatusSelection(values) {
  const n = statusFilterOptions.map((o) => o.value).filter((v) => values.includes(v))
  return n.length ? n : [...defaultStatusFilters]
}
function normalizeOpeningSelection(values) {
  return openingFilterOptions.map((o) => o.value).filter((v) => values.includes(v))
}
function isDefaultStatusSelection(values) {
  return values.length === defaultStatusFilters.length && defaultStatusFilters.every((v) => values.includes(v))
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
  // Image-forward by default now that exhibitions carry covers; list is the toggle.
  const [view, setView] = useState('grid')

  const closeFilters = useCallback(() => setFiltersOpen(false), [])
  const sheetRef = useDialog(filtersOpen, closeFilters)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = todayISOInSydney()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])
  const orderedStatuses = useMemo(() => normalizeStatusSelection([...selectedStatuses]), [selectedStatuses])
  const orderedOpeningWindows = useMemo(() => normalizeOpeningSelection([...selectedOpeningWindows]), [selectedOpeningWindows])

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

  const applied = useMemo(() => {
    const list = []
    if (!isDefaultStatusSelection(orderedStatuses)) {
      list.push({ key: 'status', label: orderedStatuses.map(statusLabel).join(' + ') })
    }
    orderedOpeningWindows.forEach((w) =>
      list.push({ key: `opening:${w}`, label: openingFilterOptions.find((o) => o.value === w)?.label || w })
    )
    if (precinct !== 'all') list.push({ key: 'precinct', label: precinct })
    if (search.trim()) list.push({ key: 'search', label: `“${search.trim()}”` })
    return list
  }, [orderedOpeningWindows, orderedStatuses, precinct, search])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) params.set('search', search.trim())
    else params.delete('search')
    if (precinct !== 'all') params.set('precinct', precinct)
    else params.delete('precinct')
    if (isDefaultStatusSelection(orderedStatuses)) params.delete('status')
    else params.set('status', orderedStatuses.join(','))
    if (orderedOpeningWindows.length) params.set('opening', orderedOpeningWindows.join(','))
    else params.delete('opening')
    params.delete('galleries')
    const next = params.toString()
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [orderedOpeningWindows, orderedStatuses, pathname, precinct, router, search, searchParams])

  function toggleStatus(status) {
    setSelectedStatuses((cur) => {
      const next = new Set(cur)
      if (next.has(status)) {
        if (next.size === 1) return cur
        next.delete(status)
      } else next.add(status)
      return next
    })
  }
  function toggleOpening(w) {
    setSelectedOpeningWindows((cur) => {
      const next = new Set(cur)
      if (next.has(w)) next.delete(w)
      else next.add(w)
      return next
    })
  }
  function clearAll() {
    setSearch('')
    setPrecinct('all')
    setSelectedStatuses(new Set(defaultStatusFilters))
    setSelectedOpeningWindows(new Set())
  }
  function removeApplied(key) {
    if (key === 'status') setSelectedStatuses(new Set(defaultStatusFilters))
    else if (key === 'precinct') setPrecinct('all')
    else if (key === 'search') setSearch('')
    else if (key.startsWith('opening:')) toggleOpening(key.split(':')[1])
  }

  return (
    <div className="container">
      <header className="whats-on-head">
        <p className="eyebrow">On in Sydney</p>
        <h1>What&apos;s On</h1>
      </header>

      <div className="index-toolbar">
        <input
          className="field"
          type="search"
          placeholder="Search exhibitions, galleries, precincts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search exhibitions"
        />
        <div className="chip-row" role="group" aria-label="Status">
          {statusFilterOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`chip${selectedStatuses.has(o.value) ? ' chip--active' : ''}`}
              aria-pressed={selectedStatuses.has(o.value)}
              onClick={() => toggleStatus(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => setFiltersOpen(true)}>
          Filters
        </button>
        <div className="view-toggle" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}>
            <IconList />
          </button>
          <button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}>
            <IconGrid />
          </button>
        </div>
      </div>

      <div className="applied-row">
        <span className="results-meta">{filteredExhibitions.length} exhibitions</span>
        {applied.map((f) => (
          <span key={f.key} className="chip chip--applied">
            <span className="chip__label">{f.label}</span>
            <button type="button" aria-label={`Remove ${f.label}`} onClick={() => removeApplied(f.key)}>
              ×
            </button>
          </span>
        ))}
      </div>

      <h2 className="visually-hidden">Exhibitions</h2>
      {filteredExhibitions.length ? (
        view === 'list' ? (
          <ul className="index-list index-list--reveal">
            {filteredExhibitions.map((exhibition) => (
              <li key={exhibition.id}>
                <ExhibitionCard
                  exhibition={exhibition}
                  gallery={getGalleryBySlug(galleries, exhibition.gallerySlug)}
                  status={getExhibitionStatus(exhibition, today)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card-grid">
            {filteredExhibitions.map((exhibition) => (
              <ExhibitionCard
                key={exhibition.id}
                exhibition={exhibition}
                gallery={getGalleryBySlug(galleries, exhibition.gallerySlug)}
                status={getExhibitionStatus(exhibition, today)}
              />
            ))}
          </div>
        )
      ) : (
        <p className="empty-state">No exhibitions match these filters.</p>
      )}

      {filtersOpen ? (
        <>
          <div className="scrim" onClick={() => setFiltersOpen(false)} role="presentation" />
          <section className="sheet" role="dialog" aria-modal="true" aria-label="Filters" ref={sheetRef}>
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
                <span className="field-label">Opening</span>
                <div className="chip-row">
                  {openingFilterOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={`chip${selectedOpeningWindows.has(o.value) ? ' chip--active' : ''}`}
                      aria-pressed={selectedOpeningWindows.has(o.value)}
                      onClick={() => toggleOpening(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <span className="field-label">Status</span>
                <div className="chip-row">
                  {statusFilterOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={`chip${selectedStatuses.has(o.value) ? ' chip--active' : ''}`}
                      aria-pressed={selectedStatuses.has(o.value)}
                      onClick={() => toggleStatus(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sheet__foot">
              {applied.length ? (
                <button type="button" className="btn--text" onClick={clearAll} style={{ marginRight: 'auto' }}>
                  Clear all
                </button>
              ) : null}
              <button type="button" className="btn btn--primary btn--block" onClick={() => setFiltersOpen(false)}>
                Show {filteredExhibitions.length} results
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
