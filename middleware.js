import { NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

// Coarse auth gate. Fine-grained authorization is enforced by RLS in the database and by per-action
// role checks; this just keeps unauthenticated users out of the gallery dashboard and refreshes the
// session cookie. The legacy /admin (HMAC) route is intentionally NOT gated here — it manages its
// own auth until the Phase 4 cutover.
export async function middleware(request) {
  const { user, supabaseResponse } = await updateSession(request)
  const { pathname } = request.nextUrl

  function redirectTo(pathnameTarget, withReturn) {
    const url = request.nextUrl.clone()
    url.pathname = pathnameTarget
    url.search = ''
    if (withReturn) url.searchParams.set('redirectTo', pathname)
    const redirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (pathname.startsWith('/dashboard') && !user) {
    return redirectTo('/login', true)
  }

  if (pathname.startsWith('/console')) {
    if (!user) return redirectTo('/login', true)
    const isSuperAdmin = user.app_metadata && user.app_metadata.role === 'super_admin'
    if (!isSuperAdmin) return redirectTo('/dashboard', false)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // everything except Next internals and static asset files
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|css|js|map)$).*)'
  ]
}
