import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

// User-scoped Supabase client for Server Components, Route Handlers, and Server Actions.
// Reads/writes the auth session cookies, so all queries run under the signed-in user's JWT and
// are therefore subject to Row-Level Security. This is the client gallery dashboards must use for
// writes so RLS actually enforces tenant isolation.
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // In a Server Component render the cookie store is read-only; that's fine because
        // middleware refreshes the session. Swallow the error there.
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          /* called from a Server Component — session refresh handled in middleware */
        }
      }
    }
  })
}
