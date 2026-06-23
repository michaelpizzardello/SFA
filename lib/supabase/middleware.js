import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

// Refreshes the Supabase auth session on every matched request and returns the current user plus
// the response carrying refreshed session cookies. Callers must return `supabaseResponse` (or copy
// its cookies onto a redirect) so the browser stays in sync — this is the @supabase/ssr contract.
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    return { user: null, supabaseResponse }
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      }
    }
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  return { user, supabaseResponse }
}
