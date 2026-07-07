'use client'

import { useActionState } from 'react'
import { inviteGalleryAction } from '@/lib/actions/admin'

export default function InviteGalleryForm({ galleries }) {
  const [state, formAction, pending] = useActionState(inviteGalleryAction, {})

  return (
    <form action={formAction} className="con-invite form-stack">
      <h2 className="con-invite__title">Invite a gallery</h2>
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
      <p className="field-hint">
        Emails an invitation link. The recipient can claim this gallery and manage its profile and exhibitions.
      </p>
      <button className="btn btn--primary con-invite__submit" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send invite'}
      </button>
      <div role="status" aria-live="polite">
        {state?.error ? <p className="field-error">{state.error}</p> : null}
        {state?.ok ? <p className="con-ok">{state.message}</p> : null}
      </div>
    </form>
  )
}
