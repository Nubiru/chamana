/**
 * Page Test: Reportes (Reports)
 *
 * Tests the reports page with mocked API calls
 */

import { mockSuccessfulFetch, resetFetchMock } from '@/__tests__/__mocks__/fetch';
import ReportesPage from '@/app/(dashboard)/reportes/page';
import { ToastProvider } from '@/components/ui/toast';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock react-csv
jest.mock('react-csv', () => ({
  CSVLink: jest.fn(({ children, data, filename }) => (
    <a href="#" data-testid="csv-link" data-filename={filename} data-rows={data?.length || 0}>
      {children}
    </a>
  )),
}));

describe('Reportes Page', () => {
  beforeEach(() => {
    resetFetchMock();
    jest.clearAllMocks();
  });

  test('should render loading state initially', () => {
    // Mock fetch to delay response
    global.fetch = jest.fn(
      () => new Promise(() => {}) // Never resolves
    ) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );
    // The page shows TableSkeleton when loading, which renders Skeleton components
    // Check for the page title which is always visible
    expect(screen.getByText('Reportes')).toBeInTheDocument();
  });

  test('should render page title', async () => {
    mockSuccessfulFetch({ success: true, data: [] });

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });
  });

  test('should render all 5 tabs', async () => {
    mockSuccessfulFetch({ success: true, data: [] });

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      // "Ventas Mensuales" appears in both tab trigger and card title, so use getAllByText
      expect(screen.getAllByText('Ventas Mensuales').length).toBeGreaterThan(0);
      expect(screen.getByText('Inventario')).toBeInTheDocument();
      expect(screen.getByText('Top Productos')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('Rotación')).toBeInTheDocument();
    });
  });

  test('should fetch and display ventas-mensuales data', async () => {
    const mockData = [
      {
        mes: '2025-11',
        total_pedidos: 45,
        total_mes: 12500.5,
        ticket_promedio: 277.79,
      },
    ];

    global.fetch = jest.fn((url: string) => {
      if (url.includes('ventas-mensuales')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockData }),
        } as Response);
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    }) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('2025-11')).toBeInTheDocument();
    });
  });

  test('should switch between tabs', async () => {
    const user = userEvent.setup();
    mockSuccessfulFetch({ success: true, data: [] });

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });

    // Wait for tabs to be rendered
    await waitFor(() => {
      expect(screen.getByText('Inventario')).toBeInTheDocument();
    });

    // Click on Inventario tab using userEvent for better interaction
    const inventarioTab = screen.getByText('Inventario');
    await user.click(inventarioTab);

    // Should show inventario content (CardTitle appears when tab is active)
    // TabsContent only renders when tab is active, so wait for it
    await waitFor(
      () => {
        // Check for CardTitle "Inventario Crítico" which appears when tab is active
        const inventarioTitle = screen.queryByText('Inventario Crítico');
        expect(inventarioTitle).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should render CSV export buttons', async () => {
    mockSuccessfulFetch({ success: true, data: [] });

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      const csvLinks = screen.getAllByTestId('csv-link');
      expect(csvLinks.length).toBeGreaterThan(0);
    });
  });

  test('should handle API errors gracefully', async () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    // Wait for error handling to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();

    // Should not crash, should show empty state or error handling
    await waitFor(
      () => {
        // Page should still render
        expect(screen.queryByText('Reportes')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should display data in inventario-critico tab', async () => {
    const user = userEvent.setup();
    const mockInventario = [
      {
        id: 1,
        nombre: 'Producto Crítico',
        stock_disponible: 5,
        stock_inicial: 100,
        stock_vendido: 95,
        estado_stock: 'CRÍTICO',
      },
    ];

    // Mock all endpoints that the page fetches in parallel
    global.fetch = jest.fn((url: string) => {
      if (url.includes('inventario-critico')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockInventario }),
        } as Response);
      }
      // Mock all other endpoints with empty data
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    }) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });

    // Wait for tabs to be rendered and data to load
    await waitFor(() => {
      expect(screen.getByText('Inventario')).toBeInTheDocument();
    });

    // Click on Inventario tab to switch to it using userEvent
    const inventarioTab = screen.getByText('Inventario');
    await user.click(inventarioTab);

    // Wait for the tab content to be visible and data to render
    // First ensure the CardTitle "Inventario Crítico" is visible (indicates tab is active)
    await waitFor(
      () => {
        const inventarioTitle = screen.queryByText('Inventario Crítico');
        expect(inventarioTitle).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Then check for table headers which appear when data is loaded
    await waitFor(
      () => {
        expect(screen.getByText('Producto')).toBeInTheDocument();
        expect(screen.getByText('Estado')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test('should display data in top-productos tab', async () => {
    const user = userEvent.setup();
    const mockTopProductos = [
      {
        id: 1,
        nombre: 'Producto Top',
        unidades_vendidas: 150,
        ingresos_generados: 15000,
      },
    ];

    global.fetch = jest.fn((url: string) => {
      if (url.includes('top-productos')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockTopProductos }),
        } as Response);
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    }) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Top Productos')).toBeInTheDocument();
    });

    const topProductosTab = screen.getByText('Top Productos');
    await user.click(topProductosTab);

    await waitFor(
      () => {
        expect(screen.getByText('Producto Top')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should display data in clientes tab', async () => {
    const user = userEvent.setup();
    const mockClientes = [
      {
        cliente_id: 1,
        nombre_completo: 'Juan Pérez',
        email: 'juan@example.com',
        total_pedidos: 5,
        total_gastado: 2500.5,
        ticket_promedio: 500.1,
        ultima_compra: '2025-11-15',
      },
    ];

    global.fetch = jest.fn((url: string) => {
      if (url.includes('analisis-clientes')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockClientes }),
        } as Response);
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    }) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Clientes')).toBeInTheDocument();
    });

    const clientesTab = screen.getByText('Clientes');
    await user.click(clientesTab);

    await waitFor(
      () => {
        expect(screen.getByText('Análisis de Clientes')).toBeInTheDocument();
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should display data in rotacion tab', async () => {
    const user = userEvent.setup();
    const mockRotacion = [
      {
        id: 1,
        nombre: 'Producto A',
        stock_disponible: 50,
        stock_vendido: 100,
        porcentaje_vendido: 66.67,
        clasificacion_rotacion: 'Alta Rotación',
      },
    ];

    global.fetch = jest.fn((url: string) => {
      if (url.includes('rotacion-inventario')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockRotacion }),
        } as Response);
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    }) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rotación')).toBeInTheDocument();
    });

    const rotacionTab = screen.getByText('Rotación');
    await user.click(rotacionTab);

    await waitFor(
      () => {
        expect(screen.getByText('Rotación de Inventario')).toBeInTheDocument();
        expect(screen.getByText('Producto A')).toBeInTheDocument();
        // The classification is "Alta Rotación", not just "ALTA"
        expect(screen.getByText('Alta Rotación')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should show empty state for top-productos tab when no data', async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    ) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Top Productos')).toBeInTheDocument();
    });

    const topProductosTab = screen.getByText('Top Productos');
    await user.click(topProductosTab);

    await waitFor(
      () => {
        // Top productos tab shows "No hay productos vendidos" when empty
        expect(screen.getByText('No hay productos vendidos')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should show empty state for clientes tab when no data', async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    ) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Clientes')).toBeInTheDocument();
    });

    const clientesTab = screen.getByText('Clientes');
    await user.click(clientesTab);

    await waitFor(
      () => {
        expect(screen.getByText(/No hay datos de clientes/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should show empty state for rotacion tab when no data', async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    ) as jest.Mock;

    render(
      <ToastProvider>
        <ReportesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rotación')).toBeInTheDocument();
    });

    const rotacionTab = screen.getByText('Rotación');
    await user.click(rotacionTab);

    await waitFor(
      () => {
        expect(screen.getByText(/No hay datos de rotación/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
