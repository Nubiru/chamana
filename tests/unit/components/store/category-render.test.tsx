import { CategoryCircles } from '@/components/store/CategoryCircles';
import { ProductFilters } from '@/components/store/ProductFilters';
import type { Category } from '@/domain/catalog';
import { render, screen } from '@testing-library/react';

// CategoryCircles renders next/link <Link>, which needs App Router context — stub it to its children.
jest.mock('next/link', () => ({
  __esModule: true,
  default: (props: { children: import('react').ReactNode }) => props.children,
}));

// ProductFilters reads the URL via next/navigation — stub it so the component renders in jsdom.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

const categorias: Category[] = [
  { slug: 'falda', nombre: 'Falda', count: 1 },
  { slug: 'kimono', nombre: 'Kimono', count: 2 },
];

// Post G-30 these two components no longer import the static CATEGORIAS array — they render
// from a server-resolved `categorias` prop (getCategorias()). These tests pin that contract.

describe('CategoryCircles (prop-driven)', () => {
  it('renders one circle per category in the prop', () => {
    render(<CategoryCircles categorias={categorias} />);
    expect(screen.getByText('Falda')).toBeInTheDocument();
    expect(screen.getByText('Kimono')).toBeInTheDocument();
  });

  it('renders only what the prop contains (no static category leaks in)', () => {
    render(<CategoryCircles categorias={[{ slug: 'falda', nombre: 'Falda', count: 1 }]} />);
    expect(screen.getByText('Falda')).toBeInTheDocument();
    expect(screen.queryByText('Kimono')).not.toBeInTheDocument();
  });
});

describe('ProductFilters (prop-driven)', () => {
  it('renders the "Todas" reset plus one button per category in the prop', () => {
    render(<ProductFilters categorias={categorias} />);
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Falda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kimono' })).toBeInTheDocument();
  });

  it('renders no category buttons when the prop is empty (only "Todas")', () => {
    render(<ProductFilters categorias={[]} />);
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Falda' })).not.toBeInTheDocument();
  });
});
