import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { getSessionUser } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

// Serves both invite-acceptance and password-reset: the email link routes through /auth/callback,
// which establishes a session, then lands here to set a password.
export default async function ResetPasswordPage() {
  const user = await getSessionUser()

  return (
    <>
      <h1 className="auth-title">Set your password</h1>
      {user ? (
        <>
          <p className="auth-copy">Choose a password for {user.email}.</p>
          <ResetPasswordForm />
        </>
      ) : (
        <p className="auth-copy">
          This link is invalid or has expired. <a href="/forgot-password">Request a new one.</a>
        </p>
      )}
    </>
  )
}
