'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '../lib/utils/date'
import { buildFeaturedExportCsv } from '../lib/admin/export'

function addDays(dateString, dayCount) {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + dayCount)
  return date.toISOString().slice(0, 10)
}

function formatWeekLabel(weekStart, weekEnd) {
  return `${formatDate(weekStart)} – ${formatDate(weekEnd)}`
}

function buildEmptyForm(weekStart, weekEnd) {
  return {
    id: '',
    galleryInput: '',
    gallerySlug: '',
    location: '',
    exhibitionName: '',
    startDate: weekStart,
    endDate: weekEnd,
    openingInformation: '',
    imageUrl: '',
    rating: '',
    weekStart,
    weekEnd
  }
}

function normalizeLocation(gallery) {
  return gallery?.suburb || gallery?.precinct || ''
}

export default function AdminPageClient({ galleries, initialRecords, initialWeek, initialWeekLabel }) {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [records, setRecords] = useState(initialRecords)
  const [weekStart, setWeekStart] = useState(initialWeek.weekStart)
  const [weekEnd, setWeekEnd] = useState(initialWeek.weekEnd)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState(() => buildEmptyForm(initialWeek.weekStart, initialWeek.weekEnd))
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [isDraggingImage, setIsDraggingImage] = useState(false)

  const galleriesBySlug = useMemo(
    () => new Map(galleries.map((gallery) => [gallery.slug, gallery])),
    [galleries]
  )

  const sortedGalleries = useMemo(
    () => [...galleries].sort((first, second) => first.name.localeCompare(second.name)),
    [galleries]
  )

  const galleriesByName = useMemo(
    () => new Map(galleries.map((gallery) => [gallery.name.trim().toLowerCase(), gallery])),
    [galleries]
  )
  const matchedGallery = galleriesBySlug.get(formState.gallerySlug) || null

  const weekRecords = useMemo(
    () =>
      [...records]
        .filter((record) => record.weekStart === weekStart && record.weekEnd === weekEnd)
        .sort((first, second) => {
          if (first.startDate !== second.startDate) {
            return first.startDate.localeCompare(second.startDate)
          }

          return first.exhibitionName.localeCompare(second.exhibitionName)
        }),
    [records, weekEnd, weekStart]
  )

  const featuredRecords = useMemo(() => weekRecords.filter((record) => record.featured), [weekRecords])
  const ongoingRecords = useMemo(() => weekRecords.filter((record) => record.ongoing), [weekRecords])
  const featuredExportCsv = useMemo(() => buildFeaturedExportCsv(featuredRecords), [featuredRecords])

  useEffect(() => {
    if (!editingId) {
      setFormState(buildEmptyForm(weekStart, weekEnd))
    }
  }, [editingId, weekEnd, weekStart])

  function setWeekFromStart(nextWeekStart) {
    const computedWeekEnd = addDays(nextWeekStart, 6)
    setWeekStart(nextWeekStart)
    setWeekEnd(computedWeekEnd)
  }

  function handleGalleryInputChange(nextGalleryInput) {
    const matchedGallery = galleriesByName.get(String(nextGalleryInput || '').trim().toLowerCase()) || null

    setFormState((current) => ({
      ...current,
      galleryInput: nextGalleryInput,
      gallerySlug: matchedGallery ? matchedGallery.slug : '',
      location: matchedGallery ? normalizeLocation(matchedGallery) : current.location
    }))
  }

  function resetForm(nextWeekStart = weekStart, nextWeekEnd = weekEnd) {
    setEditingId('')
    setFormState(buildEmptyForm(nextWeekStart, nextWeekEnd))
    setSelectedImageFile(null)
    setFormOpen(false)
  }

  function beginEdit(record) {
    setEditingId(record.id)
    setWeekStart(record.weekStart)
    setWeekEnd(record.weekEnd)
    setFormState({
      id: record.id,
      galleryInput: record.galleryName,
      gallerySlug: record.galleryMode === 'index' ? record.gallerySlug : '',
      location: record.location || '',
      exhibitionName: record.exhibitionName,
      startDate: record.startDate,
      endDate: record.endDate,
      openingInformation: record.openingInformation || '',
      imageUrl: record.imageUrl || '',
      rating: record.rating ?? '',
      weekStart: record.weekStart,
      weekEnd: record.weekEnd
    })
    setSelectedImageFile(null)
    setFormOpen(true)
    setError('')
    setSuccessMessage('')
  }

  function handleSelectedImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      setError('Only image uploads are allowed.')
      return
    }

    setError('')
    setSelectedImageFile(file)
  }

  async function submitRecord(event) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    const payload = {
      gallerySlug: formState.gallerySlug,
      manualGalleryName: formState.galleryInput,
      location: formState.location,
      exhibitionName: formState.exhibitionName,
      startDate: formState.startDate,
      endDate: formState.endDate,
      openingInformation: formState.openingInformation,
      imageUrl: formState.imageUrl,
      rating: formState.rating,
      weekStart,
      weekEnd
    }

    const endpoint = editingId ? `/api/admin/exhibitions/${editingId}` : '/api/admin/exhibitions'
    const method = editingId ? 'PUT' : 'POST'

    startTransition(async () => {
      let nextImageUrl = formState.imageUrl

      if (selectedImageFile) {
        const uploadBody = new FormData()
        uploadBody.append('file', selectedImageFile)

        const uploadResponse = await fetch('/api/admin/uploads', {
          method: 'POST',
          body: uploadBody
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResponse.ok) {
          setError(uploadResult.error || 'Unable to upload image.')
          return
        }

        nextImageUrl = uploadResult.imageUrl
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          imageUrl: nextImageUrl
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Unable to save exhibition.')
        return
      }

      const nextRecord = result.record

      setRecords((current) => {
        if (editingId) {
          return current.map((record) => (record.id === editingId ? nextRecord : record))
        }

        return [...current, nextRecord]
      })

      setSuccessMessage(editingId ? 'Exhibition updated.' : 'Exhibition added.')
      resetForm(weekStart, weekEnd)
      router.refresh()
    })
  }

  function updateFlag(recordId, field, value) {
    setError('')
    setSuccessMessage('')

    startTransition(async () => {
      const record = records.find((entry) => entry.id === recordId)

      if (!record) {
        return
      }

      const response = await fetch(`/api/admin/exhibitions/${recordId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          gallerySlug: record.galleryMode === 'index' ? record.gallerySlug : '',
          manualGalleryName: record.galleryName,
          location: record.location,
          exhibitionName: record.exhibitionName,
          startDate: record.startDate,
          endDate: record.endDate,
          openingInformation: record.openingInformation,
          imageUrl: record.imageUrl || '',
          rating: record.rating ?? '',
          weekStart: record.weekStart,
          weekEnd: record.weekEnd,
          featured: field === 'featured' ? value : record.featured,
          ongoing: field === 'ongoing' ? value : record.ongoing
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Unable to update exhibition.')
        return
      }

      setRecords((current) => current.map((entry) => (entry.id === recordId ? result.record : entry)))
      router.refresh()
    })
  }

  function removeRecord(recordId) {
    const record = records.find((entry) => entry.id === recordId)
    const confirmed = window.confirm(
      `Delete "${record?.exhibitionName || 'this exhibition'}"? This cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccessMessage('')

    startTransition(async () => {
      const response = await fetch(`/api/admin/exhibitions/${recordId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Unable to delete exhibition.')
        return
      }

      setRecords((current) => current.filter((record) => record.id !== recordId))

      if (editingId === recordId) {
        resetForm()
      }

      router.refresh()
    })
  }

  async function copyFeaturedCsv() {
    setError('')
    setSuccessMessage('')

    if (!featuredRecords.length) {
      setError('No featured exhibitions selected for this week.')
      return
    }

    try {
      await navigator.clipboard.writeText(featuredExportCsv)
      setSuccessMessage('Featured exhibition CSV copied.')
    } catch (copyError) {
      setError('Unable to copy CSV to clipboard.')
    }
  }

  function downloadFeaturedCsv() {
    setError('')
    setSuccessMessage('')

    if (!featuredRecords.length) {
      setError('No featured exhibitions selected for this week.')
      return
    }

    const link = document.createElement('a')
    link.href = `/api/admin/exhibitions/export?weekStart=${encodeURIComponent(weekStart)}&weekEnd=${encodeURIComponent(weekEnd)}`
    link.click()

    setSuccessMessage('Featured exhibition CSV downloaded.')
  }

  return (
    <section className="admin-shell">
      <div className="admin-card admin-card-wide">
        <div className="admin-head">
          <div>
            <h1>Weekly Exhibitions</h1>
            <p className="section-copy">Create the weekly exhibition list and mark final-post selections.</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="button button-secondary" type="submit">
              Log out
            </button>
          </form>
        </div>

        <div className="admin-week-bar">
          <label className="field">
            <span>Week start</span>
            <input
              type="date"
              value={weekStart}
              onChange={(event) => setWeekFromStart(event.target.value)}
            />
          </label>
          <div className="admin-week-summary">
            <span className="item-kicker">Mon–Sun this week</span>
            <strong>{formatWeekLabel(weekStart, weekEnd)}</strong>
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setFormOpen((current) => !current)
              setEditingId('')
              setFormState(buildEmptyForm(weekStart, weekEnd))
            }}
          >
            {formOpen ? 'Close form' : 'Add exhibition'}
          </button>
        </div>

        <div className="admin-selection-summary">
          <p>
            <strong>Featured:</strong> {featuredRecords.length}
          </p>
          <p>
            <strong>Ongoing:</strong> {ongoingRecords.length}
          </p>
          <p>
            <strong>Week total:</strong> {weekRecords.length}
          </p>
          <p>
            <strong>Initial range:</strong> {initialWeekLabel}
          </p>
        </div>

        <div className="admin-export-bar">
          <div className="admin-export-copy">
            <p className="item-kicker">Featured export</p>
            <p className="admin-export-note">Copies the current week&apos;s featured exhibitions in the Exhibitions sheet row format.</p>
          </div>
          <div className="admin-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={copyFeaturedCsv}
              disabled={!featuredRecords.length}
            >
              Copy featured CSV
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={downloadFeaturedCsv}
              disabled={!featuredRecords.length}
            >
              Download CSV
            </button>
          </div>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {successMessage ? <p className="admin-success">{successMessage}</p> : null}

        {formOpen ? (
          <form className="admin-form-stack admin-form-card" onSubmit={submitRecord}>
            <div className="admin-form-layout">
              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <p className="item-kicker">Gallery</p>
                  <h3>Gallery details</h3>
                  <p className="admin-form-note">Find an indexed gallery by typing, or leave it as a manual gallery entry.</p>
                </div>

                <div className="admin-grid">
                  <label className="field field-span-2">
                    <span>Gallery</span>
                    <input
                      type="text"
                      list="admin-gallery-options"
                      placeholder="Type to search or enter manually"
                      value={formState.galleryInput}
                      onChange={(event) => handleGalleryInputChange(event.target.value)}
                    />
                    <datalist id="admin-gallery-options">
                      {sortedGalleries.map((gallery) => (
                        <option key={gallery.slug} value={gallery.name} />
                      ))}
                    </datalist>
                  </label>

                  <label className="field field-span-2">
                    <span>Location</span>
                    <input
                      type="text"
                      value={formState.location}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          location: event.target.value
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="admin-form-status">
                  {matchedGallery ? (
                    <p className="admin-form-status-text">
                      Using indexed gallery: <strong>{matchedGallery.name}</strong>
                    </p>
                  ) : formState.galleryInput ? (
                    <p className="admin-form-status-text">This will be saved as a manual gallery entry.</p>
                  ) : (
                    <p className="admin-form-status-text">Choose or type a gallery to continue.</p>
                  )}
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <p className="item-kicker">Exhibition</p>
                  <h3>Exhibition details</h3>
                  <p className="admin-form-note">Add the exhibition metadata, image, dates, and opening information.</p>
                </div>

                <div className="admin-grid">
                  <label className="field field-span-2">
                    <span>Exhibition name</span>
                    <input
                      type="text"
                      value={formState.exhibitionName}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          exhibitionName: event.target.value
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Exhibition start date</span>
                    <input
                      type="date"
                      value={formState.startDate}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          startDate: event.target.value
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Exhibition end date</span>
                    <input
                      type="date"
                      value={formState.endDate}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          endDate: event.target.value
                        }))
                      }
                    />
                  </label>

                  <label className="field field-span-2">
                    <span>Opening information</span>
                    <input
                      type="text"
                      placeholder="Opening Thu 23 April 5:30–7:30 PM"
                      value={formState.openingInformation}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          openingInformation: event.target.value
                        }))
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Exhibition image</span>
                    <input
                      ref={fileInputRef}
                      className="admin-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleSelectedImage(event.target.files?.[0] || null)}
                    />
                    <div
                      className={`admin-upload-dropzone${isDraggingImage ? ' is-dragging' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          fileInputRef.current?.click()
                        }
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        setIsDraggingImage(true)
                      }}
                      onDragEnter={(event) => {
                        event.preventDefault()
                        setIsDraggingImage(true)
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault()
                        const relatedTarget = event.relatedTarget

                        if (!event.currentTarget.contains(relatedTarget)) {
                          setIsDraggingImage(false)
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        setIsDraggingImage(false)
                        handleSelectedImage(event.dataTransfer.files?.[0] || null)
                      }}
                    >
                      <p className="admin-upload-title">Drag and drop an image here</p>
                      <p className="admin-upload-copy">or click to choose a file</p>
                      <p className="admin-upload-meta">
                        {selectedImageFile ? selectedImageFile.name : 'PNG, JPG, WEBP, or GIF'}
                      </p>
                    </div>
                  </label>

                  <label className="field admin-rating-field">
                    <span>Rating</span>
                    <input
                      className="admin-rating-input"
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={formState.rating}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          rating: event.target.value
                        }))
                      }
                    />
                  </label>

                  <label className="field field-span-2">
                    <span>Image URL</span>
                    <input
                      type="text"
                      placeholder="https://... or uploaded image URL"
                      value={formState.imageUrl}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          imageUrl: event.target.value
                        }))
                      }
                    />
                  </label>
                </div>

                {selectedImageFile || formState.imageUrl ? (
                  <div className="admin-image-preview">
                    <img
                      src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formState.imageUrl}
                      alt=""
                    />
                  </div>
                ) : null}
              </section>
            </div>

            <div className="admin-actions">
              <button className="button button-primary" type="submit" disabled={isPending}>
                {editingId ? 'Update exhibition' : 'Save exhibition'}
              </button>
              <button className="button button-secondary" type="button" onClick={() => resetForm()}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <section className="page-block admin-list-block">
          <div className="section-head">
            <h2>Exhibitions this week</h2>
          </div>
          {weekRecords.length ? (
            <ul className="admin-record-list">
              {weekRecords.map((record) => {
                const gallery = galleriesBySlug.get(record.gallerySlug)
                const displayLocation = record.location || normalizeLocation(gallery)

                return (
                  <li key={record.id} className="admin-record-card">
                    <div className="admin-record-main">
                      <div>
                        <p className="item-title">{record.exhibitionName}</p>
                        <p className="item-meta">
                          {record.galleryName}
                          {displayLocation ? ` | ${displayLocation}` : ''}
                        </p>
                        <p className="item-meta">
                          {record.startDate ? formatDate(record.startDate) : 'TBA'}
                          {record.endDate ? ` – ${formatDate(record.endDate)}` : ''}
                        </p>
                        {record.openingInformation ? <p className="item-meta">{record.openingInformation}</p> : null}
                        {record.rating !== null ? <p className="item-meta">Rating: {record.rating}</p> : null}
                        {record.imageUrl ? (
                          <div className="admin-record-thumb">
                            <img src={record.imageUrl} alt="" />
                          </div>
                        ) : null}
                      </div>

                      <div className="admin-record-controls">
                        <label className="admin-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(record.featured)}
                            onChange={(event) => updateFlag(record.id, 'featured', event.target.checked)}
                          />
                          <span>Featured</span>
                        </label>
                        <label className="admin-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(record.ongoing)}
                            onChange={(event) => updateFlag(record.id, 'ongoing', event.target.checked)}
                          />
                          <span>Ongoing</span>
                        </label>
                        <button className="text-link text-link-button" type="button" onClick={() => beginEdit(record)}>
                          Edit
                        </button>
                        <button
                          className="text-link text-link-button admin-delete"
                          type="button"
                          onClick={() => removeRecord(record.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="empty-copy">No exhibitions saved for this week yet.</p>
          )}
        </section>
      </div>
    </section>
  )
}
