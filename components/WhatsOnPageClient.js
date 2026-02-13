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

export default function WhatsOnPageClient({ galleries, exhibitions, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [openingWindow, setOpeningWindow] = useState(initialFilters.openingWindow)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const filteredExhibitions = useMemo(
    () => filterExhibitions(galleries, exhibitions, { search, precinct, openingWindow }),
    [exhibitions, galleries, openingWindow, precinct, search]
  )

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

    if (openingWindow !== 'current-upcoming') {
      params.set('openingWindow', openingWindow)
    } else {
      params.delete('openingWindow')
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    }
  }, [openingWindow, pathname, precinct, router, search, searchParams])

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
          <select value={openingWindow} onChange={(event) => setOpeningWindow(event.target.value)}>
            <option value="current-upcoming">Current + upcoming</option>
            <option value="tonight">Opening tonight</option>
            <option value="week">Opening this week</option>
            <option value="all">All dates</option>
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
