import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { getSessionUser } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

// Serves both invite-acceptance and password-reset: the email link routes through /auth/callback,
// which establishes a session, then lands here to set a password.
export default async function ResetPasswordPage() {
  const user = await getSessionUser()

  return (
    <section className="admin-shell">
      <div className="admin-card">
        <div className="section-head">
          <h1>Set your password</h1>
        </div>
        {user ? (
          <>
            <p className="section-copy">Choose a password for {user.email}.</p>
            <ResetPasswordForm />
          </>
        ) : (
          <p className="section-copy">
            This link is invalid or has expired. <a className="text-link" href="/forgot-password">Request a new one.</a>
          </p>
        )}
      </div>
    </section>
  )
}
