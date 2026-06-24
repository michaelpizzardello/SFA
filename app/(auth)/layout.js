import Link from 'next/link'

// Auth routes have no public header/footer (SiteNav/SiteFooter return null), so the brand lives here —
// gives the page identity and a way back to the public site.
export default function AuthLayout({ children }) {
  return (
    <div className="admin-shell">
      <div className="admin-card">
        <Link className="admin-brand" href="/">
          Sydney Art Finder
        </Link>
        {children}
      </div>
    </div>
  )
}
