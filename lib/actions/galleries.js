'use server'

import { updateTag } from 'next/cache'
import { PUBLIC_SITE_DATA_CACHE_TAG } from '@/lib/data/cache'
import { createServerSupabase } from '@/lib/supabase/server'

// Text fields an owner may edit. slug / owner_id / is_claimed / hidden_by_admin are pinned by the
// guard_gallery trigger regardless, but we also never send them — defense in depth.
const TEXT_FIELDS = [
  'name',
  'precinct',
  'suburb',
  'postcode',
  'address',
  'website',
  'instagram',
  'phone',
  'email',
  'about',
  'logo_url',
  'cover_url'
]

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function updateGalleryAction(prevState, formData) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You are not signed in.' }

  const galleryId = String(formData.get('galleryId') || '')
  if (!galleryId) return { error: 'Missing gallery.' }
  if (!String(formData.get('name') || '').trim()) return { error: 'Gallery name is required.' }

  const payload = {}
  for (const field of TEXT_FIELDS) {
    const value = formData.get(field)
    if (value !== null) payload[field] = String(value).trim()
  }
  payload.latitude = toNumberOrNull(formData.get('latitude'))
  payload.longitude = toNumberOrNull(formData.get('longitude'))
  payload.opening_hours = String(formData.get('opening_hours') || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  // RLS (member_update) + guard_gallery ensure this only ever touches the user's own gallery
  // and never the protected columns.
  const { error } = await supabase.from('galleries').update(payload).eq('id', galleryId)
  if (error) return { error: error.message }

  updateTag(PUBLIC_SITE_DATA_CACHE_TAG)
  return { ok: true, message: 'Profile saved.' }
}
