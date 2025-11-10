/**
 * Unit Test: Loading Skeleton Components
 *
 * Tests the loading skeleton components used for loading states
 */

import { DashboardSkeleton, TableSkeleton } from '@/components/loading-skeleton';
import { render } from '@testing-library/react';

describe('Loading Skeleton Components', () => {
  describe('DashboardSkeleton', () => {
    test('should render dashboard skeleton', () => {
      const { container } = render(<DashboardSkeleton />);

      // Skeleton component uses className with "animate-pulse", check for that
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('should render KPI card skeletons', () => {
      const { container } = render(<DashboardSkeleton />);

      // Should have 4 KPI card skeletons
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(4);
    });

    test('should render chart skeletons', () => {
      const { container } = render(<DashboardSkeleton />);

      // Should have chart skeletons
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('TableSkeleton', () => {
    test('should render table skeleton with default rows', () => {
      const { container } = render(<TableSkeleton />);

      // Should render header skeleton and 5 row skeletons (default)
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBe(6); // 1 header + 5 rows
    });

    test('should render table skeleton with custom row count', () => {
      const { container } = render(<TableSkeleton rows={10} />);

      // Should render header skeleton and 10 row skeletons
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBe(11); // 1 header + 10 rows
    });

    test('should render table skeleton with 0 rows', () => {
      const { container } = render(<TableSkeleton rows={0} />);

      // Should render only header skeleton
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBe(1); // 1 header only
    });
  });
});
