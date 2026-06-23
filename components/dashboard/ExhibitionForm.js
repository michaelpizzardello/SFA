'use client'

import { useActionState } from 'react'
import { saveExhibitionAction } from '@/lib/actions/exhibitions'
import ImageUploadField from './ImageUploadField'

export default function ExhibitionForm({ gallery, exhibition }) {
  const [state, formAction, pending] = useActionState(saveExhibitionAction, {})
  const e = exhibition || {}

  return (
    <form action={formAction} className="dashboard-form">
      <input type="hidden" name="galleryId" value={gallery.id} />
      <input type="hidden" name="gallerySlug" value={gallery.slug} />
      {exhibition ? <input type="hidden" name="id" value={exhibition.id} /> : null}

      <div className="section-head">
        <h1>{exhibition ? 'Edit exhibition' : 'New exhibition'}</h1>
      </div>

      <label className="field">
        <span>Title</span>
        <input name="exhibition_name" defaultValue={e.exhibition_name || ''} required />
      </label>
      <label className="field">
        <span>Artist(s)</span>
        <input name="artist" defaultValue={e.artist || ''} />
      </label>

      <div className="dashboard-form-grid">
        <label className="field">
          <span>Start date</span>
          <input name="start_date" type="date" defaultValue={e.start_date || ''} required />
        </label>
        <label className="field">
          <span>End date</span>
          <input name="end_date" type="date" defaultValue={e.end_date || ''} />
        </label>
      </div>

      <label className="field">
        <span>Opening information</span>
        <input name="opening_information" defaultValue={e.opening_information || ''} placeholder="Opening Thu 24 June 6–8 PM" />
      </label>

      <div className="dashboard-form-grid">
        <label className="field">
          <span>Cost</span>
          <input name="cost" defaultValue={e.cost || 'Free'} />
        </label>
        <label className="field">
          <span>Location (if different from gallery)</span>
          <input name="location" defaultValue={e.location || ''} />
        </label>
      </div>

      <label className="field">
        <span>Summary</span>
        <textarea name="summary" rows={5} defaultValue={e.summary || ''} />
      </label>

      <ImageUploadField name="image_url" galleryId={gallery.id} initialUrl={e.image_url || ''} label="Exhibition image" />

      <label className="checkbox-field">
        <input type="checkbox" name="published" defaultChecked={exhibition ? Boolean(e.published) : true} />
        <span>Published (visible on the public site)</span>
      </label>

      {state?.error ? <p className="admin-error">{state.error}</p> : null}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save exhibition'}
      </button>
    </form>
  )
}
