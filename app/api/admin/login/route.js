import { NextResponse } from 'next/server'
import { getAdminCookieName, getAdminSessionValue, isValidAdminPassword } from '../../../../lib/admin/auth'

export async function POST(request) {
  const formData = await request.formData()
  const password = String(formData.get('password') || '')
  const redirectTo = String(formData.get('redirectTo') || '/admin')

  if (!isValidAdminPassword(password)) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url))
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url))

  response.cookies.set({
    name: getAdminCookieName(),
    value: getAdminSessionValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })

  return response
}
