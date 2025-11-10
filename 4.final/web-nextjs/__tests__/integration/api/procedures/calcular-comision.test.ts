/**
 * API Route Test: /api/procedures/calcular-comision
 *
 * Tests the commission calculation endpoint
 * Uses mocked database for speed and reliability
 */

// Mock Next.js server components before importing route
jest.mock('next/server', () => {
  return require('@/__tests__/__mocks__/next-server');
});

// Mock the database connection module
jest.mock('@/infrastructure/database/connection', () => require('@/__tests__/__mocks__/db'));

import { mockPoolInstance, mockQueryError, resetDbMocks } from '@/__tests__/__mocks__/db';
import { NextRequest as MockNextRequest } from '@/__tests__/__mocks__/next-server';
import { POST } from '@/app/api/procedures/calcular-comision/route';
import type { NextRequest } from 'next/server';

describe('API: /api/procedures/calcular-comision', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  test('should calculate commission with date range', async () => {
    const requestBody = {
      fecha_inicio: '2025-11-01',
      fecha_fin: '2025-11-30',
      porcentaje: 5.0,
    };

    const mockDetail = [
      {
        fecha: '2025-11-01',
        total_ventas: '1250.50',
        comision: '62.53',
        pedidos: 5,
      },
      {
        fecha: '2025-11-02',
        total_ventas: '2100.00',
        comision: '105.00',
        pedidos: 8,
      },
    ];

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: mockDetail,
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Comisión calculada exitosamente');
    expect(data.data).toHaveProperty('comision');
    expect(data.data).toHaveProperty('total_ventas');
    expect(data.data).toHaveProperty('pedidos');
    expect(data.data).toHaveProperty('detalle');
    expect(Number.parseFloat(data.data.comision)).toBeCloseTo(167.53, 2);
    expect(Number.parseFloat(data.data.total_ventas)).toBeCloseTo(3350.5, 2);
    expect(data.data.pedidos).toBe(13);
  });

  test('should calculate commission with mes/año', async () => {
    const requestBody = {
      mes: 11,
      año: 2025,
      porcentaje: 5.0,
    };

    const mockDetail = [
      {
        fecha: '2025-11-01',
        total_ventas: '1000.00',
        comision: '50.00',
        pedidos: 3,
      },
    ];

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: mockDetail,
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Should convert mes/año to date range (2025-11-01 to 2025-11-30)
    expect(mockPoolInstance.query).toHaveBeenCalledWith(
      expect.stringContaining('calcular_comision_vendedor'),
      ['2025-11-01', '2025-11-30', 5.0]
    );
  });

  test('should use default porcentaje when not provided', async () => {
    const requestBody = {
      fecha_inicio: '2025-11-01',
      fecha_fin: '2025-11-30',
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [],
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const _data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPoolInstance.query).toHaveBeenCalledWith(
      expect.any(String),
      ['2025-11-01', '2025-11-30', 5.0] // Default 5.0%
    );
  });

  test('should return 400 if no dates provided', async () => {
    const requestBody = {
      porcentaje: 5.0,
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('fecha_inicio/fecha_fin or mes/año are required');
  });

  test('should return 400 if only fecha_inicio provided', async () => {
    const requestBody = {
      fecha_inicio: '2025-11-01',
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should return 400 if only mes provided without año', async () => {
    const requestBody = {
      mes: 11,
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should prioritize fecha_inicio/fecha_fin over mes/año', async () => {
    const requestBody = {
      fecha_inicio: '2025-11-01',
      fecha_fin: '2025-11-30',
      mes: 10,
      año: 2025,
      porcentaje: 5.0,
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [],
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const _data = await response.json();

    expect(response.status).toBe(200);
    // Should use fecha_inicio/fecha_fin, not mes/año
    expect(mockPoolInstance.query).toHaveBeenCalledWith(expect.any(String), [
      '2025-11-01',
      '2025-11-30',
      5.0,
    ]);
  });

  test('should calculate totals correctly with multiple rows', async () => {
    const requestBody = {
      fecha_inicio: '2025-11-01',
      fecha_fin: '2025-11-30',
      porcentaje: 10.0,
    };

    const mockDetail = [
      { fecha: '2025-11-01', total_ventas: '1000.00', comision: '100.00', pedidos: 5 },
      { fecha: '2025-11-02', total_ventas: '2000.00', comision: '200.00', pedidos: 10 },
      { fecha: '2025-11-03', total_ventas: '500.00', comision: '50.00', pedidos: 2 },
    ];

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: mockDetail,
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Number.parseFloat(data.data.comision)).toBeCloseTo(350.0, 2);
    expect(Number.parseFloat(data.data.total_ventas)).toBeCloseTo(3500.0, 2);
    expect(data.data.pedidos).toBe(17);
  });

  test('should handle empty results', async () => {
    const requestBody = {
      fecha_inicio: '2025-12-01',
      fecha_fin: '2025-12-31',
      porcentaje: 5.0,
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [],
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.comision).toBe('0.00');
    expect(data.data.total_ventas).toBe('0.00');
    expect(data.data.pedidos).toBe(0);
  });

  test('should handle database errors', async () => {
    const requestBody = {
      fecha_inicio: '2025-11-01',
      fecha_fin: '2025-11-30',
    };

    mockQueryError(new Error('Database connection failed'));

    const request = new MockNextRequest('http://localhost:3000/api/procedures/calcular-comision', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database connection failed');
  });
});
