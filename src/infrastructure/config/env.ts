export const env = {
  database: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'chamana_db_fase3',
    password: process.env.DB_PASSWORD || 'root',
    port: Number.parseInt(process.env.DB_PORT || '5432'),
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  app: {
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
};

// Validate required env vars in production (only at runtime, not during build)
// Skip validation during Next.js build phase - NEXT_PHASE is set during build
// We only validate when actually running the app in production, not during build
if (
  typeof window === 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  !process.env.NEXT_PHASE
) {
  if (!process.env.NEXTAUTH_SECRET) {
    console.error('❌ CRITICAL: NEXTAUTH_SECRET is required in production but not set');
    console.error('Set this in Vercel Dashboard → Settings → Environment Variables');
  }
  if (!process.env.DB_PASSWORD) {
    console.error('❌ CRITICAL: DB_PASSWORD is required in production but not set');
    console.error('Set this in Vercel Dashboard → Settings → Environment Variables');
  }
}
