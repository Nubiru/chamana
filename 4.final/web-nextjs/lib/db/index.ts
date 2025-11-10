import { Pool, type PoolConfig, QueryResult } from 'pg';

const poolConfig: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'chamana_db_fase3',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
