import { createServerSupabase } from '@/lib/supabase/server'

// Resolves the galleries the signed-in user owns/manages, via gallery_members (the access source of
// truth). Never trusts a client-supplied gallery id — membership is read under RLS from the user's JWT.
export async function getOwnedGalleries() {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { user: null, galleries: [] }

  // Filter by user_id explicitly: a super-admin's RLS would otherwise return ALL memberships.
  const { data: memberships } = await supabase.from('gallery_members').select('gallery_id, role').eq('user_id', user.id)
  const ids = (memberships || []).map((m) => m.gallery_id)
  if (!ids.length) return { user, galleries: [] }

  const { data: galleries } = await supabase
    .from('galleries')
    .select('*')
    .in('id', ids)
    .order('name', { ascending: true })

  return { user, galleries: galleries || [] }
}

export async function getOwnedGalleryById(galleryId) {
  const { user, galleries } = await getOwnedGalleries()
  const gallery = galleries.find((g) => g.id === galleryId) || null
  return { user, gallery }
}

export async function getGalleryExhibitions(galleryId) {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('admin_exhibitions')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('start_date', { ascending: false })
  return data || []
}

export async function getExhibitionForOwner(id) {
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('admin_exhibitions').select('*').eq('id', id).maybeSingle()
  return data || null
}
