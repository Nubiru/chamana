/**
 * API Route Test: /api/test-db
 *
 * Tests the database connection test endpoint
 * Uses mocked database for speed and reliability
 */

// Mock Next.js server components before importing route
jest.mock('next/server', () => {
  return require('@/__tests__/__mocks__/next-server');
});

// Mock the database connection module
jest.mock('@/infrastructure/database/connection', () => require('@/__tests__/__mocks__/db'));

import {
  mockPoolInstance,
  mockQueryError,
  mockSuccessfulQuery,
  resetDbMocks,
} from '@/__tests__/__mocks__/db';
import { GET } from '@/app/api/test-db/route';

describe('API: /api/test-db', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  test('should return successful database connection', async () => {
    // Mock all queries in sequence
    mockPoolInstance.query
      .mockResolvedValueOnce({
        rows: [{ current_time: new Date('2025-11-12T10:00:00Z'), pg_version: 'PostgreSQL 17.0' }],
      })
      .mockResolvedValueOnce({ rows: [{ view_count: '10' }] })
      .mockResolvedValueOnce({ rows: [{ matview_count: '4' }] })
      .mockResolvedValueOnce({ rows: [{ index_count: '23' }] })
      .mockResolvedValueOnce({ rows: [{ auth_tables_count: '3' }] });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Database connection successful');
  });

  test('should return database statistics', async () => {
    mockPoolInstance.query
      .mockResolvedValueOnce({
        rows: [{ current_time: new Date('2025-11-12T10:00:00Z'), pg_version: 'PostgreSQL 17.0' }],
      })
      .mockResolvedValueOnce({ rows: [{ view_count: '12' }] })
      .mockResolvedValueOnce({ rows: [{ matview_count: '4' }] })
      .mockResolvedValueOnce({ rows: [{ index_count: '25' }] })
      .mockResolvedValueOnce({ rows: [{ auth_tables_count: '3' }] });

    const response = await GET();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('current_time');
    expect(data.data).toHaveProperty('postgresql_version');
    expect(data.data).toHaveProperty('database');
    expect(data.data).toHaveProperty('views_count');
    expect(data.data).toHaveProperty('materialized_views_count');
    expect(data.data).toHaveProperty('indexes_count');
    expect(data.data).toHaveProperty('auth_tables_count');
    expect(Number.parseInt(data.data.views_count)).toBeGreaterThanOrEqual(10);
    expect(Number.parseInt(data.data.materialized_views_count)).toBeGreaterThanOrEqual(4);
    expect(Number.parseInt(data.data.indexes_count)).toBeGreaterThanOrEqual(23);
    expect(Number.parseInt(data.data.auth_tables_count)).toBe(3);
  });

  test('should return correct database name', async () => {
    mockPoolInstance.query
      .mockResolvedValueOnce({
        rows: [{ current_time: new Date('2025-11-12T10:00:00Z'), pg_version: 'PostgreSQL 17.0' }],
      })
      .mockResolvedValueOnce({ rows: [{ view_count: '10' }] })
      .mockResolvedValueOnce({ rows: [{ matview_count: '4' }] })
      .mockResolvedValueOnce({ rows: [{ index_count: '23' }] })
      .mockResolvedValueOnce({ rows: [{ auth_tables_count: '3' }] });

    const response = await GET();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.database).toBe('chamana_db_fase3');
  });

  test('should handle database connection errors', async () => {
    mockQueryError(new Error('Connection refused'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Connection refused');
    expect(data.message).toBe('Database connection failed');
  });

  test('should handle query errors gracefully', async () => {
    mockPoolInstance.query.mockRejectedValueOnce(new Error('Database query failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
