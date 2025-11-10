/**
 * Component Test: BarChart
 *
 * Tests the BarChart component with mocked Chart.js
 */

import { BarChart } from '@/components/charts/BarChart';
import { render, screen } from '@testing-library/react';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Bar: jest.fn(({ data, options }) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-labels">{JSON.stringify(data.labels)}</div>
      <div data-testid="chart-datasets">{JSON.stringify(data.datasets)}</div>
      <div data-testid="chart-title">{options?.plugins?.title?.text || ''}</div>
    </div>
  )),
}));

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('BarChart Component', () => {
  const mockData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
      {
        label: 'Units Sold',
        data: [50, 75, 100, 60],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  test('should render without crashing', () => {
    render(<BarChart {...mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('should render with title', () => {
    render(<BarChart {...mockData} title="Top Products" />);
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Top Products');
  });

  test('should render without title when not provided', () => {
    render(<BarChart {...mockData} />);
    expect(screen.getByTestId('chart-title')).toHaveTextContent('');
  });

  test('should pass labels to chart', () => {
    render(<BarChart {...mockData} />);
    const labelsElement = screen.getByTestId('chart-labels');
    expect(labelsElement).toHaveTextContent(JSON.stringify(mockData.labels));
  });

  test('should pass datasets to chart', () => {
    render(<BarChart {...mockData} />);
    const datasetsElement = screen.getByTestId('chart-datasets');
    expect(datasetsElement).toHaveTextContent(JSON.stringify(mockData.datasets));
  });

  test('should render with multiple datasets', () => {
    const multiDatasetData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales',
          data: [1000, 2000, 1500, 3000],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Target',
          data: [1200, 1800, 1600, 2800],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
      ],
    };

    render(<BarChart {...multiDatasetData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('should handle empty data gracefully', () => {
    const emptyData = {
      labels: [],
      datasets: [
        {
          label: 'Empty',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
      ],
    };

    render(<BarChart {...emptyData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
