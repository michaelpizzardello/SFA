'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

// Browser Supabase client for client components (e.g. login form, live form state).
// Anon key + the user's session; subject to RLS.
let browserClient

export function createBrowserSupabase() {
  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return browserClient
}
