'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { setExhibitionHiddenAction } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/date'
import { foldSearchText } from '@/lib/utils/text'
import SearchField from '@/components/SearchField'

const PAGE_SIZE = 30

function getStatus(exhibition) {
  if (exhibition.hidden_by_admin) {
    return 'hidden'
  }
  return exhibition.published ? 'published' : 'draft'
}

function statusLabel(exhibition) {
  const status = getStatus(exhibition)
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function ConsoleExhibitionsClient({ exhibitions }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [gallery, setGallery] = useState('all')
  const [page, setPage] = useState(1)

  const galleries = useMemo(
    () =>
      [...new Set(exhibitions.map((exhibition) => exhibition.gallery_name).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [exhibitions]
  )

  const filtered = useMemo(() => {
    const query = foldSearchText(search.trim())

    return exhibitions.filter((exhibition) => {
      if (status !== 'all' && getStatus(exhibition) !== status) {
        return false
      }
      if (gallery !== 'all' && exhibition.gallery_name !== gallery) {
        return false
      }
      if (!query) {
        return true
      }

      return foldSearchText(`${exhibition.exhibition_name || ''} ${exhibition.gallery_name || ''}`).includes(query)
    })
  }, [exhibitions, gallery, search, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visiblePage = Math.min(page, pageCount)
  const visibleExhibitions = filtered.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE
  )
  const hasFilters = search.trim() || status !== 'all' || gallery !== 'all'

  useEffect(() => {
    setPage(1)
  }, [gallery, search, status])

  function resetFilters() {
    setSearch('')
    setStatus('all')
    setGallery('all')
  }

  return (
    <>
      <div className="con-exhibition-tools" aria-label="Filter exhibitions">
        <label className="con-filter con-filter--search">
          <span>Search title or gallery</span>
          <SearchField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exhibitions"
          />
        </label>

        <label className="con-filter">
          <span>Status</span>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>

        <label className="con-filter">
          <span>Gallery</span>
          <select className="field" value={gallery} onChange={(event) => setGallery(event.target.value)}>
            <option value="all">All galleries</option>
            {galleries.map((galleryName) => (
              <option key={galleryName} value={galleryName}>
                {galleryName}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn--text con-filter-reset" type="button" onClick={resetFilters} disabled={!hasFilters}>
          Reset
        </button>
      </div>

      <div className="con-results-meta" aria-live="polite">
        <span>
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
        {filtered.length ? <span>Page {visiblePage} of {pageCount}</span> : null}
      </div>

      {visibleExhibitions.length ? (
        <ul className="table con-table" id="console-exhibition-results">
          {visibleExhibitions.map((exhibition) => (
            <li className="table__row" key={exhibition.id}>
              <p className="table__primary table__primary--work con-table__name">{exhibition.exhibition_name}</p>
              <p className="table__fact">
                {exhibition.gallery_name} · {formatDate(exhibition.start_date)}
                {exhibition.source && exhibition.source !== 'manual' ? ` · ${exhibition.source}` : ''}
              </p>
              <span
                className={`table__status${
                  exhibition.published && !exhibition.hidden_by_admin ? '' : ' table__status--muted'
                }`}
              >
                {statusLabel(exhibition)}
              </span>
              <div className="table__actions">
                {exhibition.slug ? (
                  <Link className="btn btn--text" href={`/exhibition/${exhibition.slug}`}>
                    View
                  </Link>
                ) : null}
                <form action={setExhibitionHiddenAction}>
                  <input type="hidden" name="id" value={exhibition.id} />
                  <input type="hidden" name="hidden" value={(!exhibition.hidden_by_admin).toString()} />
                  <button
                    className={`btn ${exhibition.hidden_by_admin ? 'btn--text' : 'btn--danger-text'}`}
                    type="submit"
                  >
                    {exhibition.hidden_by_admin ? 'Unhide' : 'Hide'}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state con-empty">
          <h2>No exhibitions match</h2>
          <p>Try another title, gallery or status.</p>
          <button className="btn btn--outline" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      )}

      {pageCount > 1 ? (
        <nav className="con-pagination" aria-label="Exhibition results pages">
          <button
            className="btn btn--outline"
            type="button"
            disabled={visiblePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span aria-current="page">{visiblePage} / {pageCount}</span>
          <button
            className="btn btn--outline"
            type="button"
            disabled={visiblePage === pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Next
          </button>
        </nav>
      ) : null}
    </>
  )
}
