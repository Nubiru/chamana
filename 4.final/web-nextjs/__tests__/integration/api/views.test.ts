/**
 * API Route Test: /api/views/[view]
 *
 * Tests all database view endpoints
 * Uses mocked database for speed and reliability
 */

// Mock Next.js server components before importing route
jest.mock('next/server', () => {
  return require('@/__tests__/__mocks__/next-server');
});

// Mock the database views module
jest.mock('@/lib/db/views', () => ({
  getVentasMensuales: jest.fn(),
  getInventarioCritico: jest.fn(),
  getTopProductos: jest.fn(),
  getAnalisisClientes: jest.fn(),
  getRotacionInventario: jest.fn(),
}));

import { NextRequest as MockNextRequest } from '@/__tests__/__mocks__/next-server';
import { GET } from '@/app/api/views/[view]/route';
import * as viewQueries from '@/lib/db/views';
import type { NextRequest } from 'next/server';

describe('API: /api/views/[view]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return ventas-mensuales data', async () => {
    const mockData = [
      {
        mes: '2025-11',
        total_pedidos: 45,
        total_mes: 12500.5,
        ticket_promedio: 277.79,
      },
    ];

    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce(mockData);

    const request = new MockNextRequest('http://localhost:3000/api/views/ventas-mensuales');
    const params = Promise.resolve({ view: 'ventas-mensuales' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data).toEqual(mockData);
    expect(data.message).toBe('Vista cargada exitosamente');
  });

  test('should return inventario-critico data', async () => {
    const mockData = [
      {
        id: 1,
        nombre: 'Producto Test',
        stock_disponible: 5,
        stock_inicial: 100,
        stock_vendido: 95,
        estado_stock: 'CRÍTICO',
      },
    ];

    (viewQueries.getInventarioCritico as jest.Mock).mockResolvedValueOnce(mockData);

    const request = new MockNextRequest('http://localhost:3000/api/views/inventario-critico');
    const params = Promise.resolve({ view: 'inventario-critico' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data[0].estado_stock).toBe('CRÍTICO');
  });

  test('should return top-productos data', async () => {
    const mockData = [
      {
        id: 1,
        nombre: 'Top Product',
        unidades_vendidas: 150,
        ingresos_generados: 15000.0,
      },
    ];

    (viewQueries.getTopProductos as jest.Mock).mockResolvedValueOnce(mockData);

    const request = new MockNextRequest('http://localhost:3000/api/views/top-productos');
    const params = Promise.resolve({ view: 'top-productos' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(viewQueries.getTopProductos).toHaveBeenCalledWith(10);
  });

  test('should return analisis-clientes data', async () => {
    const mockData = [
      {
        cliente_id: 1,
        nombre_completo: 'Cliente Test',
        email: 'test@example.com',
        total_pedidos: 10,
        total_gastado: 5000.0,
        ticket_promedio: 500.0,
        ultima_compra: '2025-11-01',
      },
    ];

    (viewQueries.getAnalisisClientes as jest.Mock).mockResolvedValueOnce(mockData);

    const request = new MockNextRequest('http://localhost:3000/api/views/analisis-clientes');
    const params = Promise.resolve({ view: 'analisis-clientes' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should return rotacion-inventario data', async () => {
    const mockData = [
      {
        id: 1,
        nombre: 'Producto Test',
        stock_disponible: 50,
        stock_vendido: 50,
        porcentaje_vendido: 50.0,
        clasificacion_rotacion: 'Alta Rotación',
      },
    ];

    (viewQueries.getRotacionInventario as jest.Mock).mockResolvedValueOnce(mockData);

    const request = new MockNextRequest('http://localhost:3000/api/views/rotacion-inventario');
    const params = Promise.resolve({ view: 'rotacion-inventario' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should return 404 for invalid view', async () => {
    const request = new MockNextRequest('http://localhost:3000/api/views/invalid-view');
    const params = Promise.resolve({ view: 'invalid-view' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('View not found');
    expect(data.message).toBe("La vista 'invalid-view' no existe");
  });

  test('should handle database errors', async () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (viewQueries.getVentasMensuales as jest.Mock).mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const request = new MockNextRequest('http://localhost:3000/api/views/ventas-mensuales');
    const params = Promise.resolve({ view: 'ventas-mensuales' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    consoleSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    expect(data.message).toBe('Database connection failed');
  });

  test('should handle empty results gracefully', async () => {
    (viewQueries.getVentasMensuales as jest.Mock).mockResolvedValueOnce([]);

    const request = new MockNextRequest('http://localhost:3000/api/views/ventas-mensuales');
    const params = Promise.resolve({ view: 'ventas-mensuales' });
    const response = await GET(request as unknown as NextRequest, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(0);
  });
});
