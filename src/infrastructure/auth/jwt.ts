/**
 * JWT Utilities
 *
 * Simple JWT encoding/decoding for authentication.
 * Uses base64url encoding (not cryptographically secure - for development only).
 * In production, use a proper JWT library like jsonwebtoken.
 */

import { env } from '../config/env';
import type { JWTPayload } from './types';

const SECRET = env.auth.secret;

/**
 * Simple base64url encoding (for development)
 * In production, use proper JWT library with HMAC signing
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Sign a JWT token
 * Note: This is a simplified implementation for development.
 * In production, use a proper JWT library with cryptographic signing.
 */
export function signToken(payload: JWTPayload, expiresIn = '7d'): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = expiresIn === 'never' ? undefined : now + parseExpiresIn(expiresIn);

  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));

  // In production, this should be HMAC-SHA256 signature
  // For development, we'll use a simple hash of the secret
  const signature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${SECRET}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature (simplified for development)
    const expectedSignature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${SECRET}`);
    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Parse expiresIn string to seconds
 */
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // Default: 7 days
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}
