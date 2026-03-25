import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // No token = not logged in
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Token exists but role is not ADMIN
    if (token.role !== 'ADMIN') {
      console.warn(`Access denied: user ${token.email} with role ${token.role} tried to access admin`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // User has ADMIN role, allow access
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}