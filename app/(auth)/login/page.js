import { redirect } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import { getSessionUser } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }) {
  const params = (await searchParams) || {}
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : '/dashboard'

  // Already signed in → go straight to the dashboard (no confusing "sign in" form).
  if (await getSessionUser()) {
    redirect(redirectTo)
  }

  return (
    <>
      <h1 className="auth-title">Gallery sign in</h1>
      <p className="auth-copy">Sign in to manage your gallery profile and exhibitions.</p>
      {params.error ? <p className="field-error">We couldn&apos;t sign you in. Please try again.</p> : null}
      <LoginForm redirectTo={redirectTo} />
    </>
  )
}
