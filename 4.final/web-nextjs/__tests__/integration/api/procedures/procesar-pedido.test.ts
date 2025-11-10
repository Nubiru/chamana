/**
 * API Route Test: /api/procedures/procesar-pedido
 *
 * Tests the order processing endpoint
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
import { POST } from '@/app/api/procedures/procesar-pedido/route';
import type { NextRequest } from 'next/server';

describe('API: /api/procedures/procesar-pedido', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  test('should process order successfully', async () => {
    const requestBody = {
      cliente_id: 1,
      items: [
        { prenda_id: 1, cantidad: 2 },
        { prenda_id: 3, cantidad: 1 },
      ],
      descuento: 0,
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [{ pedido_id: 123 }],
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Pedido procesado exitosamente');
    expect(data.data).toHaveProperty('pedido_id', 123);
    expect(mockPoolInstance.query).toHaveBeenCalledWith(
      'SELECT procesar_pedido($1, $2::JSONB, $3) as pedido_id',
      [1, JSON.stringify(requestBody.items), 0]
    );
  });

  test('should return 400 if cliente_id is missing', async () => {
    const requestBody = {
      items: [{ prenda_id: 1, cantidad: 2 }],
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('cliente_id and items (array) are required');
  });

  test('should return 400 if items is missing', async () => {
    const requestBody = {
      cliente_id: 1,
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should return 400 if items is not an array', async () => {
    const requestBody = {
      cliente_id: 1,
      items: 'not-an-array',
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should return 400 if items array is empty', async () => {
    const requestBody = {
      cliente_id: 1,
      items: [],
    };

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should handle database errors', async () => {
    const requestBody = {
      cliente_id: 1,
      items: [{ prenda_id: 1, cantidad: 2 }],
    };

    mockQueryError(new Error('Stock insuficiente para prenda ID 1'));

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Stock insuficiente para prenda ID 1');
  });

  test('should apply descuento when provided', async () => {
    const requestBody = {
      cliente_id: 1,
      items: [{ prenda_id: 1, cantidad: 2 }],
      descuento: 50.0,
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [{ pedido_id: 124 }],
    });

    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request as unknown as NextRequest);
    const _data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPoolInstance.query).toHaveBeenCalledWith(expect.any(String), [
      1,
      JSON.stringify(requestBody.items),
      50.0,
    ]);
  });

  test('should handle JSON parsing errors', async () => {
    const request = new MockNextRequest('http://localhost:3000/api/procedures/procesar-pedido', {
      method: 'POST',
      body: 'invalid-json',
    });

    // NextRequest will throw when trying to parse invalid JSON, route catches and returns 500
    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid JSON');
  });
});
