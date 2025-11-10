/**
 * Unit Test: EmptyState Component
 *
 * Tests the empty state component with various props
 */

import { EmptyState } from '@/components/empty-state';
import { render, screen } from '@testing-library/react';

describe('EmptyState', () => {
  test('should render with default props', () => {
    render(<EmptyState />);

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron registros para mostrar.')).toBeInTheDocument();
  });

  test('should render with custom title', () => {
    render(<EmptyState title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron registros para mostrar.')).toBeInTheDocument();
  });

  test('should render with custom description', () => {
    render(<EmptyState description="Custom description text" />);

    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  test('should render with custom title and description', () => {
    render(<EmptyState title="No Results" description="Try adjusting your filters" />);

    expect(screen.getByText('No Results')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  test('should render with icon', () => {
    const icon = <div data-testid="test-icon">Icon</div>;
    render(<EmptyState icon={icon} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    const { container } = render(<EmptyState className="custom-class" />);

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});
