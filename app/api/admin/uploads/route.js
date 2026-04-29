import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminAuthenticated } from '../../../../lib/admin/auth'
import { uploadSupabaseAdminImage } from '../../../../lib/data/supabase'

function getFileExtension(filename) {
  const normalized = String(filename || '')
  const dotIndex = normalized.lastIndexOf('.')
  const extension = dotIndex >= 0 ? normalized.slice(dotIndex).toLowerCase() : ''

  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension)) {
    return extension
  }

  return '.jpg'
}

export async function POST(request) {
  const cookieStore = await cookies()

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed.' }, { status: 400 })
  }

  const extension = getFileExtension(file.name)
  const filename = `${randomUUID()}${extension}`
  const filePath = `${new Date().toISOString().slice(0, 10)}/${filename}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const imageUrl = await uploadSupabaseAdminImage({
    fileBuffer,
    contentType: file.type || 'image/jpeg',
    filePath
  })

  return NextResponse.json({
    imageUrl
  })
}
