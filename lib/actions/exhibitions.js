'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'
import { PUBLIC_SITE_DATA_CACHE_TAG } from '@/lib/data/cache'
import { slugify } from '@/lib/utils/slug'

function str(formData, key) {
  return String(formData.get(key) || '').trim()
}

function dateOrNull(formData, key) {
  const v = str(formData, key)
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
}

function randomSuffix() {
  // server-only; avoids Math.random determinism concerns for slugs
  return Math.random().toString(36).slice(2, 6)
}

export async function saveExhibitionAction(prevState, formData) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You are not signed in.' }

  const id = str(formData, 'id')
  const galleryId = str(formData, 'galleryId')
  const title = str(formData, 'exhibition_name')
  const startDate = dateOrNull(formData, 'start_date')

  if (!galleryId) return { error: 'Missing gallery.' }
  if (!title) return { error: 'Exhibition name is required.' }
  if (!startDate) return { error: 'A valid start date is required.' }

  // gallery_slug / gallery_name / gallery_mode are derived by the guard trigger from gallery_id.
  const payload = {
    gallery_id: galleryId,
    exhibition_name: title,
    artist: str(formData, 'artist'),
    summary: str(formData, 'summary'),
    start_date: startDate,
    end_date: dateOrNull(formData, 'end_date'),
    opening_information: str(formData, 'opening_information'),
    image_url: str(formData, 'image_url'),
    cost: str(formData, 'cost') || 'Free',
    location: str(formData, 'location'),
    published: formData.get('published') === 'on' || formData.get('published') === 'true'
  }

  if (id) {
    const { error } = await supabase.from('admin_exhibitions').update(payload).eq('id', id)
    if (error) return { error: error.message }
  } else {
    // exhibition slug is NOT NULL + unique and is NOT derived by the trigger — generate it here.
    const gallerySlug = str(formData, 'gallerySlug') || 'gallery'
    let lastError
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const base = slugify(`${gallerySlug}-${title}`) || `exhibition-${randomSuffix()}`
      const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`
      const { error } = await supabase.from('admin_exhibitions').insert({ ...payload, slug })
      if (!error) {
        lastError = null
        break
      }
      lastError = error
      if (!/duplicate|unique/i.test(error.message)) break
    }
    if (lastError) return { error: lastError.message }
  }

  updateTag(PUBLIC_SITE_DATA_CACHE_TAG)
  redirect('/dashboard/exhibitions')
}

export async function deleteExhibitionAction(formData) {
  const supabase = await createServerSupabase()
  const id = String(formData.get('id') || '')
  if (id) {
    const { error } = await supabase.from('admin_exhibitions').delete().eq('id', id)
    if (!error) updateTag(PUBLIC_SITE_DATA_CACHE_TAG)
  }
  redirect('/dashboard/exhibitions')
}

export async function togglePublishAction(formData) {
  const supabase = await createServerSupabase()
  const id = String(formData.get('id') || '')
  const next = formData.get('published') === 'true'
  if (id) {
    const { error } = await supabase.from('admin_exhibitions').update({ published: next }).eq('id', id)
    if (!error) updateTag(PUBLIC_SITE_DATA_CACHE_TAG)
  }
  redirect('/dashboard/exhibitions')
}
