import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/'];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // API routes that require authentication
  if (pathname.startsWith('/api/')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      const payload = verifyToken(token);
      
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-email', payload.email);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // Dashboard routes that require authentication
  if (pathname.startsWith('/dashboard/')) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const payload = verifyToken(token);
      
      // Role-based access control for dashboard routes
      if (pathname.startsWith('/dashboard/user') && payload.role !== 'user') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      
      if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      
      if (pathname.startsWith('/dashboard/superadmin') && payload.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
