/**
 * Unit Test: Button Component
 *
 * Tests button variants, sizes, and asChild prop to improve branch coverage
 */

import { Button } from '@/components/ui/button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Link from 'next/link';

// Mock Next.js Link
jest.mock('next/link', () => {
  return jest.fn(({ children, href, className }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  });
});

describe('Button', () => {
  test('should render with default variant and size', () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByRole('button', { name: 'Default Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'button');
  });

  test('should render all variants correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should render all sizes correctly', () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="icon-sm">Icon Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="icon-lg">Icon Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should handle disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });

  test('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Clickable</Button>);

    const button = screen.getByRole('button', { name: 'Clickable' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should work with asChild prop (Link integration)', () => {
    render(
      <Button asChild>
        <Link href="/test">Link Button</Link>
      </Button>
    );

    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  test('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });

  test('should combine variant and size', () => {
    render(
      <Button variant="outline" size="lg">
        Combined
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Combined' });
    expect(button).toBeInTheDocument();
  });

  test('should handle disabled with asChild', () => {
    render(
      <Button asChild disabled>
        <Link href="/test">Disabled Link</Link>
      </Button>
    );

    const link = screen.getByRole('link', { name: 'Disabled Link' });
    expect(link).toBeInTheDocument();
  });
});
