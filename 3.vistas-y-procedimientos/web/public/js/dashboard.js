// =====================================================
// Dashboard JavaScript - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

// API Base URL
const API_URL = 'http://localhost:3003/api';

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadTopProductos();
  await loadInventarioCritico();
  await loadKPIs();
});

// Load Top Products
async function loadTopProductos() {
  try {
    const response = await fetch(`${API_URL}/views/top-productos`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('top-productos-body');
      tbody.innerHTML = '';

      result.data.forEach((producto, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${producto.nombre_prenda}</td>
            <td>${producto.total_vendido}</td>
            <td>$${parseFloat(producto.ingresos_totales).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      document.getElementById('top-productos-loading').classList.add('d-none');
      document.getElementById('top-productos-table').classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error loading top products:', error);
  }
}

// Load Critical Inventory
async function loadInventarioCritico() {
  try {
    const response = await fetch(`${API_URL}/views/inventario-critico`);
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('inventario-body');
      tbody.innerHTML = '';

      // Update KPI
      document.getElementById('stock-critico').textContent = result.data.length;

      result.data.slice(0, 10).forEach((item) => {
        const alertClass = item.stock_actual === 0 ? 'danger' : 'warning';
        const row = `
          <tr>
            <td>${item.nombre_prenda}</td>
            <td><span class="badge bg-${alertClass}">${item.stock_actual}</span></td>
            <td>${item.alerta_stock}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      document.getElementById('inventario-loading').classList.add('d-none');
      document.getElementById('inventario-table').classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error loading critical inventory:', error);
  }
}

// Load KPIs
async function loadKPIs() {
  try {
    // Load sales data
    const ventasResponse = await fetch(`${API_URL}/views/ventas-mensuales`);
    const ventasResult = await ventasResponse.json();

    if (ventasResult.success && ventasResult.data.length > 0) {
      const ventasMes = ventasResult.data[0].total_ventas || 0;
      document.getElementById('ventas-mes').textContent =
        `$${parseFloat(ventasMes).toLocaleString('es-CL')}`;
    }

    // Load products count (from top-productos view)
    const productosResponse = await fetch(`${API_URL}/views/top-productos`);
    const productosResult = await productosResponse.json();

    if (productosResult.success) {
      document.getElementById('total-productos').textContent = productosResult.data.length;
    }

    // Load clients count (from analisis-clientes view)
    const clientesResponse = await fetch(`${API_URL}/views/analisis-clientes`);
    const clientesResult = await clientesResponse.json();

    if (clientesResult.success) {
      document.getElementById('total-clientes').textContent = clientesResult.data.length;
    }
  } catch (error) {
    console.error('Error loading KPIs:', error);
  }
}
