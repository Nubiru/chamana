// =====================================================
// Reportes JavaScript - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const API_URL = 'http://localhost:3003/api';

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
    const response = await fetch(`${API_URL}/views/ventas-mensuales`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('ventas-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        const tr = `
          <tr>
            <td>${row.mes || 'N/A'}</td>
            <td>$${parseFloat(row.total_ventas || 0).toLocaleString('es-CL')}</td>
            <td>${row.cantidad_pedidos || 0}</td>
            <td>$${parseFloat(row.ticket_promedio || 0).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('ventas-loading').classList.add('d-none');
      document.getElementById('ventas-content').classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error cargando ventas mensuales:', error);
  }
}

// 2. Inventario Crítico
async function loadInventarioCritico() {
  if (!document.getElementById('inventario-content').classList.contains('d-none')) return;

  try {
    const response = await fetch(`${API_URL}/views/inventario-critico`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('inventario-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        const alertClass = row.stock_actual === 0 ? 'danger' : 'warning';
        const tr = `
          <tr>
            <td>${row.nombre_prenda || 'N/A'}</td>
            <td><span class="badge bg-${alertClass}">${row.stock_actual || 0}</span></td>
            <td>${row.alerta_stock || 'N/A'}</td>
            <td>
              ${
                row.stock_actual === 0
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
    }
  } catch (error) {
    console.error('Error cargando inventario crítico:', error);
  }
}

// 3. Top Productos
async function loadTopProductos() {
  if (!document.getElementById('productos-content').classList.contains('d-none')) return;

  try {
    const response = await fetch(`${API_URL}/views/top-productos`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('productos-body');
      tbody.innerHTML = '';

      result.data.forEach((row, index) => {
        const tr = `
          <tr>
            <td>${index + 1}</td>
            <td>${row.nombre_prenda || 'N/A'}</td>
            <td>${row.total_vendido || 0}</td>
            <td>$${parseFloat(row.ingresos_totales || 0).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('productos-loading').classList.add('d-none');
      document.getElementById('productos-content').classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error cargando top productos:', error);
  }
}

// 4. Análisis Clientes
async function loadAnalisisClientes() {
  if (!document.getElementById('clientes-content').classList.contains('d-none')) return;

  try {
    const response = await fetch(`${API_URL}/views/analisis-clientes`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('clientes-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        const tr = `
          <tr>
            <td>${row.nombre_cliente || 'N/A'}</td>
            <td>${row.email || 'N/A'}</td>
            <td>${row.total_pedidos || 0}</td>
            <td>$${parseFloat(row.total_gastado || 0).toLocaleString('es-CL')}</td>
            <td>$${parseFloat(row.promedio_por_pedido || 0).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('clientes-loading').classList.add('d-none');
      document.getElementById('clientes-content').classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error cargando análisis clientes:', error);
  }
}

// 5. Rotación Inventario
async function loadRotacionInventario() {
  if (!document.getElementById('rotacion-content').classList.contains('d-none')) return;

  try {
    const response = await fetch(`${API_URL}/views/rotacion-inventario`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('rotacion-body');
      tbody.innerHTML = '';

      result.data.forEach((row) => {
        const rotacion = parseFloat(row.rotacion || 0);
        let estadoBadge = '<span class="badge bg-success">EXCELENTE</span>';

        if (rotacion > 30) {
          estadoBadge = '<span class="badge bg-danger">LENTO</span>';
        } else if (rotacion > 15) {
          estadoBadge = '<span class="badge bg-warning">NORMAL</span>';
        }

        const tr = `
          <tr>
            <td>${row.nombre_prenda || 'N/A'}</td>
            <td>${row.stock_actual || 0}</td>
            <td>${row.vendidos_ultimos_30_dias || 0}</td>
            <td>${rotacion.toFixed(1)} días</td>
            <td>${estadoBadge}</td>
          </tr>
        `;
        tbody.innerHTML += tr;
      });

      document.getElementById('rotacion-loading').classList.add('d-none');
      document.getElementById('rotacion-content').classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error cargando rotación inventario:', error);
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
