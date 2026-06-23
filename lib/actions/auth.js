'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { getSiteOrigin } from '@/lib/utils/site'

function safeRedirectPath(value, fallback = '/dashboard') {
  const path = String(value || '')
  // only allow same-site absolute paths to avoid open-redirects
  return path.startsWith('/') && !path.startsWith('//') ? path : fallback
}

export async function signInAction(prevState, formData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const redirectTo = safeRedirectPath(formData.get('redirectTo'))

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: 'Incorrect email or password.' }
  }

  redirect(redirectTo)
}

export async function signOutAction() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordResetAction(prevState, formData) {
  const email = String(formData.get('email') || '').trim()
  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createServerSupabase()
  const origin = await getSiteOrigin()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`
  })

  // Always report success to avoid leaking which emails are registered.
  return { ok: true }
}

export async function updatePasswordAction(prevState, formData) {
  const password = String(formData.get('password') || '')
  const confirm = String(formData.get('confirm') || '')

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Your link has expired or is invalid. Request a new one.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  // First successful password set on an invited account = the gallery is now claimed.
  // is_claimed is guard-pinned for ordinary users, so flip it with the service-role client.
  try {
    const admin = createAdminSupabase()
    const { data: memberships } = await admin
      .from('gallery_members')
      .select('gallery_id')
      .eq('user_id', user.id)
    const galleryIds = (memberships || []).map((m) => m.gallery_id)
    if (galleryIds.length) {
      await admin.from('galleries').update({ is_claimed: true }).in('id', galleryIds)
    }
  } catch {
    /* non-fatal: claiming is a convenience flag, password was already set */
  }

  redirect('/dashboard')
}
