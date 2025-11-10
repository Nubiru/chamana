/**
 * Unit Test: Dashboard Layout (app/(dashboard)/layout.tsx)
 *
 * Tests the dashboard layout component with navigation
 */

import DashboardLayout from '@/app/(dashboard)/layout';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return jest.fn(({ children, href, className }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  });
});

describe('Dashboard Layout', () => {
  test('should render children correctly', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>
    );

    expect(container.textContent).toContain('Dashboard Content');
  });

  test('should render header with CHAMANA logo', () => {
    render(
      <DashboardLayout>
        <div>Test</div>
      </DashboardLayout>
    );

    const logoLink = screen.getByRole('link', { name: 'CHAMANA' });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('should render navigation links', () => {
    render(
      <DashboardLayout>
        <div>Test</div>
      </DashboardLayout>
    );

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    const reportesLink = screen.getByRole('link', { name: 'Reportes' });
    const procesosLink = screen.getByRole('link', { name: 'Procesos' });

    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(reportesLink).toBeInTheDocument();
    expect(reportesLink).toHaveAttribute('href', '/reportes');
    expect(procesosLink).toBeInTheDocument();
    expect(procesosLink).toHaveAttribute('href', '/procesos');
  });

  test('should render sticky header', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test</div>
      </DashboardLayout>
    );

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  test('should render main content area', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.textContent).toContain('Test Content');
  });
});
