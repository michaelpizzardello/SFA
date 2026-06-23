'use client'

import { useActionState } from 'react'
import { inviteGalleryAction } from '@/lib/actions/admin'

export default function InviteGalleryForm({ galleries }) {
  const [state, formAction, pending] = useActionState(inviteGalleryAction, {})

  return (
    <form action={formAction} className="dashboard-form">
      <h2>Invite a gallery</h2>
      <label className="field">
        <span>Gallery</span>
        <select name="galleryId" required defaultValue="">
          <option value="" disabled>
            Choose a gallery…
          </option>
          {galleries.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
              {g.is_claimed ? ' (claimed)' : ''}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Owner email</span>
        <input name="email" type="email" required placeholder="owner@gallery.com" />
      </label>
      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      {state?.ok ? <p className="form-success">{state.message}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send invite'}
      </button>
    </form>
  )
}
