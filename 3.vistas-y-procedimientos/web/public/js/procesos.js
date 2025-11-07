// =====================================================
// Procesos JavaScript - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const API_URL = 'http://localhost:3003/api';
const historial = [];

// Cargar datos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadPedidos();
  loadPrendas();
});

// Manejadores de formularios
document.getElementById('form-procesar-pedido').addEventListener('submit', procesarPedido);
document.getElementById('form-reabastecer').addEventListener('submit', reabastecerInventario);
document.getElementById('form-comision').addEventListener('submit', calcularComision);

// ===================================================================
// 1. PROCESAR PEDIDO
// ===================================================================

async function loadPedidos() {
  try {
    // Cargar pedidos disponibles desde la base de datos
    // Por ahora, creamos IDs de ejemplo
    const select = document.getElementById('pedido-id');
    select.innerHTML = '<option value="">Seleccionar pedido...</option>';

    // Intentar cargar pedidos reales desde una vista o endpoint
    // Por ahora, generamos IDs de ejemplo del 1 al 10
    for (let i = 1; i <= 10; i++) {
      select.innerHTML += `<option value="${i}">Pedido #${i}</option>`;
    }
  } catch (error) {
    console.error('Error cargando pedidos:', error);
  }
}

async function procesarPedido(e) {
  e.preventDefault();

  const pedidoId = document.getElementById('pedido-id').value;
  const resultDiv = document.getElementById('resultado-pedido');

  resultDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Procesando...';
  resultDiv.classList.remove('d-none', 'alert-success', 'alert-danger');
  resultDiv.classList.add('alert', 'alert-info');

  try {
    const response = await fetch(`${API_URL}/procedures/procesar-pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedido_id: pedidoId }),
    });

    const result = await response.json();

    if (result.success) {
      resultDiv.innerHTML = `
        <i class="bi bi-check-circle"></i>
        <strong>Éxito:</strong> ${result.message}
      `;
      resultDiv.classList.remove('alert-info');
      resultDiv.classList.add('alert-success');

      addToHistory('procesar_pedido', { pedido_id: pedidoId }, 'Éxito');
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    resultDiv.innerHTML = `
      <i class="bi bi-x-circle"></i>
      <strong>Error:</strong> ${error.message}
    `;
    resultDiv.classList.remove('alert-info');
    resultDiv.classList.add('alert-danger');

    addToHistory('procesar_pedido', { pedido_id: pedidoId }, `Error: ${error.message}`);
  }
}

// ===================================================================
// 2. REABASTECER INVENTARIO
// ===================================================================

async function loadPrendas() {
  try {
    const response = await fetch(`${API_URL}/views/inventario-critico`);
    const result = await response.json();

    if (result.success) {
      const select = document.getElementById('prenda-id');
      select.innerHTML = '<option value="">Seleccionar prenda...</option>';

      result.data.forEach((prenda) => {
        // Usar un ID generado si no existe en los datos
        const prendaId = prenda.id || Math.floor(Math.random() * 100);
        select.innerHTML += `
          <option value="${prendaId}">
            ${prenda.nombre_prenda} (Stock: ${prenda.stock_actual})
          </option>
        `;
      });
    }
  } catch (error) {
    console.error('Error cargando prendas:', error);
    // Si falla, crear opciones de ejemplo
    const select = document.getElementById('prenda-id');
    select.innerHTML = '<option value="">Seleccionar prenda...</option>';
    for (let i = 1; i <= 5; i++) {
      select.innerHTML += `<option value="${i}">Prenda #${i}</option>`;
    }
  }
}

