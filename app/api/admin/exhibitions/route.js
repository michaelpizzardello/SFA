import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminAuthenticated } from '../../../../lib/admin/auth'
import { createAdminExhibition } from '../../../../lib/admin/store'
import { loadGalleryDirectoryData } from '../../../../lib/data/loadData'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request) {
  const cookieStore = await cookies()

  if (!isAdminAuthenticated(cookieStore)) {
    return unauthorizedResponse()
  }

  const body = await request.json()
  const galleryDirectory = await loadGalleryDirectoryData()

  try {
    const record = await createAdminExhibition(body, galleryDirectory.galleries)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to create exhibition.' }, { status: 400 })
  }
}
