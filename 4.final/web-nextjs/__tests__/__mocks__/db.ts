/**
 * Database Mock for Testing
 *
 * Provides a consistent mock for PostgreSQL pool and query functions.
 * Use this mock in API route tests to avoid real database connections.
 */

export const mockPoolInstance = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
};

export const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

// Mock getPool function
export const getPool = jest.fn(() => mockPoolInstance);

// Mock query helper function
export const query = jest.fn();

// Mock closePool function
export const closePool = jest.fn();

// Mock pool export
export const pool = null;

// Helper to reset all mocks
export const resetDbMocks = () => {
  mockPoolInstance.query.mockReset();
  mockPoolInstance.connect.mockReset();
  mockPoolInstance.end.mockReset();
  mockPoolInstance.on.mockReset();
  getPool.mockReset();
  getPool.mockReturnValue(mockPoolInstance);
  query.mockReset();
  mockClient.query.mockReset();
  mockClient.release.mockReset();

  // Set up default behavior: query function uses client pattern
  mockPoolInstance.connect.mockResolvedValue(mockClient);
  mockClient.release.mockResolvedValue(undefined);

  // Default query implementation that uses the client pattern
  query.mockImplementation(async (text: string, params?: unknown[]) => {
    const client = await mockPoolInstance.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      await client.release();
    }
  });
};

// Helper to setup successful query response
export const mockSuccessfulQuery = <T = unknown>(rows: T[] = []) => {
  mockPoolInstance.query.mockResolvedValue({ rows });
  mockClient.query.mockResolvedValue({ rows });
  mockPoolInstance.connect.mockResolvedValue(mockClient);
  query.mockResolvedValue(rows);
};

// Helper to setup query error
export const mockQueryError = (error: Error | string) => {
  const err = typeof error === 'string' ? new Error(error) : error;
  mockPoolInstance.query.mockRejectedValue(err);
  mockClient.query.mockRejectedValue(err);
  query.mockRejectedValue(err);
};

// Initialize with default successful response
resetDbMocks();
