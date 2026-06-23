import LoginForm from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }) {
  const params = (await searchParams) || {}
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : '/dashboard'

  return (
    <section className="admin-shell">
      <div className="admin-card">
        <div className="section-head">
          <h1>Gallery sign in</h1>
        </div>
        <p className="section-copy">Sign in to manage your gallery profile and exhibitions.</p>
        {params.error ? <p className="admin-error">We couldn&apos;t sign you in. Please try again.</p> : null}
        <LoginForm redirectTo={redirectTo} />
      </div>
    </section>
  )
}
