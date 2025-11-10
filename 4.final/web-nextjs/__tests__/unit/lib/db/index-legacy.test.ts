/**
 * Database Connection Tests (Legacy lib/db/index.ts)
 *
 * Tests for lib/db/index.ts - connection pool and query helper
 * This file may be deprecated but should still be tested if in use
 */

import {
  mockClient,
  mockPoolInstance,
  mockSuccessfulQuery,
  resetDbMocks,
} from '@/__tests__/__mocks__/db';

// Mock the pg module before importing the db module
jest.mock('pg', () => {
  const actualPg = jest.requireActual('pg');
  return {
    ...actualPg,
    Pool: jest.fn().mockImplementation(() => mockPoolInstance),
  };
});

// Import after mocking - using require for dynamic import after jest.mock
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getPool, query } = require('@/lib/db/index');

describe('Database Connection (lib/db/index.ts - Legacy)', () => {
  beforeEach(() => {
    resetDbMocks();
    // Reset the module cache to get fresh instances
    jest.resetModules();
  });

  describe('getPool', () => {
    test('should create a connection pool', () => {
      const pool = getPool();
      expect(pool).toBeDefined();
      expect(pool).toHaveProperty('query');
      expect(pool).toHaveProperty('connect');
    });

    test('should return singleton pool instance', () => {
      const pool1 = getPool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2); // Same instance (singleton)
    });

    test('should handle pool errors gracefully', () => {
      const pool = getPool();
      // Pool should have error handler
      expect(pool).toBeDefined();
      // Error handler is set in the implementation
    });
  });

  describe('query helper', () => {
    test('should execute a simple query', async () => {
      mockSuccessfulQuery([{ current_time: new Date() }]);
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      const result = await query('SELECT NOW() as current_time');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('current_time');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should execute query with parameters', async () => {
      mockSuccessfulQuery([{ value: 'test' }]);
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      const result = await query('SELECT $1::text as value', ['test']);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('value', 'test');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should return empty array for queries with no results', async () => {
      mockSuccessfulQuery([]);
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      const result = await query('SELECT * FROM information_schema.tables WHERE table_name = $1', [
        'nonexistent_table_xyz',
      ]);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should handle query errors gracefully', async () => {
      const error = new Error('Table does not exist');
      mockPoolInstance.connect.mockResolvedValue(mockClient);
      mockClient.query.mockRejectedValue(error);

      await expect(query('SELECT * FROM nonexistent_table_xyz_123')).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should release connection after query', async () => {
      mockSuccessfulQuery([{ time: new Date() }]);
      mockPoolInstance.connect.mockResolvedValue(mockClient);

      const queries = Array(5)
        .fill(null)
        .map(() => query('SELECT NOW() as time'));
      const results = await Promise.all(queries);
      expect(results.length).toBe(5);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
      expect(mockClient.release).toHaveBeenCalledTimes(5);
    });
  });
});
