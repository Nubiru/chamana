/**
 * Database Views Tests
 *
 * Tests for lib/db/views.ts - all 5 view query functions
 * Uses mocks to avoid real database connections in unit tests
 */

// Mock the database connection module
jest.mock('@/infrastructure/database/connection', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/__tests__/__mocks__/db');
});

import { resetDbMocks } from '@/__tests__/__mocks__/db';
import { query } from '@/infrastructure/database/connection';
import {
  getAnalisisClientes,
  getInventarioCritico,
  getRotacionInventario,
  getTopProductos,
  getVentasMensuales,
} from '@/lib/db/views';

describe('Database Views (lib/db/views.ts)', () => {
  beforeEach(() => {
    resetDbMocks();
    jest.clearAllMocks();
  });

  describe('getVentasMensuales', () => {
    test('should return array of monthly sales', async () => {
      const mockData = [
        {
          mes: '2025-11',
          total_pedidos: 10,
          total_mes: 5000,
          ticket_promedio: 500,
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getVentasMensuales();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
      expect(query).toHaveBeenCalledWith('SELECT * FROM vista_ventas_mensuales ORDER BY mes DESC');
    });

    test('should return data with correct structure', async () => {
      const mockData = [
        {
          mes: '2025-11',
          total_pedidos: 10,
          total_mes: 5000,
          ticket_promedio: 500,
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getVentasMensuales();
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('mes');
        expect(result[0]).toHaveProperty('total_pedidos');
        expect(result[0]).toHaveProperty('total_mes');
        expect(result[0]).toHaveProperty('ticket_promedio');
      }
    });

    test('should handle empty results gracefully', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);

      const result = await getVentasMensuales();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should handle database errors', async () => {
      const error = new Error('Database error');
      (query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getVentasMensuales()).rejects.toThrow('Database error');
    });
  });

  describe('getInventarioCritico', () => {
    test('should return array of critical inventory items', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Test',
          stock_disponible: 5,
          stock_inicial: 100,
          stock_vendido: 95,
          estado_stock: 'CRÍTICO',
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getInventarioCritico();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
    });

    test('should return data with correct structure', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Test',
          stock_disponible: 5,
          stock_inicial: 100,
          stock_vendido: 95,
          estado_stock: 'CRÍTICO',
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getInventarioCritico();
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('nombre');
        expect(result[0]).toHaveProperty('stock_disponible');
        expect(result[0]).toHaveProperty('stock_inicial');
        expect(result[0]).toHaveProperty('stock_vendido');
        expect(result[0]).toHaveProperty('estado_stock');
        expect(['AGOTADO', 'CRÍTICO', 'BAJO', 'NORMAL']).toContain(result[0].estado_stock);
      }
    });

    test('should handle empty results gracefully', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);

      const result = await getInventarioCritico();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getTopProductos', () => {
    test('should return array of top products', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Product 1',
          unidades_vendidas: 100,
          ingresos_generados: 5000,
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getTopProductos(10);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
      expect(query).toHaveBeenCalledWith('SELECT * FROM vista_top_productos LIMIT $1', [10]);
    });

    test('should respect limit parameter', async () => {
      const limit = 5;
      const mockData = Array(limit).fill({
        id: 1,
        nombre: 'Product',
        unidades_vendidas: 10,
        ingresos_generados: 100,
      });
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getTopProductos(limit);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(limit);
      expect(query).toHaveBeenCalledWith('SELECT * FROM vista_top_productos LIMIT $1', [limit]);
    });

    test('should return data with correct structure', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Product 1',
          unidades_vendidas: 100,
          ingresos_generados: 5000,
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getTopProductos(10);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('nombre');
        expect(result[0]).toHaveProperty('unidades_vendidas');
        expect(result[0]).toHaveProperty('ingresos_generados');
      }
    });

    test('should use default limit of 10 when not specified', async () => {
      const mockData = Array(10).fill({
        id: 1,
        nombre: 'Product',
        unidades_vendidas: 10,
        ingresos_generados: 100,
      });
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getTopProductos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
      expect(query).toHaveBeenCalledWith('SELECT * FROM vista_top_productos LIMIT $1', [10]);
    });

    test('should handle empty results gracefully', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);

      const result = await getTopProductos(10);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getAnalisisClientes', () => {
    test('should return array of customer analysis data', async () => {
      const mockData = [
        {
          cliente_id: 1,
          nombre_completo: 'John Doe',
          email: 'john@example.com',
          total_pedidos: 5,
          total_gastado: 1000,
          ticket_promedio: 200,
          ultima_compra: new Date(),
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getAnalisisClientes();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
    });

    test('should return data with correct structure', async () => {
      const mockData = [
        {
          cliente_id: 1,
          nombre_completo: 'John Doe',
          email: 'john@example.com',
          total_pedidos: 5,
          total_gastado: 1000,
          ticket_promedio: 200,
          ultima_compra: new Date(),
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getAnalisisClientes();
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('cliente_id');
        expect(result[0]).toHaveProperty('nombre_completo');
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('total_pedidos');
        expect(result[0]).toHaveProperty('total_gastado');
        expect(result[0]).toHaveProperty('ticket_promedio');
        expect(result[0]).toHaveProperty('ultima_compra');
      }
    });

    test('should handle empty results gracefully', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);

      const result = await getAnalisisClientes();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getRotacionInventario', () => {
    test('should return array of inventory rotation data', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Product',
          stock_disponible: 50,
          stock_vendido: 50,
          porcentaje_vendido: 50,
          clasificacion_rotacion: 'MEDIA',
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getRotacionInventario();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
    });

    test('should return data with correct structure', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Product',
          stock_disponible: 50,
          stock_vendido: 50,
          porcentaje_vendido: 50,
          clasificacion_rotacion: 'MEDIA',
        },
      ];
      (query as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await getRotacionInventario();
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('nombre');
        expect(result[0]).toHaveProperty('stock_disponible');
        expect(result[0]).toHaveProperty('stock_vendido');
        expect(result[0]).toHaveProperty('porcentaje_vendido');
        expect(result[0]).toHaveProperty('clasificacion_rotacion');
      }
    });

    test('should handle empty results gracefully', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);

      const result = await getRotacionInventario();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
