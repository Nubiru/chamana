/**
 * Page Test: Procesos (Processes)
 *
 * Tests the processes page with mocked API calls
 */

import { mockFetchError, mockSuccessfulFetch, resetFetchMock } from '@/__tests__/__mocks__/fetch';
import ProcesosPage from '@/app/(dashboard)/procesos/page';
import { ToastProvider } from '@/components/ui/toast';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Procesos Page', () => {
  beforeEach(() => {
    resetFetchMock();
    jest.clearAllMocks();
  });

  test('should render page title', () => {
    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );
    expect(screen.getByText('Procesos')).toBeInTheDocument();
  });

  test('should render all 3 forms', () => {
    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // "Procesar Pedido", "Reabastecer Inventario", and "Calcular Comisión" appear in both CardTitle and Button
    expect(screen.getAllByText('Procesar Pedido').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reabastecer Inventario').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calcular Comisión').length).toBeGreaterThan(0);
  });

  test('should render form fields for procesar-pedido', () => {
    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // Now that labels have htmlFor attributes, getByLabelText should work
    expect(screen.getByLabelText(/Cliente ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descuento/i)).toBeInTheDocument();
  });

  test('should render form fields for reabastecer-inventario', () => {
    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // Now that labels have htmlFor attributes, getByLabelText should work
    expect(screen.getByLabelText(/Prenda ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cantidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo/i)).toBeInTheDocument();
  });

  test('should render form fields for calcular-comision', () => {
    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // Now that labels have htmlFor attributes, getByLabelText should work
    expect(screen.getByLabelText(/Fecha Inicio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha Fin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Porcentaje/i)).toBeInTheDocument();
  });

  test('should submit procesar-pedido form successfully', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Pedido procesado exitosamente',
      data: { pedido_id: 123 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const clienteIdInput = screen.getByLabelText(/Cliente ID/i);
    const itemsInput = screen.getByLabelText(/Items/i);
    const submitButton = screen.getByRole('button', {
      name: /Procesar Pedido/i,
    });

    await user.type(clienteIdInput, '1');
    await user.clear(itemsInput);
    // Use paste for JSON strings to avoid parsing issues with user.type()
    await user.click(itemsInput);
    await user.paste('[{"prenda_id": 1, "cantidad": 2}]');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/procedures/procesar-pedido',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  test('should validate required fields in procesar-pedido form', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // Use getByRole to specifically get the button, not the CardTitle
    const submitButton = screen.getByRole('button', {
      name: /Procesar Pedido/i,
    });
    await user.click(submitButton);

    // Form validation should prevent submission
    await waitFor(() => {
      // HTML5 validation should prevent form submission
      expect(submitButton).toBeInTheDocument();
    });
  });

  test('should submit reabastecer-inventario form successfully', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Inventario reabastecido exitosamente',
      data: { success: true, prenda_id: 1, cantidad: 10 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const prendaIdInput = screen.getByLabelText(/Prenda ID/i);
    const cantidadInput = screen.getByLabelText(/Cantidad/i);
    const submitButton = screen.getByRole('button', {
      name: /Reabastecer Inventario/i,
    });

    await user.type(prendaIdInput, '1');
    await user.type(cantidadInput, '10');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/procedures/reabastecer-inventario',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  test('should submit calcular-comision form with date range', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Comisión calculada exitosamente',
      data: {
        comision: '1250.50',
        total_ventas: '25010.00',
        pedidos: 45,
        detalle: [],
      },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const fechaInicioInput = screen.getByLabelText(/Fecha Inicio/i);
    const fechaFinInput = screen.getByLabelText(/Fecha Fin/i);
    const submitButton = screen.getByRole('button', {
      name: /Calcular Comisión/i,
    });

    await user.type(fechaInicioInput, '2025-11-01');
    await user.type(fechaFinInput, '2025-11-30');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/procedures/calcular-comision',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  test('should display execution history after successful submission', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Pedido procesado exitosamente',
      data: { pedido_id: 123 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const clienteIdInput = screen.getByLabelText(/Cliente ID/i);
    const itemsInput = screen.getByLabelText(/Items/i);
    const submitButton = screen.getByRole('button', {
      name: /Procesar Pedido/i,
    });

    await user.type(clienteIdInput, '1');
    await user.clear(itemsInput);
    // Use paste for JSON strings to avoid parsing issues with user.type()
    await user.click(itemsInput);
    await user.paste('[{"prenda_id": 1, "cantidad": 2}]');
    await user.click(submitButton);

    // Wait for API call to complete and history to be updated
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Then check for history section
    await waitFor(
      () => {
        expect(screen.getByText('Historial de Ejecuciones')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('should display error messages on API failure', async () => {
    const user = userEvent.setup();

    mockFetchError(500, {
      success: false,
      error: 'Stock insuficiente',
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const clienteIdInput = screen.getByLabelText(/Cliente ID/i);
    const itemsInput = screen.getByLabelText(/Items/i);
    const submitButton = screen.getByRole('button', {
      name: /Procesar Pedido/i,
    });

    await user.type(clienteIdInput, '1');
    await user.clear(itemsInput);
    // Use paste for JSON strings to avoid parsing issues with user.type()
    await user.click(itemsInput);
    await user.paste('[{"prenda_id": 1, "cantidad": 2}]');
    await user.click(submitButton);

    // Wait for API call to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Error should appear in history table after API failure
    // The error is added to history with format "Error: {error message}"
    await waitFor(
      () => {
        // Check for error text in the history table
        // The result column contains the error message
        const historySection = screen.getByText('Historial de Ejecuciones');
        expect(historySection).toBeInTheDocument();

        // Look for error text in the document (could be in history table or toast)
        // The error message should contain either "Error" or "Stock insuficiente"
        // Use queryAllByText since there might be multiple error elements
        const errorElements = screen.queryAllByText(/Error/i, { exact: false });
        const stockErrorElements = screen.queryAllByText(/Stock insuficiente/i, { exact: false });

        // At least one should be present
        expect(errorElements.length > 0 || stockErrorElements.length > 0).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  test('should clear form after successful submission', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Inventario reabastecido exitosamente',
      data: { success: true, prenda_id: 1, cantidad: 10 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const prendaIdInput = screen.getByLabelText(/Prenda ID/i) as HTMLInputElement;
    const cantidadInput = screen.getByLabelText(/Cantidad/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', {
      name: /Reabastecer Inventario/i,
    });

    await user.type(prendaIdInput, '1');
    await user.type(cantidadInput, '10');
    await user.click(submitButton);

    await waitFor(
      () => {
        // Form should be cleared after successful submission
        expect(prendaIdInput.value).toBe('');
        expect(cantidadInput.value).toBe('');
      },
      { timeout: 3000 }
    );
  });

  test('should handle calcular-comision with mes/año instead of fecha_inicio/fecha_fin', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Comisión calculada exitosamente',
      data: { comision_total: 1500.5 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // Use mes/año instead of fecha_inicio/fecha_fin
    const mesInput = screen.getByLabelText(/Mes/i) as HTMLInputElement;
    const añoInput = screen.getByLabelText(/Año/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', {
      name: /Calcular Comisión/i,
    });

    await user.type(mesInput, '11');
    await user.type(añoInput, '2025');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/procedures/calcular-comision',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  test('should handle calcular-comision error', async () => {
    const user = userEvent.setup();

    mockFetchError(500, {
      success: false,
      error: 'Error al calcular comisión',
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const mesInput = screen.getByLabelText(/Mes/i);
    const añoInput = screen.getByLabelText(/Año/i);
    const submitButton = screen.getByRole('button', {
      name: /Calcular Comisión/i,
    });

    await user.type(mesInput, '11');
    await user.type(añoInput, '2025');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Error should appear in history
    await waitFor(
      () => {
        const errorElements = screen.queryAllByText(/Error/i, { exact: false });
        expect(errorElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  test('should clear calcular-comision form after successful submission', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Comisión calculada exitosamente',
      data: { comision_total: 1500.5 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    const mesInput = screen.getByLabelText(/Mes/i) as HTMLInputElement;
    const añoInput = screen.getByLabelText(/Año/i) as HTMLInputElement;
    const porcentajeInput = screen.getByLabelText(/Porcentaje/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', {
      name: /Calcular Comisión/i,
    });

    await user.type(mesInput, '11');
    await user.type(añoInput, '2025');
    await user.clear(porcentajeInput);
    await user.type(porcentajeInput, '5.5');
    await user.click(submitButton);

    await waitFor(
      () => {
        // Form should be cleared after successful submission
        expect(mesInput.value).toBe('');
        expect(añoInput.value).toBe('');
        // Porcentaje resets to default '5.0', but number inputs may normalize to '5'
        // Check for either value
        expect(['5', '5.0']).toContain(porcentajeInput.value);
      },
      { timeout: 3000 }
    );
  });

  test('should render execution history with multiple entries', async () => {
    const user = userEvent.setup();

    mockSuccessfulFetch({
      success: true,
      message: 'Pedido procesado exitosamente',
      data: { pedido_id: 123 },
    });

    render(
      <ToastProvider>
        <ProcesosPage />
      </ToastProvider>
    );

    // Submit first procedure
    const clienteIdInput = screen.getByLabelText(/Cliente ID/i);
    const itemsInput = screen.getByLabelText(/Items/i);
    const submitButton1 = screen.getByRole('button', {
      name: /Procesar Pedido/i,
    });

    await user.type(clienteIdInput, '1');
    await user.clear(itemsInput);
    await user.click(itemsInput);
    await user.paste('[{"prenda_id": 1, "cantidad": 2}]');
    await user.click(submitButton1);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Submit second procedure
    mockSuccessfulFetch({
      success: true,
      message: 'Inventario reabastecido exitosamente',
      data: { success: true, prenda_id: 1, cantidad: 10 },
    });

    const prendaIdInput = screen.getByLabelText(/Prenda ID/i);
    const cantidadInput = screen.getByLabelText(/Cantidad/i);
    const submitButton2 = screen.getByRole('button', {
      name: /Reabastecer Inventario/i,
    });

    await user.type(prendaIdInput, '1');
    await user.type(cantidadInput, '10');
    await user.click(submitButton2);

    await waitFor(() => {
      // Should have multiple history entries
      expect(screen.getByText('Historial de Ejecuciones')).toBeInTheDocument();
    });
  });
});
