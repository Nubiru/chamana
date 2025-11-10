import { NextResponse } from 'next/server';

// This endpoint doesn't import env.ts to avoid validation errors
export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      AUTH_SECRET: process.env.AUTH_SECRET ? 'SET (length: ' + process.env.AUTH_SECRET.length + ')' : 'NOT_SET',
      AUTH_URL: process.env.AUTH_URL || 'NOT_SET',
      DB_USER: process.env.DB_USER || 'NOT_SET',
      DB_HOST: process.env.DB_HOST || 'NOT_SET',
      DB_PORT: process.env.DB_PORT || 'NOT_SET',
      DB_DATABASE: process.env.DB_DATABASE || 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET (length: ' + process.env.DB_PASSWORD.length + ')' : 'NOT_SET',
    },
  });
}
