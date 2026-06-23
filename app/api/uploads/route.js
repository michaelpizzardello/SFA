import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createServerSupabase } from '@/lib/supabase/server'

const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif'
}

// Magic-number sniff so a renamed/forged MIME can't slip through.
function sniff(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp'
  return null
}

export async function POST(request) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  const galleryId = String(form.get('galleryId') || '')

  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  if (!galleryId) return NextResponse.json({ error: 'Missing gallery.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image must be under 6 MB.' }, { status: 400 })

  // Confirm the user actually manages this gallery (RLS would also block the upload path).
  const { data: membership } = await supabase
    .from('gallery_members')
    .select('gallery_id')
    .eq('gallery_id', galleryId)
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = sniff(buffer)
  if (!detected) return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 })

  const ext = Object.keys(ALLOWED).find((e) => ALLOWED[e] === detected) || 'jpg'
  const path = `gallery/${galleryId}/${randomUUID()}.${ext}`

  // Uses the user-JWT storage client -> storage RLS enforces the gallery/{id}/ prefix.
  const { error } = await supabase.storage
    .from('exhibition-images')
    .upload(path, buffer, { contentType: detected, upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const {
    data: { publicUrl }
  } = supabase.storage.from('exhibition-images').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl })
}
