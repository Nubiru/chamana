import { getPool } from '@/infrastructure/database/connection';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = getPool();

    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');

    // Test views exist
    const viewsCheck = await pool.query(`
      SELECT COUNT(*) as view_count
      FROM information_schema.views
      WHERE table_schema = 'public'
    `);

    // Test materialized views exist
    const matViewsCheck = await pool.query(`
      SELECT COUNT(*) as matview_count
      FROM pg_matviews
      WHERE schemaname = 'public'
    `);

    // Test indexes exist
    const indexesCheck = await pool.query(`
      SELECT COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
    `);

    // Test auth tables exist
    const authTablesCheck = await pool.query(`
      SELECT COUNT(*) as auth_tables_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('usuarios', 'roles', 'usuarios_roles')
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        current_time: result.rows[0].current_time,
        postgresql_version: result.rows[0].pg_version,
        database: process.env.DB_DATABASE || 'chamana_db_fase3',
        views_count: Number.parseInt(viewsCheck.rows[0].view_count),
        materialized_views_count: Number.parseInt(matViewsCheck.rows[0].matview_count),
        indexes_count: Number.parseInt(indexesCheck.rows[0].index_count),
        auth_tables_count: Number.parseInt(authTablesCheck.rows[0].auth_tables_count),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database connection failed',
      },
      { status: 500 }
    );
  }
}
