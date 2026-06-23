import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  return (
    <section className="admin-shell">
      <div className="admin-card">
        <div className="section-head">
          <h1>Reset password</h1>
        </div>
        <p className="section-copy">Enter your email and we&apos;ll send you a link to set a new password.</p>
        <ForgotPasswordForm />
      </div>
    </section>
  )
}
