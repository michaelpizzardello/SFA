import { headers } from 'next/headers'

// Absolute origin for building auth redirect URLs (invite/reset links). Prefers an explicit
// NEXT_PUBLIC_SITE_URL, falls back to the forwarded host headers, then localhost.
export async function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host')
  const proto = headerList.get('x-forwarded-proto') || 'https'
  return host ? `${proto}://${host}` : 'http://localhost:3000'
}
