'use client'

import { useState } from 'react'

// Uploads to /api/uploads (user-JWT, gallery-scoped) and stores the returned public URL in a hidden
// input so the parent form submits it. Shows a live preview.
export default function ImageUploadField({ name, galleryId, initialUrl = '', label, hint }) {
  const [url, setUrl] = useState(initialUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(event) {
    const file = event.target.files && event.target.files[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('galleryId', galleryId)
      const res = await fetch('/api/uploads', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed.')
      setUrl(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-upload">
      <label className="field-label" htmlFor={`upload-${name}`}>
        {label}
      </label>
      <input type="hidden" name={name} value={url} />
      {url ? <img src={url} alt="" className="dash-upload__preview" /> : null}
      <input
        id={`upload-${name}`}
        className="dash-upload__file"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleChange}
        disabled={busy}
      />
      {hint ? <p className="field-hint">{hint}</p> : null}
      <div role="status" aria-live="polite">
        {busy ? <p className="u-mono">Uploading…</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
      </div>
      {url ? (
        <button type="button" className="btn btn--danger-text" onClick={() => setUrl('')}>
          Remove image
        </button>
      ) : null}
    </div>
  )
}
