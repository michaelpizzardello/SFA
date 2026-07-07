'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { updateGalleryAction } from '@/lib/actions/galleries'
import ImageUploadField from './ImageUploadField'

export default function ProfileEditor({ gallery }) {
  const [state, formAction, pending] = useActionState(updateGalleryAction, {})
  const openingHours = Array.isArray(gallery.opening_hours) ? gallery.opening_hours.join('\n') : ''

  return (
    <form action={formAction} className="dash-form dash-form--settings">
      <input type="hidden" name="galleryId" value={gallery.id} />
      <Link className="dash-form__back" href="/dashboard">
        ← Dashboard
      </Link>
      <h1 className="dash-form__title">Edit profile</h1>

      <section className="dash-section">
        <div className="dash-section__head">
          <h3 className="dash-section__title">Identity</h3>
          <p className="dash-section__hint">How your gallery is named and grouped on Sydney Art Finder.</p>
        </div>
        <div className="dash-section__fields">
          <label className="field">
            <span>Gallery name</span>
            <input name="name" defaultValue={gallery.name || ''} required />
          </label>
          <label className="field">
            <span>Precinct</span>
            <input name="precinct" defaultValue={gallery.precinct || ''} placeholder="e.g. Surry Hills" />
          </label>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section__head">
          <h3 className="dash-section__title">Location</h3>
          <p className="dash-section__hint">
            Your address and the map pin. Find coordinates on Google Maps — right-click your gallery and the
            lat/long appears at the top.
          </p>
        </div>
        <div className="dash-section__fields">
          <label className="field">
            <span>Address</span>
            <input name="address" defaultValue={gallery.address || ''} />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Suburb</span>
              <input name="suburb" defaultValue={gallery.suburb || ''} />
            </label>
            <label className="field">
              <span>Postcode</span>
              <input name="postcode" defaultValue={gallery.postcode || ''} />
            </label>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Latitude</span>
              <input name="latitude" inputMode="decimal" defaultValue={gallery.latitude ?? ''} />
            </label>
            <label className="field">
              <span>Longitude</span>
              <input name="longitude" inputMode="decimal" defaultValue={gallery.longitude ?? ''} />
            </label>
          </div>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section__head">
          <h3 className="dash-section__title">Contact</h3>
          <p className="dash-section__hint">Links shown on your public profile.</p>
        </div>
        <div className="dash-section__fields">
          <div className="form-grid">
            <label className="field">
              <span>Phone</span>
              <input name="phone" defaultValue={gallery.phone || ''} />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" defaultValue={gallery.email || ''} />
            </label>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Website</span>
              <input name="website" defaultValue={gallery.website || ''} placeholder="https://" />
            </label>
            <label className="field">
              <span>Instagram</span>
              <input name="instagram" defaultValue={gallery.instagram || ''} placeholder="https://instagram.com/…" />
            </label>
          </div>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section__head">
          <h3 className="dash-section__title">Hours &amp; about</h3>
          <p className="dash-section__hint">Opening hours (one line each) and a short description of your gallery.</p>
        </div>
        <div className="dash-section__fields">
          <label className="field">
            <span>Opening hours</span>
            <textarea name="opening_hours" rows={4} defaultValue={openingHours} placeholder={'Tue–Fri 11–6\nSat 11–4'} />
          </label>
          <label className="field">
            <span>About</span>
            <textarea name="about" rows={5} defaultValue={gallery.about || ''} />
          </label>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-section__head">
          <h3 className="dash-section__title">Images</h3>
          <p className="dash-section__hint">A cover photo of your space leads your card and profile.</p>
        </div>
        <div className="dash-section__fields">
          <ImageUploadField
            name="cover_url"
            galleryId={gallery.id}
            initialUrl={gallery.cover_url || ''}
            label="Cover image"
            hint="Shown on your card in the galleries index. Landscape (3:2) works best."
          />
        </div>
      </section>

      <div role="status" aria-live="polite">
        {state?.error ? <p className="field-error">{state.error}</p> : null}
        {state?.ok ? <p className="dash-ok">{state.message}</p> : null}
      </div>

      <div className="dash-form-bar">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </button>
        <Link className="btn btn--text" href={`/gallery/${gallery.slug}`}>
          View public page
        </Link>
      </div>
    </form>
  )
}
