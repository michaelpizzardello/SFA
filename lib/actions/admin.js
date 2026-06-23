'use server'

import { redirect } from 'next/navigation'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { requireSuperAdmin, AuthError } from '@/lib/auth/roles'
import { getSiteOrigin } from '@/lib/utils/site'

// Super-admin: invite a gallery owner by email and link them to a gallery.
// Idempotent: re-inviting an already-linked gallery just re-sends/re-affirms. For a pre-existing
// auth account we attach membership (this is an explicit admin action, not anonymous self-signup).
export async function inviteGalleryAction(prevState, formData) {
  try {
    await requireSuperAdmin()
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    throw error
  }

  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()
  const galleryId = String(formData.get('galleryId') || '')

  if (!email || !galleryId) {
    return { error: 'Email and gallery are required.' }
  }

  const admin = createAdminSupabase()
  const origin = await getSiteOrigin()

  let userId
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`
  })

  if (inviteError) {
    // Existing account -> find it and attach membership instead of failing.
    if (/registered|already|exists|422/i.test(inviteError.message)) {
      const { data: list } = await admin.auth.admin.listUsers()
      const existing = (list?.users || []).find(
        (u) => (u.email || '').toLowerCase() === email
      )
      if (!existing) return { error: inviteError.message }
      userId = existing.id
    } else {
      return { error: inviteError.message }
    }
  } else {
    userId = invited?.user?.id
  }

  if (!userId) {
    return { error: 'Could not create or locate the user.' }
  }

  const { error: memberError } = await admin
    .from('gallery_members')
    .upsert({ gallery_id: galleryId, user_id: userId, role: 'owner' }, { onConflict: 'gallery_id,user_id' })
  if (memberError) {
    return { error: memberError.message }
  }

  await admin.from('galleries').update({ owner_id: userId }).eq('id', galleryId)

  return { ok: true, message: `Invitation sent to ${email}.` }
}

// Moderation: super-admin hide/unhide. Uses the service-role client (auth.uid() null => guard treats
// it as privileged, so hidden_by_admin is writable). Gated by requireSuperAdmin.
export async function setGalleryHiddenAction(formData) {
  await requireSuperAdmin()
  const id = String(formData.get('id') || '')
  const hidden = formData.get('hidden') === 'true'
  if (id) {
    const admin = createAdminSupabase()
    await admin.from('galleries').update({ hidden_by_admin: hidden }).eq('id', id)
  }
  redirect('/console/galleries')
}

export async function setExhibitionHiddenAction(formData) {
  await requireSuperAdmin()
  const id = String(formData.get('id') || '')
  const hidden = formData.get('hidden') === 'true'
  if (id) {
    const admin = createAdminSupabase()
    await admin.from('admin_exhibitions').update({ hidden_by_admin: hidden }).eq('id', id)
  }
  redirect('/console/exhibitions')
}
