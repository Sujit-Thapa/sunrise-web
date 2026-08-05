import { NextResponse, type NextRequest } from 'next/server';

import { AUTH_TOKEN_COOKIE } from '@/lib/auth-constants';
import { getRoleHomePath, normalizeUserRole } from '@/lib/auth-routing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const GUARDED_PREFIXES = ['/admin', '/agent'];

function isPathUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(url);
}

async function getCurrentUserRole(token: string) {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) return null;

  const payload = await response.json().catch(() => null);
  const user = payload?.success === true && 'data' in payload ? payload.data : payload;

  return normalizeUserRole(user?.role);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isGuardedPath = GUARDED_PREFIXES.some((prefix) => isPathUnder(pathname, prefix));
  const isAuthPath = isPathUnder(pathname, '/auth/login') || isPathUnder(pathname, '/auth/signup');

  if (!isGuardedPath && !isAuthPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return isGuardedPath ? loginRedirect(request) : NextResponse.next();
  }

  const role = await getCurrentUserRole(token);

  if (!role) {
    const response = isGuardedPath ? loginRedirect(request) : NextResponse.next();
    response.cookies.delete(AUTH_TOKEN_COOKIE);
    return response;
  }

  const roleHome = getRoleHomePath(role);

  if (isAuthPath) {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (role === 'user') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (
    (role === 'admin' && isPathUnder(pathname, '/agent')) ||
    (role === 'agent' && isPathUnder(pathname, '/admin'))
  ) {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/agent/:path*', '/auth/login', '/auth/signup'],
};
