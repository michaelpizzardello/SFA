import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminAuthenticated } from '../../../../../lib/admin/auth'
import { loadAdminStore } from '../../../../../lib/admin/store'
import { buildFeaturedExportCsv } from '../../../../../lib/admin/export'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request) {
  const cookieStore = await cookies()

  if (!isAdminAuthenticated(cookieStore)) {
    return unauthorizedResponse()
  }

  const { searchParams } = new URL(request.url)
  const weekStart = String(searchParams.get('weekStart') || '')
  const weekEnd = String(searchParams.get('weekEnd') || '')

  const adminStore = await loadAdminStore()
  const featuredRecords = adminStore.exhibitions.filter(
    (record) => record.featured && record.weekStart === weekStart && record.weekEnd === weekEnd
  )

  const csv = buildFeaturedExportCsv(featuredRecords)

  return new NextResponse(csv ? `${csv}\r\n` : '', {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="featured-exhibitions-${weekStart || 'export'}.csv"`,
      'Cache-Control': 'no-store'
    }
  })
}
