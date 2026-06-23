'use client'

import { useActionState } from 'react'
import { signInAction } from '@/lib/actions/auth'

export default function LoginForm({ redirectTo = '/dashboard' }) {
  const [state, formAction, pending] = useActionState(signInAction, {})

  return (
    <form action={formAction} className="admin-form-stack">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      <a className="text-link" href="/forgot-password">
        Forgot your password?
      </a>
    </form>
  )
}
