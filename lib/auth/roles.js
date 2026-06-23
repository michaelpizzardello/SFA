import { createServerSupabase } from '../supabase/server'

// Auth/role helpers for Server Components, Route Handlers, and Server Actions.
// Always uses the user-scoped client (getUser() validates the JWT with the auth server).

export async function getSessionUser() {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user || null
}

// Super-admin is carried in the tamper-proof app_metadata claim (set server-side via the Admin API),
// mirroring the database's public.is_super_admin().
export function isSuperAdminUser(user) {
  return Boolean(user && user.app_metadata && user.app_metadata.role === 'super_admin')
}

export async function getAuthContext() {
  const user = await getSessionUser()
  return { user, isSuperAdmin: isSuperAdminUser(user) }
}

// Throwing guards for use inside route handlers / server actions.
export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

export async function requireUser() {
  const user = await getSessionUser()
  if (!user) {
    throw new AuthError('Authentication required', 401)
  }
  return user
}

export async function requireSuperAdmin() {
  const user = await requireUser()
  if (!isSuperAdminUser(user)) {
    throw new AuthError('Super-admin privileges required', 403)
  }
  return user
}
