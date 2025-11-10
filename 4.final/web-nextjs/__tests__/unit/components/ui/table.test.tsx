/**
 * Unit Test: Table Components
 *
 * Tests all table component variants (Table, TableHeader, TableBody, etc.)
 */

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { render, screen } from '@testing-library/react';

describe('Table Components', () => {
  test('should render Table with children', () => {
    const { container } = render(
      <Table>
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </Table>
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute('data-slot', 'table');
  });

  test('should render TableHeader', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    expect(thead).toHaveAttribute('data-slot', 'table-header');
  });

  test('should render TableBody', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    expect(tbody).toHaveAttribute('data-slot', 'table-body');
  });

  test('should render TableFooter', () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    const tfoot = container.querySelector('tfoot');
    expect(tfoot).toBeInTheDocument();
    expect(tfoot).toHaveAttribute('data-slot', 'table-footer');
  });

  test('should render TableRow', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const tr = container.querySelector('tr');
    expect(tr).toBeInTheDocument();
    expect(tr).toHaveAttribute('data-slot', 'table-row');
  });

  test('should render TableHead', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header Cell</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    expect(screen.getByText('Header Cell')).toBeInTheDocument();
    const th = screen.getByText('Header Cell').closest('th');
    expect(th).toHaveAttribute('data-slot', 'table-head');
  });

  test('should render TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Data Cell')).toBeInTheDocument();
    const td = screen.getByText('Data Cell').closest('td');
    expect(td).toHaveAttribute('data-slot', 'table-cell');
  });

  test('should render TableCaption', () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Table Caption')).toBeInTheDocument();
    const caption = screen.getByText('Table Caption').closest('caption');
    expect(caption).toHaveAttribute('data-slot', 'table-caption');
  });

  test('should apply custom className to Table', () => {
    const { container } = render(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table.custom-table');
    expect(table).toBeInTheDocument();
  });

  test('should render complete table structure', () => {
    render(
      <Table>
        <TableCaption>Test Table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
            <TableCell>100</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>100</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    // There are two "100" values (body and footer), so use getAllByText
    expect(screen.getAllByText('100').length).toBe(2);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
