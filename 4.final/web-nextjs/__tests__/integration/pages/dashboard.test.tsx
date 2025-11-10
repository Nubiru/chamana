/**
 * Page Test: Dashboard
 *
 * Tests the dashboard page with mocked API calls
 */

import DashboardPage from '@/app/(dashboard)/page';
import * as viewQueries from '@/lib/db/views';
import type { InventarioCritico, TopProducto, VentaMensual } from '@/types/database';
import { render } from '@testing-library/react';

// Mock the chart components
jest.mock('@/components/charts/LineChart', () => ({
  LineChart: jest.fn(() => <div data-testid="line-chart">Line Chart</div>),
}));

jest.mock('@/components/charts/BarChart', () => ({
  BarChart: jest.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
}));

// Mock EmptyState component if it exists
jest.mock('@/components/empty-state', () => ({
  EmptyState: jest.fn(() => <div data-testid="empty-state">No data available</div>),
}));

// Mock the database views module
jest.mock('@/lib/db/views', () => ({
  getVentasMensuales: jest.fn(),
  getInventarioCritico: jest.fn(),
  getTopProductos: jest.fn(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render dashboard title', async () => {
    const mockVentas: VentaMensual[] = [];
    const mockInventario: InventarioCritico[] = [];
    const mockTopProductos: TopProducto[] = [];

    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce(mockVentas);
    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce(mockInventario);
    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce(mockTopProductos);

    const page = await DashboardPage();
    const { container } = render(page);

    expect(container.textContent).toContain('Dashboard CHAMANA');
  });

  test('should render KPI cards', async () => {
    const mockVentas: VentaMensual[] = [
      { mes: '2025-11', total_pedidos: 45, total_mes: 12500.5, ticket_promedio: 277.79 },
    ];
    const mockInventario: InventarioCritico[] = [
      {
        id: 1,
        nombre: 'Producto 1',
        stock_disponible: 5,
        stock_inicial: 100,
        stock_vendido: 95,
        estado_stock: 'CRÍTICO',
      },
    ];
    const mockTopProductos: TopProducto[] = [
      { id: 1, nombre: 'Top Product', unidades_vendidas: 150, ingresos_generados: 15000 },
    ];

    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce(mockVentas);
    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce(mockInventario);
    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce(mockTopProductos);

    const { container } = render(await DashboardPage());

    // Check for KPI card content
    expect(container.textContent).toContain('Total Ventas');
    expect(container.textContent).toContain('Ticket Promedio');
  });

  test('should render charts when data is available', async () => {
    const mockVentas: VentaMensual[] = [
      { mes: '2025-11', total_pedidos: 45, total_mes: 12500.5, ticket_promedio: 277.79 },
    ];
    const mockInventario: InventarioCritico[] = [];
    const mockTopProductos: TopProducto[] = [
      { id: 1, nombre: 'Product 1', unidades_vendidas: 100, ingresos_generados: 10000 },
    ];

    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce(mockVentas);
    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce(mockInventario);
    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce(mockTopProductos);

    const { container } = render(await DashboardPage());

    // Charts should be rendered (mocked)
    expect(container.querySelector('[data-testid="line-chart"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
  });

  test('should render inventory table', async () => {
    const mockVentas: VentaMensual[] = [];
    const mockInventario: InventarioCritico[] = [
      {
        id: 1,
        nombre: 'Producto Crítico',
        stock_disponible: 5,
        stock_inicial: 100,
        stock_vendido: 95,
        estado_stock: 'CRÍTICO',
      },
    ];
    const mockTopProductos: TopProducto[] = [];

    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce(mockVentas);
    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce(mockInventario);
    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce(mockTopProductos);

    const { container } = render(await DashboardPage());

    expect(container.textContent).toContain('Producto Crítico');
    expect(container.textContent).toContain('CRÍTICO');
  });

  test('should handle empty data gracefully', async () => {
    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce([]);
    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce([]);
    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce([]);

    const { container } = render(await DashboardPage());

    // Page should still render without crashing
    expect(container.textContent).toContain('Dashboard');
  });

  test('should handle database errors gracefully', async () => {
    (viewQueries.getVentasMensuales as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );
    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce([]);
    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce([]);

    const { container } = render(await DashboardPage());

    // Page should still render (errors are caught)
    expect(container.textContent).toContain('Dashboard');
  });
});
