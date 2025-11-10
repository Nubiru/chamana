/**
 * Unit Test: Home Page (app/page.tsx)
 *
 * Tests the home page component
 */

import HomePage from '@/app/page';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return jest.fn(({ children, href }) => {
    return <a href={href}>{children}</a>;
  });
});

// Mock graphics components
jest.mock('@/components/graphics/OrganicShape', () => ({
  OrganicShapeBackground: jest.fn(({ className }) => (
    <div data-testid="organic-shape" className={className} />
  )),
}));

jest.mock('@/components/graphics/ThreadLine', () => ({
  ThreadLineDecorative: jest.fn(({ variant }) => (
    <div data-testid="thread-line" data-variant={variant} />
  )),
}));

describe('Home Page', () => {
  test('should render page title', () => {
    render(<HomePage />);
    expect(screen.getByText('CHAMANA')).toBeInTheDocument();
  });

  test('should render subtitle', () => {
    render(<HomePage />);
    expect(screen.getByText('E-commerce de Ropa Femenina Artesanal')).toBeInTheDocument();
  });

  test('should render brand description', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/Ropa inspirada en la naturaleza/i)
    ).toBeInTheDocument();
  });

  test('should render brand story card', () => {
    render(<HomePage />);
    expect(screen.getByText('Nuestra Esencia')).toBeInTheDocument();
    expect(
      screen.getByText(/Moda atemporal que celebra la naturaleza/i)
    ).toBeInTheDocument();
  });

  test('should render navigation links', () => {
    render(<HomePage />);
    const dashboardLink = screen.getByRole('link', { name: /Ir al Dashboard/i });
    const apiLink = screen.getByRole('link', { name: /Ver API/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(apiLink).toBeInTheDocument();
    expect(apiLink).toHaveAttribute('href', '/api/views/top-productos');
  });

  test('should render footer information', () => {
    render(<HomePage />);
    expect(screen.getByText(/Base de datos: chamana_db_fase3/i)).toBeInTheDocument();
    expect(screen.getByText(/Autor: Gabriel Osemberg/i)).toBeInTheDocument();
  });
});
