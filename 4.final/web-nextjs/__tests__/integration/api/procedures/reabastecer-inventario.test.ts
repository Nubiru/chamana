/**
 * API Route Test: /api/procedures/reabastecer-inventario
 *
 * Tests the inventory restocking endpoint
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
import { POST } from '@/app/api/procedures/reabastecer-inventario/route';
import type { NextRequest } from 'next/server';

describe('API: /api/procedures/reabastecer-inventario', () => {
  beforeEach(() => {
    resetDbMocks();
  });

  test('should restock inventory successfully', async () => {
    const requestBody = {
      prenda_id: 1,
      cantidad: 10,
      motivo: 'Reabastecimiento manual',
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [{ success: true }],
    });

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Inventario reabastecido exitosamente');
    expect(data.data).toHaveProperty('success', true);
    expect(data.data).toHaveProperty('prenda_id', 1);
    expect(data.data).toHaveProperty('cantidad', 10);
    expect(mockPoolInstance.query).toHaveBeenCalledWith(
      'SELECT reabastecer_inventario($1, $2, $3) as success',
      [1, 10, 'Reabastecimiento manual']
    );
  });

  test('should return 400 if prenda_id is missing', async () => {
    const requestBody = {
      cantidad: 10,
    };

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('prenda_id and cantidad are required');
  });

  test('should return 400 if cantidad is missing', async () => {
    const requestBody = {
      prenda_id: 1,
    };

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should return 400 if cantidad is 0', async () => {
    const requestBody = {
      prenda_id: 1,
      cantidad: 0,
    };

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('cantidad must be greater than 0');
  });

  test('should return 400 if cantidad is negative', async () => {
    const requestBody = {
      prenda_id: 1,
      cantidad: -5,
    };

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should use default motivo when not provided', async () => {
    const requestBody = {
      prenda_id: 1,
      cantidad: 10,
    };

    mockPoolInstance.query.mockResolvedValueOnce({
      rows: [{ success: true }],
    });

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const _data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPoolInstance.query).toHaveBeenCalledWith(expect.any(String), [
      1,
      10,
      'Reabastecimiento manual',
    ]);
  });

  test('should handle database errors', async () => {
    const requestBody = {
      prenda_id: 999,
      cantidad: 10,
    };

    mockQueryError(new Error('Prenda ID 999 no existe o está inactiva'));

    const request = new MockNextRequest(
      'http://localhost:3000/api/procedures/reabastecer-inventario',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Prenda ID 999 no existe o está inactiva');
  });
});
