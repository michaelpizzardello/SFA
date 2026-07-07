'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formatDate, todayISOInSydney } from '../lib/utils/date'
import { filterExhibitions, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import { DEFAULT_WINDOW, TIME_WINDOWS, getWindowLabel, normalizeWindow } from '../lib/utils/windows'
import ExhibitionCard from './ExhibitionCard'
import SearchField from './SearchField'
import { IconList, IconGrid } from './icons/ViewIcons'

// Windows whose ordering is keyed to a single near date get date-group headers in list view
// (§4.7/§5.2); the group key mirrors sortForWindow so groups stay contiguous.
function dateGroupKeyFor(when) {
  if (when === 'closing-soon') return (e) => e.endDate || e.startDate
  if (when === 'opening-this-week') return (e) => e.startDate || e.openingDate
  return null
}

export default function WhatsOnPageClient({ galleries, exhibitions, initialFilters }) {
  const [when, setWhen] = useState(() => normalizeWindow(initialFilters.when))
  const [precinct, setPrecinct] = useState(initialFilters.precinct || 'all')
  const [search, setSearch] = useState(initialFilters.search || '')
  // Image-forward by default now that exhibitions carry covers; list is the toggle.
  const [view, setView] = useState('grid')

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = todayISOInSydney()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const filteredExhibitions = useMemo(
    () => filterExhibitions(galleries, exhibitions, { search, precinct, when }),
    [exhibitions, galleries, precinct, search, when]
  )

  // Live <sup> counts per window, computed from the precinct-filtered set (§4.13) so the
  // numbers stay honest whichever precinct pivot is active.
  const windowCounts = useMemo(() => {
    const counts = {}
    for (const w of TIME_WINDOWS) {
      counts[w.slug] = filterExhibitions(galleries, exhibitions, { search: '', precinct, when: w.slug }).length
    }
    return counts
  }, [exhibitions, galleries, precinct])

  // Keep the URL in sync so every window/precinct is a shareable, back-button-correct address.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (when && when !== DEFAULT_WINDOW) params.set('when', when)
    else params.delete('when')
    if (precinct !== 'all') params.set('precinct', precinct)
    else params.delete('precinct')
    if (search.trim()) params.set('search', search.trim())
    else params.delete('search')
    // retire legacy params
    params.delete('status')
    params.delete('opening')
    params.delete('galleries')
    const next = params.toString()
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [pathname, precinct, router, search, searchParams, when])

  const mapHref = useMemo(() => {
    const params = new URLSearchParams()
    if (when && when !== DEFAULT_WINDOW) params.set('when', when)
    if (precinct !== 'all') params.set('precinct', precinct)
    const qs = params.toString()
    return qs ? `/map?${qs}` : '/map'
  }, [precinct, when])

  // Display-only grouping for the list ledger; single unlabelled group when the window
  // has no date spine (on-now, this-weekend).
  const listGroups = useMemo(() => {
    const keyFor = dateGroupKeyFor(when)
    if (!keyFor) return [{ key: 'all', label: null, items: filteredExhibitions }]
    const groups = []
    for (const exhibition of filteredExhibitions) {
      const key = keyFor(exhibition) || 'tba'
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.items.push(exhibition)
      else groups.push({ key, label: formatDate(keyFor(exhibition)), items: [exhibition] })
    }
    return groups
  }, [filteredExhibitions, when])

  function resetToOnNow() {
    setWhen(DEFAULT_WINDOW)
    setPrecinct('all')
    setSearch('')
  }

  const windowLabel = getWindowLabel(when)

  return (
    <div className="container">
      <h1 className="page-title">What&apos;s On</h1>

      {/* TIME SPINE — the primary organising control: named, addressable windows */}
      <nav className="window-nav" aria-label="Time window">
        {TIME_WINDOWS.map((w) => (
          <button
            key={w.slug}
            type="button"
            className={`window-nav__item${when === w.slug ? ' is-active' : ''}`}
            aria-pressed={when === w.slug}
            onClick={() => setWhen(w.slug)}
          >
            {w.label}
            <sup>{windowCounts[w.slug]}</sup>
          </button>
        ))}
      </nav>

      {/* PRECINCT — the single orthogonal pivot, a scrollable text-tab row */}
      <div className="wo-precincts" role="group" aria-label="Precinct">
        <button
          type="button"
          className={`text-tab${precinct === 'all' ? ' is-active' : ''}`}
          aria-pressed={precinct === 'all'}
          onClick={() => setPrecinct('all')}
        >
          All Sydney
        </button>
        {precinctOptions.map((p) => (
          <button
            key={p}
            type="button"
            className={`text-tab${precinct === p ? ' is-active' : ''}`}
            aria-pressed={precinct === p}
            onClick={() => setPrecinct(precinct === p ? 'all' : p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="index-toolbar">
        <SearchField
          placeholder="Search exhibitions, artists, galleries"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search exhibitions"
        />
        <Link className="toolbar-control" href={mapHref}>
          View on map
        </Link>
        <div className="view-toggle" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}>
            <IconGrid />
          </button>
          <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}>
            <IconList />
          </button>
        </div>
      </div>

      <div className="wo-applied">
        <span className="results-meta">
          {filteredExhibitions.length} {windowLabel.toLowerCase()}
          {precinct !== 'all' ? ` in ${precinct}` : ''}
        </span>
        {search.trim() ? (
          <button
            type="button"
            className="applied-token"
            aria-label={`Clear search ${search.trim()}`}
            onClick={() => setSearch('')}
          >
            <span className="applied-token__label">&ldquo;{search.trim()}&rdquo;</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        ) : null}
      </div>

      <h2 className="visually-hidden">Exhibitions</h2>
      {filteredExhibitions.length ? (
        view === 'list' ? (
          listGroups.map((group) => (
            <div key={group.key}>
              {group.label ? <h3 className="date-group">{group.label}</h3> : null}
              <ul className="index-list">
                {group.items.map((exhibition) => (
                  <li key={exhibition.id}>
                    <ExhibitionCard
                      exhibition={exhibition}
                      gallery={getGalleryBySlug(galleries, exhibition.gallerySlug)}
                      status={getExhibitionStatus(exhibition, today)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))
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
        <div className="empty-state">
          <p>
            Nothing {windowLabel.toLowerCase()}
            {precinct !== 'all' ? ` in ${precinct}` : ''}.
          </p>
          {when !== DEFAULT_WINDOW || precinct !== 'all' || search.trim() ? (
            <button type="button" className="btn btn--outline" onClick={resetToOnNow}>
              See what&apos;s on now
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
