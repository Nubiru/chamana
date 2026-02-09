/**
 * Authentication Middleware
 *
 * Provides JWT-based authentication and role-based access control for API routes.
 * Protects routes based on authentication status and user roles.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import type { AuthUser, UserRole } from './types';

export interface AuthRequest extends NextRequest {
  user?: AuthUser;
}

export type AuthHandler = (
  request: AuthRequest,
  context?: { user: AuthUser }
) => Promise<Response> | Response;

export type RoleHandler = (
  request: AuthRequest,
  context?: { user: AuthUser }
) => Promise<Response> | Response;

/**
 * Extract JWT token from Authorization header
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Authenticate request and attach user to request object
 */
export function authenticate(request: NextRequest): AuthUser | null {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Middleware wrapper that requires authentication
 */
export function requireAuth(handler: AuthHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const user = authenticate(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const authRequest = request as AuthRequest;
    authRequest.user = user;

    return handler(authRequest, { user });
  };
}

/**
 * Middleware wrapper that requires specific role(s)
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (handler: RoleHandler) => {
    return async (request: NextRequest): Promise<Response> => {
      const user = authenticate(request);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            message: 'Authentication required',
          },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          },
          { status: 403 }
        );
      }

      const authRequest = request as AuthRequest;
      authRequest.user = user;

      return handler(authRequest, { user });
    };
  };
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(handler: AuthHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const user = authenticate(request);
    const authRequest = request as AuthRequest;
    authRequest.user = user || undefined;

    return handler(authRequest, user ? { user } : undefined);
  };
}

/**
 * Helper to check if user has required role
 */
export function hasRole(user: AuthUser | null | undefined, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Helper to check if user has any of the required roles
 */
export function hasAnyRole(user: AuthUser | null | undefined, roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Helper to check if user is admin
 */
export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === 'admin';
}
