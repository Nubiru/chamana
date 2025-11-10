/**
 * Test Utilities
 *
 * Reusable utilities for testing React components and API routes.
 */

import { type RenderOptions, render } from '@testing-library/react';
import type React from 'react';

/**
 * Custom render function with providers
 * Use this instead of the default render from @testing-library/react
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { ...options });
};

/**
 * Create a mock API response with standard structure
 */
export const createMockApiResponse = <T,>(data: T, message = 'Success') => ({
  success: true,
  data,
  message,
});

/**
 * Create a mock API error response
 */
export const createMockApiError = (error: string, message?: string) => ({
  success: false,
  error,
  message: message || error,
});

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock Chart.js components (they're heavy and not critical to test)
 */
export const mockChartJs = () => {
  jest.mock('react-chartjs-2', () => ({
    Line: jest.fn(() => <div data-testid="line-chart">Line Chart</div>),
    Bar: jest.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
  }));

  jest.mock('chart.js', () => ({
    Chart: {
      register: jest.fn(),
    },
    CategoryScale: {},
    LinearScale: {},
    PointElement: {},
    LineElement: {},
    BarElement: {},
    Title: {},
    Tooltip: {},
    Legend: {},
  }));
};

/**
 * Create mock database query result
 */
export const createMockQueryResult = <T,>(rows: T[]) => ({
  rows,
  rowCount: rows.length,
  command: 'SELECT',
  oid: 0,
  fields: [],
});

/**
 * Create mock Next.js route params
 */
export const createMockParams = (params: Record<string, string>) => {
  return Promise.resolve(params);
};
