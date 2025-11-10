/**
 * Unit Test: Toast Component and ToastProvider
 *
 * Tests toast functionality including variants, auto-dismiss, and stacking
 */

import { Toast, ToastProvider, useToast } from '@/components/ui/toast';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Component that uses useToast hook
function ToastTester() {
  const { addToast, removeToast, toasts } = useToast();

  return (
    <div>
      <button type="button" onClick={() => addToast({ title: 'Test', variant: 'success' })}>
        Add Success
      </button>
      <button type="button" onClick={() => addToast({ title: 'Error', variant: 'error' })}>
        Add Error
      </button>
      <button type="button" onClick={() => addToast({ title: 'Info', variant: 'default' })}>
        Add Info
      </button>
      <button type="button" onClick={() => addToast({ title: 'Warning', variant: 'warning' })}>
        Add Warning
      </button>
      <button type="button" onClick={() => toasts.length > 0 && removeToast(toasts[0].id)}>
        Remove First
      </button>
    </div>
  );
}

describe('Toast Component', () => {
  test('should render toast with title', () => {
    render(<Toast id="1" title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('should render toast with description', () => {
    render(<Toast id="1" description="Test Description" />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('should render toast with both title and description', () => {
    render(<Toast id="1" title="Title" description="Description" />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  test('should render all toast variants', () => {
    const { rerender } = render(<Toast id="1" variant="default" title="Default" />);
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Toast id="2" variant="success" title="Success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Toast id="3" variant="error" title="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<Toast id="4" variant="warning" title="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(<Toast id="1" title="Test" onClose={handleClose} />);

    // Find close button (it's hidden by default, but accessible)
    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('should not render close button when onClose is not provided', () => {
    render(<Toast id="1" title="Test" />);

    // Should not have a close button
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });
});

describe('ToastProvider', () => {
  test('should provide toast context', () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    expect(screen.getByText('Add Success')).toBeInTheDocument();
  });

  test('should add toast with success variant', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Success'));

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  test('should add toast with error variant', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  test('should add toast with info variant', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Info'));

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument();
    });
  });

  test('should add toast with warning variant', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Warning'));

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  test('should auto-dismiss toast after 5 seconds', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Success'));

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('should remove toast manually', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Success'));

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Remove First'));

    await waitFor(() => {
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  test('should stack multiple toasts', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Success'));
    await user.click(screen.getByText('Add Error'));

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  test('should throw error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<ToastTester />);
    }).toThrow('useToast must be used within ToastProvider');

    console.error = originalError;
  });
});
