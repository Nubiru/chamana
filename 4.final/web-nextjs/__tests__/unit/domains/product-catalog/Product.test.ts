/**
 * Product Entity Unit Tests
 *
 * Tests business logic in Product entity
 * Validates domain rules and invariants
 */

import { Product } from '@/domains/product-catalog/entities/Product';

describe('Product Entity', () => {
  describe('Constructor', () => {
    test('should create product with all properties', () => {
      const product = new Product(
        '1',
        'Poncho Andino',
        'Traditional Andean poncho',
        150.0,
        'PON-001',
        'cat-1',
        10,
        true
      );

      expect(product.id).toBe('1');
      expect(product.name).toBe('Poncho Andino');
      expect(product.description).toBe('Traditional Andean poncho');
      expect(product.price).toBe(150.0);
      expect(product.sku).toBe('PON-001');
      expect(product.categoryId).toBe('cat-1');
      expect(product.stock).toBe(10);
      expect(product.active).toBe(true);
    });

    test('should default active to true when not provided', () => {
      const product = new Product('1', 'Poncho', 'Description', 100, 'SKU-001', 'cat-1', 5);

      expect(product.active).toBe(true);
    });
  });

  describe('isAvailable', () => {
    test('should return true when product is active and has stock', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 5, true);
      expect(product.isAvailable()).toBe(true);
    });

    test('should return false when product is inactive', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, false);
      expect(product.isAvailable()).toBe(false);
    });

    test('should return false when stock is zero', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 0, true);
      expect(product.isAvailable()).toBe(false);
    });

    test('should return false when product is inactive and out of stock', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 0, false);
      expect(product.isAvailable()).toBe(false);
    });
  });

  describe('reduceStock', () => {
    test('should reduce stock by specified quantity', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.reduceStock(3);
      expect(product.stock).toBe(7);
    });

    test('should allow reducing stock to zero', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 5, true);
      product.reduceStock(5);
      expect(product.stock).toBe(0);
    });

    test('should throw error when quantity exceeds available stock', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 5, true);

      expect(() => product.reduceStock(10)).toThrow(
        'Insufficient stock. Available: 5, Requested: 10'
      );
    });

    test('should throw error when reducing by one more than stock', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 3, true);

      expect(() => product.reduceStock(4)).toThrow(
        'Insufficient stock. Available: 3, Requested: 4'
      );
    });

    test('should not change stock when error is thrown', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 5, true);

      try {
        product.reduceStock(10);
      } catch {
        // Expected error
      }

      expect(product.stock).toBe(5); // Stock should remain unchanged
    });
  });

  describe('increaseStock', () => {
    test('should increase stock by specified quantity', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.increaseStock(5);
      expect(product.stock).toBe(15);
    });

    test('should allow increasing stock from zero', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 0, true);
      product.increaseStock(10);
      expect(product.stock).toBe(10);
    });

    test('should throw error when quantity is negative', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      expect(() => product.increaseStock(-5)).toThrow('Quantity must be positive');
    });

    test('should not change stock when error is thrown', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      try {
        product.increaseStock(-5);
      } catch {
        // Expected error
      }

      expect(product.stock).toBe(10); // Stock should remain unchanged
    });

    test('should allow increasing by large quantities', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 5, true);
      product.increaseStock(1000);
      expect(product.stock).toBe(1005);
    });
  });

  describe('updatePrice', () => {
    test('should update price to new value', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.updatePrice(150);
      expect(product.price).toBe(150);
    });

    test('should allow setting price to zero', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.updatePrice(0);
      expect(product.price).toBe(0);
    });

    test('should throw error when price is negative', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      expect(() => product.updatePrice(-50)).toThrow('Price must be positive');
    });

    test('should not change price when error is thrown', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      try {
        product.updatePrice(-50);
      } catch {
        // Expected error
      }

      expect(product.price).toBe(100); // Price should remain unchanged
    });

    test('should allow decimal prices', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.updatePrice(99.99);
      expect(product.price).toBe(99.99);
    });
  });

  describe('activate', () => {
    test('should set active to true', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, false);
      product.activate();
      expect(product.active).toBe(true);
    });

    test('should keep active true if already active', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.activate();
      expect(product.active).toBe(true);
    });
  });

  describe('deactivate', () => {
    test('should set active to false', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);
      product.deactivate();
      expect(product.active).toBe(false);
    });

    test('should keep active false if already inactive', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, false);
      product.deactivate();
      expect(product.active).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    test('should handle full product lifecycle', () => {
      // Create product
      const product = new Product('1', 'Poncho', 'Desc', 100, 'SKU', 'cat-1', 20, true);
      expect(product.isAvailable()).toBe(true);

      // Sell some stock
      product.reduceStock(5);
      expect(product.stock).toBe(15);
      expect(product.isAvailable()).toBe(true);

      // Update price
      product.updatePrice(120);
      expect(product.price).toBe(120);

      // Restock
      product.increaseStock(10);
      expect(product.stock).toBe(25);

      // Deactivate
      product.deactivate();
      expect(product.isAvailable()).toBe(false);

      // Reactivate
      product.activate();
      expect(product.isAvailable()).toBe(true);
    });

    test('should become unavailable when stock runs out', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 3, true);
      expect(product.isAvailable()).toBe(true);

      product.reduceStock(3);
      expect(product.stock).toBe(0);
      expect(product.isAvailable()).toBe(false);

      product.increaseStock(5);
      expect(product.isAvailable()).toBe(true);
    });

    test('should handle multiple price updates', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      product.updatePrice(120);
      expect(product.price).toBe(120);

      product.updatePrice(90);
      expect(product.price).toBe(90);

      product.updatePrice(150.5);
      expect(product.price).toBe(150.5);
    });

    test('should handle activation/deactivation cycles', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      product.deactivate();
      expect(product.active).toBe(false);
      expect(product.isAvailable()).toBe(false);

      product.activate();
      expect(product.active).toBe(true);
      expect(product.isAvailable()).toBe(true);

      product.deactivate();
      expect(product.active).toBe(false);
    });
  });

  describe('Edge cases', () => {
    test('should handle product with empty description', () => {
      const product = new Product('1', 'Test', '', 100, 'SKU', 'cat-1', 10, true);
      expect(product.description).toBe('');
    });

    test('should handle very large stock numbers', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 1000000, true);
      product.increaseStock(1000000);
      expect(product.stock).toBe(2000000);
    });

    test('should handle very large prices', () => {
      const product = new Product('1', 'Test', 'Desc', 9999999.99, 'SKU', 'cat-1', 10, true);
      expect(product.price).toBe(9999999.99);
    });

    test('should handle reducing entire stock multiple times', () => {
      const product = new Product('1', 'Test', 'Desc', 100, 'SKU', 'cat-1', 10, true);

      product.reduceStock(10);
      expect(product.stock).toBe(0);

      product.increaseStock(5);
      product.reduceStock(5);
      expect(product.stock).toBe(0);
    });
  });
});
