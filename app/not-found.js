import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container section">
      <h1 className="u-page-title">Page not found</h1>
      <div className="empty-state">
        <p>The page you requested does not exist.</p>
        <Link className="action-link" href="/">
          Back home
        </Link>
      </div>
    </section>
  )
}
