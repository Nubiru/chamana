/**
 * Authentication Types
 *
 * Defines types for JWT payload, user roles, and authentication context.
 */

export type UserRole = 'admin' | 'customer' | 'artisan' | 'guest';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
