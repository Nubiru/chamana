/**
 * Fetch API Mock for Testing
 *
 * Provides a consistent mock for the global fetch API.
 * Use this in component and page tests that make API calls.
 */

type MockFetchResponse = {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
  headers?: Headers;
};

const mockFetch = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

// Helper to setup successful fetch response
export const mockSuccessfulFetch = (data: unknown, options: Partial<MockFetchResponse> = {}) => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    ...options,
  } as Response);
};

// Helper to setup fetch error
export const mockFetchError = (
  status: number,
  error: unknown,
  options: Partial<MockFetchResponse> = {}
) => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: 'Error',
    json: async () => error,
    text: async () => JSON.stringify(error),
    headers: new Headers(),
    ...options,
  } as Response);
};

// Helper to setup fetch network error
export const mockFetchNetworkError = (error: Error) => {
  mockFetch.mockRejectedValueOnce(error);
};

// Helper to reset fetch mock
export const resetFetchMock = () => {
  mockFetch.mockReset();
};

// Set global fetch
global.fetch = mockFetch as typeof global.fetch;

export default mockFetch;
