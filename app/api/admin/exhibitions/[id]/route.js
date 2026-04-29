import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteAdminExhibition, updateAdminExhibition } from '../../../../../lib/admin/store'
import { isAdminAuthenticated } from '../../../../../lib/admin/auth'
import { loadGalleryDirectoryData } from '../../../../../lib/data/loadData'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function PUT(request, context) {
  const cookieStore = await cookies()

  if (!isAdminAuthenticated(cookieStore)) {
    return unauthorizedResponse()
  }

  const { id } = await context.params
  const body = await request.json()
  const galleryDirectory = await loadGalleryDirectoryData()

  try {
    const record = await updateAdminExhibition(id, body, galleryDirectory.galleries)
    return NextResponse.json({ record })
  } catch (error) {
    const status = error.message === 'Exhibition not found.' ? 404 : 400
    return NextResponse.json({ error: error.message || 'Failed to update exhibition.' }, { status })
  }
}

export async function DELETE(request, context) {
  const cookieStore = await cookies()

  if (!isAdminAuthenticated(cookieStore)) {
    return unauthorizedResponse()
  }

  const { id } = await context.params

  try {
    await deleteAdminExhibition(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete exhibition.' }, { status: 400 })
  }
}
