'use client'

import { useActionState } from 'react'
import { updatePasswordAction } from '@/lib/actions/auth'

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, {})

  return (
    <form action={formAction} className="admin-form-stack">
      <label className="field">
        <span>New password</span>
        <input name="password" type="password" required autoComplete="new-password" minLength={8} />
      </label>
      <label className="field">
        <span>Confirm password</span>
        <input name="confirm" type="password" required autoComplete="new-password" minLength={8} />
      </label>
      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Set password'}
      </button>
    </form>
  )
}
