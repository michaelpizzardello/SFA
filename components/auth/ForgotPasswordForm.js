'use client'

import { useActionState } from 'react'
import { requestPasswordResetAction } from '@/lib/actions/auth'

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, {})

  if (state?.ok) {
    return (
      <p className="section-copy">
        If an account exists for that email, we&apos;ve sent a link to reset your password.
      </p>
    )
  }

  return (
    <form action={formAction} className="admin-form-stack">
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
      <a className="text-link" href="/login">
        Back to sign in
      </a>
    </form>
  )
}
