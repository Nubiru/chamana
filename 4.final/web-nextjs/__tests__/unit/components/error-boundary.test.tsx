/**
 * Unit Test: ErrorBoundary Component
 *
 * Tests error boundary functionality including error catching and fallback UI
 */

import { ErrorBoundary } from '@/components/error-boundary';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Custom fallback component
const CustomFallback = ({
  error,
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) => (
  <div data-testid="custom-fallback">
    <p>Custom Error: {error?.message}</p>
    <button type="button" onClick={resetError}>
      Reset
    </button>
  </div>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Test error message', { exact: false })).toBeInTheDocument();
  });

  test('should display default error message when error has no message', () => {
    // Create a component that throws an error without a message
    const ThrowErrorNoMessage = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <ThrowErrorNoMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
  });

  test('should display custom fallback component when provided', () => {
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error: Test error message')).toBeInTheDocument();
  });

  test('should reset error when reset button is clicked', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    const resetButton = screen.getByText('Intentar de nuevo');

    // Change children to not throw before clicking reset
    shouldThrow = false;
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    // Now click reset - error boundary will try to render children again
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  test('should log errors to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // ErrorBoundary should call componentDidCatch which logs to console
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
