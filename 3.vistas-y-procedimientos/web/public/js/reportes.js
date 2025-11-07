// =====================================================
// Reportes JavaScript - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const API_URL = 'http://localhost:3003/api';

// Fetch with timeout helper
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
    }
    throw error;
  }
}

// Show error message helper
function showError(loadingId, message) {
  const loading = document.getElementById(loadingId);
  loading.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <strong>Error:</strong> ${message}
    </div>
  `;
}

// Cargar todos los reportes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadVentasMensuales();

  // Carga diferida de otros reportes cuando se hace clic en las pestañas
  document
    .getElementById('inventario-tab')
    .addEventListener('click', () => loadInventarioCritico());
  document.getElementById('productos-tab').addEventListener('click', () => loadTopProductos());
  document.getElementById('clientes-tab').addEventListener('click', () => loadAnalisisClientes());
  document.getElementById('rotacion-tab').addEventListener('click', () => loadRotacionInventario());
});

// 1. Ventas Mensuales
async function loadVentasMensuales() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/views/ventas-mensuales`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('ventas-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        // Format mes timestamp to readable date
        const mes_formatted = row.mes ? new Date(row.mes).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' }) : 'N/A';

        const tr = `
          <tr>
            <td>${mes_formatted}</td>
            <td>$${parseFloat(row.total_mes || 0).toLocaleString('es-CL')}</td>
            <td>${row.total_pedidos || 0}</td>
            <td>$${parseFloat(row.ticket_promedio || 0).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('ventas-loading').classList.add('d-none');
      document.getElementById('ventas-content').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error cargando ventas mensuales:', error);
    showError('ventas-loading', error.message || 'No se pudo cargar ventas mensuales.');
  }
}

// 2. Inventario Crítico
async function loadInventarioCritico() {
  if (!document.getElementById('inventario-content').classList.contains('d-none')) return;

  try {
    const response = await fetchWithTimeout(`${API_URL}/views/inventario-critico`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('inventario-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        const alertClass = row.stock_disponible === 0 ? 'danger' : 'warning';
        const tr = `
          <tr>
            <td>${row.nombre || 'N/A'}</td>
            <td><span class="badge bg-${alertClass}">${row.stock_disponible || 0}</span></td>
            <td>${row.estado_stock || 'N/A'}</td>
            <td>
              ${
                row.stock_disponible === 0
                  ? '<span class="badge bg-danger">AGOTADO</span>'
                  : '<span class="badge bg-warning">BAJO</span>'
              }
            </td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('inventario-loading').classList.add('d-none');
      document.getElementById('inventario-content').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error cargando inventario crítico:', error);
    showError('inventario-loading', error.message || 'No se pudo cargar inventario crítico.');
  }
}

// 3. Top Productos
async function loadTopProductos() {
  if (!document.getElementById('productos-content').classList.contains('d-none')) return;

  try {
    const response = await fetchWithTimeout(`${API_URL}/views/top-productos`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('productos-body');
      tbody.innerHTML = '';

      result.data.forEach((row, index) => {
        const tr = `
          <tr>
            <td>${index + 1}</td>
            <td>${row.nombre || 'N/A'}</td>
            <td>${row.unidades_vendidas || 0}</td>
            <td>$${parseFloat(row.ingresos_generados || 0).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('productos-loading').classList.add('d-none');
      document.getElementById('productos-content').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error cargando top productos:', error);
    showError('productos-loading', error.message || 'No se pudo cargar top productos.');
  }
}

// 4. Análisis Clientes
async function loadAnalisisClientes() {
  if (!document.getElementById('clientes-content').classList.contains('d-none')) return;

  try {
    const response = await fetchWithTimeout(`${API_URL}/views/analisis-clientes`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('clientes-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        const tr = `
          <tr>
            <td>${row.nombre_completo || 'N/A'}</td>
            <td>${row.email || 'N/A'}</td>
            <td>${row.total_pedidos || 0}</td>
            <td>$${parseFloat(row.total_gastado || 0).toLocaleString('es-CL')}</td>
            <td>$${parseFloat(row.ticket_promedio || 0).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('clientes-loading').classList.add('d-none');
      document.getElementById('clientes-content').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error cargando análisis clientes:', error);
    showError('clientes-loading', error.message || 'No se pudo cargar análisis de clientes.');
  }
}

// 5. Rotación Inventario
async function loadRotacionInventario() {
  if (!document.getElementById('rotacion-content').classList.contains('d-none')) return;

  try {
    const response = await fetchWithTimeout(`${API_URL}/views/rotacion-inventario`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('rotacion-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        // Use porcentaje_vendido from view instead of rotacion
        const porcentaje = parseFloat(row.porcentaje_vendido || 0);
        const clasificacion = row.clasificacion_rotacion || 'Sin Ventas';

        let estadoBadge = '<span class="badge bg-success">ALTA</span>';
        if (clasificacion === 'Sin Ventas') {
          estadoBadge = '<span class="badge bg-danger">SIN VENTAS</span>';
        } else if (clasificacion === 'Baja Rotación') {
          estadoBadge = '<span class="badge bg-danger">BAJA</span>';
        } else if (clasificacion === 'Rotación Media') {
          estadoBadge = '<span class="badge bg-warning">MEDIA</span>';
        } else if (clasificacion === 'Alta Rotación') {
          estadoBadge = '<span class="badge bg-success">ALTA</span>';
        }

        const tr = `
          <tr>
            <td>${row.nombre || 'N/A'}</td>
            <td>${row.stock_disponible || 0}</td>
            <td>${row.stock_vendido || 0}</td>
            <td>${porcentaje.toFixed(1)}%</td>
            <td>${estadoBadge}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('rotacion-loading').classList.add('d-none');
      document.getElementById('rotacion-content').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error cargando rotación inventario:', error);
    showError('rotacion-loading', error.message || 'No se pudo cargar rotación de inventario.');
  }
}

// Exportar tabla a CSV
// Used from HTML: onclick="exportTable('table-id', 'filename')"
function exportTable(tableId, filename) {
  const table = document.getElementById(tableId);
  const csv = [];

  // Obtener encabezados
  const headers = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim());
  csv.push(headers.join(','));

  // Obtener filas
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((td) => {
      // Limpiar contenido de celda (eliminar badges, spans, etc.)
      return td.textContent.trim().replace(/,/g, '');
    });
    csv.push(cells.join(','));
  });

  // Descargar
  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
// Expose to window for HTML access
window.exportTable = exportTable;
