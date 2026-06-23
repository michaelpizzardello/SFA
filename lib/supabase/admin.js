import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServiceRoleKey, getSupabaseUrl } from './env'

// Service-role client — BYPASSES Row-Level Security. Server-only.
// Use ONLY for:
//   * public SSR reads through the public_galleries / public_exhibitions views
//   * super-admin cross-tenant operations (invites, moderation, search tables)
//   * the legacy admin during transition
// Never use it for ordinary gallery-user writes — those must go through the user-scoped client so
// RLS enforces isolation.
export function createAdminSupabase() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}
