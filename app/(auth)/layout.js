import Link from 'next/link'

// Auth routes have no public header/footer (SiteNav/SiteFooter return null), so the brand lives here —
// gives the page identity and a way back to the public site.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-col">
        <Link className="auth-brand" href="/">
          Sydney Art Finder
        </Link>
        {children}
      </div>
    </div>
  )
}
