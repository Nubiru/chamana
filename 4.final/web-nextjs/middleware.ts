/**
 * Next.js Edge Middleware
 * Handles CORS, rate limiting, and security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in-memory, replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Add production origins here
];

function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get client IP
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Apply CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // CORS headers
    const requestOrigin = request.headers.get('origin');
    if (
      requestOrigin &&
      (ALLOWED_ORIGINS.includes(requestOrigin) || process.env.NODE_ENV === 'development')
    ) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );

    // Rate limiting (stricter for procedures)
    const limit = pathname.includes('/procedures/') ? 30 : 100;
    const windowMs = pathname.includes('/procedures/') ? 60000 : 60000;

    if (!checkRateLimit(ip, limit, windowMs)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
