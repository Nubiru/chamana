/**
 * Integration Test: Products API Route
 *
 * Tests the /api/products GET endpoint with various filters and error cases
 */

// Mock Next.js server components
jest.mock('next/server', () => require('@/__tests__/__mocks__/next-server'));

// Mock database connection
jest.mock('@/infrastructure/database/connection', () => require('@/__tests__/__mocks__/db'));

// Mock the repository and use case
jest.mock('@/infrastructure/database/repositories/PostgresProductRepository');
jest.mock('@/domains/product-catalog/use-cases/SearchProducts');

import { NextRequest as MockNextRequest } from '@/__tests__/__mocks__/next-server';
import { GET } from '@/app/api/products/route';
import { Product } from '@/domains/product-catalog/entities/Product';
import { SearchProducts } from '@/domains/product-catalog/use-cases/SearchProducts';
import { PostgresProductRepository } from '@/infrastructure/database/repositories/PostgresProductRepository';
import type { NextRequest } from 'next/server';

// Mock the Product entity
jest.mock('@/domains/product-catalog/entities/Product', () => ({
  Product: jest
    .fn()
    .mockImplementation((id, name, description, price, sku, categoryId, stock, active) => ({
      id,
      name,
      description,
      price,
      sku,
      categoryId,
      stock,
      active,
      isAvailable: jest.fn(() => active && stock > 0),
    })),
}));

describe('Products API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return products successfully', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        sku: 'SKU1',
        categoryId: 'cat1',
        stock: 10,
        active: true,
        isAvailable: () => true,
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 200,
        sku: 'SKU2',
        categoryId: 'cat2',
        stock: 5,
        active: true,
        isAvailable: () => true,
      },
    ];

    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProducts);
    expect(data.count).toBe(2);
  });

  test('should handle search filter: categoryId', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        sku: 'SKU1',
        categoryId: 'cat1',
        stock: 10,
        active: true,
        isAvailable: () => true,
      },
    ];

    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products?categoryId=cat1');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SearchProducts.prototype.execute).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat1' })
    );
  });

  test('should handle search filter: minPrice', async () => {
    const mockProducts: any[] = [];
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products?minPrice=50');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SearchProducts.prototype.execute).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 50 })
    );
  });

  test('should handle search filter: maxPrice', async () => {
    const mockProducts: any[] = [];
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products?maxPrice=200');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SearchProducts.prototype.execute).toHaveBeenCalledWith(
      expect.objectContaining({ maxPrice: 200 })
    );
  });

  test('should handle search filter: query (q)', async () => {
    const mockProducts: any[] = [];
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products?q=test');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SearchProducts.prototype.execute).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'test' })
    );
  });

  test('should handle multiple filters', async () => {
    const mockProducts: any[] = [];
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest(
      'http://localhost:3000/api/products?categoryId=cat1&minPrice=50&maxPrice=200&q=test'
    );
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SearchProducts.prototype.execute).toHaveBeenCalledWith({
      categoryId: 'cat1',
      minPrice: 50,
      maxPrice: 200,
      query: 'test',
    });
  });

  test('should handle empty results', async () => {
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue([]);

    const request = new MockNextRequest('http://localhost:3000/api/products');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(data.count).toBe(0);
  });

  test('should handle invalid minPrice parameter', async () => {
    const mockProducts: any[] = [];
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products?minPrice=invalid');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Invalid parseFloat returns NaN, which should be handled
    expect(SearchProducts.prototype.execute).toHaveBeenCalled();
  });

  test('should handle invalid maxPrice parameter', async () => {
    const mockProducts: any[] = [];
    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products?maxPrice=invalid');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SearchProducts.prototype.execute).toHaveBeenCalled();
  });

  test('should handle database errors', async () => {
    const error = new Error('Database connection failed');
    (SearchProducts.prototype.execute as jest.Mock).mockRejectedValue(error);

    const request = new MockNextRequest('http://localhost:3000/api/products');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database connection failed');
  });

  test('should handle unknown errors', async () => {
    (SearchProducts.prototype.execute as jest.Mock).mockRejectedValue('String error');

    const request = new MockNextRequest('http://localhost:3000/api/products');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unknown error');
  });

  test('should return correct response format', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        sku: 'SKU1',
        categoryId: 'cat1',
        stock: 10,
        active: true,
        isAvailable: () => true,
      },
    ];

    (SearchProducts.prototype.execute as jest.Mock).mockResolvedValue(mockProducts);

    const request = new MockNextRequest('http://localhost:3000/api/products');
    const response = await GET(request as unknown as NextRequest);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.data)).toBe(true);
  });
});