async function reabastecerInventario(e) {
  e.preventDefault();

  const prendaId = document.getElementById('prenda-id').value;
  const cantidad = document.getElementById('cantidad').value;
  const resultDiv = document.getElementById('resultado-reabastecer');

  resultDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Reabasteciendo...';
  resultDiv.classList.remove('d-none', 'alert-success', 'alert-danger');
  resultDiv.classList.add('alert', 'alert-info');

  try {
    const response = await fetch(`${API_URL}/procedures/reabastecer-inventario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenda_id: prendaId,
        cantidad: parseInt(cantidad, 10),
      }),
    });

    const result = await response.json();

    if (result.success) {
      resultDiv.innerHTML = `
        <i class="bi bi-check-circle"></i>
        <strong>Éxito:</strong> ${result.message}<br>
        <small>Se agregaron ${cantidad} unidades al inventario</small>
      `;
      resultDiv.classList.remove('alert-info');
      resultDiv.classList.add('alert-success');

      addToHistory('reabastecer_inventario', { prenda_id: prendaId, cantidad }, 'Éxito');

      // Recargar prendas para actualizar stock
      await loadPrendas();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    resultDiv.innerHTML = `
      <i class="bi bi-x-circle"></i>
      <strong>Error:</strong> ${error.message}
    `;
    resultDiv.classList.remove('alert-info');
    resultDiv.classList.add('alert-danger');

    addToHistory(
      'reabastecer_inventario',
      { prenda_id: prendaId, cantidad },
      `Error: ${error.message}`
    );
  }
}

// ===================================================================
// 3. CALCULAR COMISIÓN
// ===================================================================

async function calcularComision(e) {
  e.preventDefault();

  const vendedorId = document.getElementById('vendedor-id').value;
  const mes = document.getElementById('mes').value;
  const año = document.getElementById('año').value;
  const resultDiv = document.getElementById('resultado-comision');

  resultDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Calculando...';
  resultDiv.classList.remove('d-none', 'alert-success', 'alert-danger');
  resultDiv.classList.add('alert', 'alert-info');

  try {
    const response = await fetch(`${API_URL}/procedures/calcular-comision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendedor_id: vendedorId,
        mes: parseInt(mes, 10),
        año: parseInt(año, 10),
      }),
    });

    const result = await response.json();

    if (result.success) {
      const comision = parseFloat(result.comision || 0);
      resultDiv.innerHTML = `
        <i class="bi bi-check-circle"></i>
        <strong>Comisión Calculada:</strong><br>
        <h3 class="mt-2 mb-0">$${comision.toLocaleString('es-CL')}</h3>
        <small>Vendedor #${vendedorId} - ${getMesNombre(mes)} ${año}</small>
      `;
      resultDiv.classList.remove('alert-info');
      resultDiv.classList.add('alert-success');

      addToHistory(
        'calcular_comision_vendedor',
        { vendedor_id: vendedorId, mes, año },
        `$${comision.toLocaleString('es-CL')}`
      );
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    resultDiv.innerHTML = `
      <i class="bi bi-x-circle"></i>
      <strong>Error:</strong> ${error.message}
    `;
    resultDiv.classList.remove('alert-info');
    resultDiv.classList.add('alert-danger');

    addToHistory(
      'calcular_comision_vendedor',
      { vendedor_id: vendedorId, mes, año },
      `Error: ${error.message}`
    );
  }
}

// ===================================================================
// HELPERS
// ===================================================================

function addToHistory(procedure, params, result) {
  const now = new Date().toLocaleTimeString('es-CL');

  historial.unshift({
    hora: now,
    procedimiento: procedure,
    parametros: JSON.stringify(params),
    resultado: result,
  });

  // Mantener solo las últimas 20 ejecuciones
  if (historial.length > 20) {
    historial.pop();
  }

  renderHistory();
}

function renderHistory() {
  const tbody = document.getElementById('historial-body');

  if (historial.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted">No hay ejecuciones registradas</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  historial.forEach((item) => {
    const isSuccess = !item.resultado.startsWith('Error');
    const badgeClass = isSuccess ? 'bg-success' : 'bg-danger';

    const row = `
      <tr>
        <td>${item.hora}</td>
        <td><code>${item.procedimiento}</code></td>
        <td><small>${item.parametros}</small></td>
        <td><span class="badge ${badgeClass}">${item.resultado}</span></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function getMesNombre(mes) {
  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return meses[parseInt(mes, 10) - 1];
}
