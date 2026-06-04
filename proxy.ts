import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/_lib/session';
import { randomUUID } from 'crypto';
import { CSRF_COOKIE_NAME } from './_types';

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = path.startsWith('/dashboard');
  const isAdminRoute = path.startsWith('/dashboard/admins');
  const isPublicRoute = ['/login', '/', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(path);

  const session = await updateSession();
  const userId = session?.userId;
  const userRole = session?.role;

  let response: NextResponse;

  if (!userId && isProtectedRoute) {
    response = NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(path)}`, req.nextUrl)
    );
  } else if (userId && isPublicRoute && path !== '/' && !path.startsWith('/dashboard')) {
    response = NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  } else if (isAdminRoute && userRole !== 'ADMIN') {
    response = NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  } else {
    response = NextResponse.next();
  }

  const existingCsrfToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!existingCsrfToken) {
    const newCsrfToken = randomUUID();
    response.cookies.set(CSRF_COOKIE_NAME, newCsrfToken, {
      httpOnly: false, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|videos/).*)']
}