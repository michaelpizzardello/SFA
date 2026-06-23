'use client'

import { useActionState } from 'react'
import { updateGalleryAction } from '@/lib/actions/galleries'
import ImageUploadField from './ImageUploadField'

export default function ProfileEditor({ gallery }) {
  const [state, formAction, pending] = useActionState(updateGalleryAction, {})
  const openingHours = Array.isArray(gallery.opening_hours) ? gallery.opening_hours.join('\n') : ''

  return (
    <form action={formAction} className="dashboard-form">
      <input type="hidden" name="galleryId" value={gallery.id} />
      <div className="section-head">
        <h1>Edit profile</h1>
      </div>

      <div className="dashboard-form-grid">
        <label className="field">
          <span>Gallery name</span>
          <input name="name" defaultValue={gallery.name || ''} required />
        </label>
        <label className="field">
          <span>Precinct</span>
          <input name="precinct" defaultValue={gallery.precinct || ''} />
        </label>
        <label className="field">
          <span>Suburb</span>
          <input name="suburb" defaultValue={gallery.suburb || ''} />
        </label>
        <label className="field">
          <span>Postcode</span>
          <input name="postcode" defaultValue={gallery.postcode || ''} />
        </label>
      </div>

      <label className="field">
        <span>Address</span>
        <input name="address" defaultValue={gallery.address || ''} />
      </label>

      <div className="dashboard-form-grid">
        <label className="field">
          <span>Latitude</span>
          <input name="latitude" type="number" step="any" defaultValue={gallery.latitude ?? ''} />
        </label>
        <label className="field">
          <span>Longitude</span>
          <input name="longitude" type="number" step="any" defaultValue={gallery.longitude ?? ''} />
        </label>
      </div>
      <p className="form-hint">
        Tip: find your coordinates on Google Maps (right-click your gallery → the lat/long appears at the top).
      </p>

      <div className="dashboard-form-grid">
        <label className="field">
          <span>Phone</span>
          <input name="phone" defaultValue={gallery.phone || ''} />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" defaultValue={gallery.email || ''} />
        </label>
        <label className="field">
          <span>Website</span>
          <input name="website" defaultValue={gallery.website || ''} placeholder="https://" />
        </label>
        <label className="field">
          <span>Instagram</span>
          <input name="instagram" defaultValue={gallery.instagram || ''} placeholder="https://instagram.com/…" />
        </label>
      </div>

      <label className="field">
        <span>Opening hours (one line per entry)</span>
        <textarea name="opening_hours" rows={4} defaultValue={openingHours} placeholder={'Tue–Fri 11–6\nSat 11–4'} />
      </label>

      <label className="field">
        <span>About</span>
        <textarea name="about" rows={5} defaultValue={gallery.about || ''} />
      </label>

      <div className="dashboard-form-grid">
        <ImageUploadField name="logo_url" galleryId={gallery.id} initialUrl={gallery.logo_url || ''} label="Logo" />
        <ImageUploadField
          name="cover_url"
          galleryId={gallery.id}
          initialUrl={gallery.cover_url || ''}
          label="Cover image"
          hint="Shown on your card in the galleries index."
        />
      </div>

      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      {state?.ok ? <p className="form-success">{state.message}</p> : null}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}
