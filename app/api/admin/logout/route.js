import { NextResponse } from 'next/server'
import { getAdminCookieName } from '../../../../lib/admin/auth'

export async function POST(request) {
  const response = NextResponse.redirect(new URL('/admin', request.url))

  response.cookies.set({
    name: getAdminCookieName(),
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0)
  })

  return response
}
