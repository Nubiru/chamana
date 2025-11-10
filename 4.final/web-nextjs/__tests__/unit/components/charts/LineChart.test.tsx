/**
 * Component Test: LineChart
 *
 * Tests the LineChart component with mocked Chart.js
 */

import { LineChart } from '@/components/charts/LineChart';
import { render, screen } from '@testing-library/react';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(({ data, options }) => (
    <div data-testid="line-chart">
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
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('LineChart Component', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Sales',
        data: [100, 200, 150, 300],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  test('should render without crashing', () => {
    render(<LineChart {...mockData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('should render with title', () => {
    render(<LineChart {...mockData} title="Monthly Sales" />);
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Monthly Sales');
  });

  test('should render without title when not provided', () => {
    render(<LineChart {...mockData} />);
    expect(screen.getByTestId('chart-title')).toHaveTextContent('');
  });

  test('should pass labels to chart', () => {
    render(<LineChart {...mockData} />);
    const labelsElement = screen.getByTestId('chart-labels');
    expect(labelsElement).toHaveTextContent(JSON.stringify(mockData.labels));
  });

  test('should pass datasets to chart', () => {
    render(<LineChart {...mockData} />);
    const datasetsElement = screen.getByTestId('chart-datasets');
    expect(datasetsElement).toHaveTextContent(JSON.stringify(mockData.datasets));
  });

  test('should render with multiple datasets', () => {
    const multiDatasetData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          label: 'Sales',
          data: [100, 200, 150],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'Expenses',
          data: [50, 100, 75],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
      ],
    };

    render(<LineChart {...multiDatasetData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('should handle empty data gracefully', () => {
    const emptyData = {
      labels: [],
      datasets: [
        {
          label: 'Empty',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    };

    render(<LineChart {...emptyData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
