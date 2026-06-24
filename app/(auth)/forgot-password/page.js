import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  return (
    <>
      <h1>Reset password</h1>
      <p className="section-copy">Enter your email and we&apos;ll send you a link to set a new password.</p>
      <ForgotPasswordForm />
    </>
  )
}
