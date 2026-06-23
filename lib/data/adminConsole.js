import { createAdminSupabase } from '@/lib/supabase/admin'

// Super-admin reads: service-role sees everything (incl. hidden/draft rows) for moderation + onboarding.
// Callers MUST be gated by requireSuperAdmin at the page/action level.

export async function getAllGalleries() {
  const admin = createAdminSupabase()
  const { data } = await admin
    .from('galleries')
    .select('id, slug, name, precinct, hidden_by_admin, is_claimed, owner_id')
    .order('name', { ascending: true })
  return data || []
}

export async function getAllExhibitions() {
  const admin = createAdminSupabase()
  const { data } = await admin
    .from('admin_exhibitions')
    .select('id, exhibition_name, gallery_name, start_date, published, hidden_by_admin, source')
    .order('start_date', { ascending: false })
    .limit(500)
  return data || []
}
