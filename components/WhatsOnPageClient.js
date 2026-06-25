'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { todayISOInSydney } from '../lib/utils/date'
import { filterExhibitions, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import { DEFAULT_WINDOW, TIME_WINDOWS, getWindowLabel, normalizeWindow } from '../lib/utils/windows'
import ExhibitionCard from './ExhibitionCard'
import SearchField from './SearchField'
import { IconList, IconGrid } from './icons/ViewIcons'

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

  function resetToOnNow() {
    setWhen(DEFAULT_WINDOW)
    setPrecinct('all')
    setSearch('')
  }

  const windowLabel = getWindowLabel(when)

  return (
    <div className="container">
      <header className="whats-on-head">
        <h1>What&apos;s On</h1>
      </header>

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
          </button>
        ))}
      </nav>

      {/* PRECINCT — the single orthogonal pivot, promoted to a visible (scrollable) chip row */}
      <div className="precinct-chips" role="group" aria-label="Precinct">
        <button
          type="button"
          className={`chip${precinct === 'all' ? ' chip--active' : ''}`}
          aria-pressed={precinct === 'all'}
          onClick={() => setPrecinct('all')}
        >
          All Sydney
        </button>
        {precinctOptions.map((p) => (
          <button
            key={p}
            type="button"
            className={`chip${precinct === p ? ' chip--active' : ''}`}
            aria-pressed={precinct === p}
            onClick={() => setPrecinct(precinct === p ? 'all' : p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="index-toolbar index-toolbar--slim">
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

      <div className="applied-row">
        <span className="results-meta">
          {filteredExhibitions.length} {windowLabel.toLowerCase()}
          {precinct !== 'all' ? ` in ${precinct}` : ''}
        </span>
        {search.trim() ? (
          <span className="chip chip--applied">
            <span className="chip__label">“{search.trim()}”</span>
            <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>
              ×
            </button>
          </span>
        ) : null}
      </div>

      <h2 className="visually-hidden">Exhibitions</h2>
      {filteredExhibitions.length ? (
        view === 'list' ? (
          <ul className="index-list">
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
        <div className="empty-state">
          <p>
            Nothing {windowLabel.toLowerCase()}
            {precinct !== 'all' ? ` in ${precinct}` : ''}.
          </p>
          {when !== DEFAULT_WINDOW || precinct !== 'all' || search.trim() ? (
            <button type="button" className="btn btn--ghost" onClick={resetToOnNow}>
              See what&apos;s on now
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
