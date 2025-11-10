import { Pool, type PoolConfig, QueryResult } from 'pg';
import { env } from '../config/env';

const poolConfig: PoolConfig = {
  user: env.database.user,
  password: env.database.password,
  host: env.database.host,
  port: env.database.port,
  database: env.database.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: env.app.isProd ? { rejectUnauthorized: false } : false,
};

// Create singleton pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
    });
  }

  return pool;
}

// Helper to execute queries
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Export pool for direct access if needed
export { pool };

// Helper to close pool (useful for tests)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
