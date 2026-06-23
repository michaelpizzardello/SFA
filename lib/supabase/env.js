// Central Supabase env access. Public (anon) values are exposed to the browser; the service-role
// key is server-only and must never be imported into a client component.

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

export function hasSupabasePublicConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

export function hasSupabaseServiceConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey())
}
