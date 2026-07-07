'use client'

import { useActionState } from 'react'
import { requestPasswordResetAction } from '@/lib/actions/auth'

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, {})

  if (state?.ok) {
    return (
      <p className="auth-copy">
        If an account exists for that email, we&apos;ve sent a link to reset your password.
      </p>
    )
  }

  return (
    <form action={formAction} className="form-stack">
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <div role="status" aria-live="polite">
        {state?.error ? <p className="field-error">{state.error}</p> : null}
      </div>
      <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
      <a className="action-link" href="/login">
        Back to sign in
      </a>
    </form>
  )
}
