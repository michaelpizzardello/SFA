import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="page-block">
      <h1>Page not found</h1>
      <p className="section-copy">The page you requested does not exist.</p>
      <Link className="button button-primary" href="/">
        Back home
      </Link>
    </section>
  )
}
