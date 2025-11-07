// =====================================================
// Dashboard JavaScript - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

// API Base URL
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
function showError(containerId, message, retryFunction) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <strong>Error:</strong> ${message}
      ${retryFunction ? `
        <button class="btn btn-sm btn-outline-danger ms-3" onclick="${retryFunction}()">
          <i class="bi bi-arrow-clockwise"></i> Reintentar
        </button>
      ` : ''}
    </div>
  `;
  container.classList.remove('d-none');
}

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadTopProductos();
  await loadInventarioCritico();
  await loadKPIs();
});

// Load Top Products
async function loadTopProductos() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/views/top-productos`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('top-productos-body');
      tbody.innerHTML = '';

      result.data.forEach((producto, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${producto.nombre}</td>
            <td>${producto.unidades_vendidas}</td>
            <td>$${parseFloat(producto.ingresos_generados).toLocaleString('es-CL')}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      document.getElementById('top-productos-loading').classList.add('d-none');
      document.getElementById('top-productos-table').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error loading top products:', error);
    document.getElementById('top-productos-loading').classList.add('d-none');
    showError(
      'top-productos-loading',
      error.message || 'No se pudo cargar los productos. Verifica tu conexión.',
      'loadTopProductos'
    );
  }
}

// Load Critical Inventory
async function loadInventarioCritico() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/views/inventario-critico`);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('inventario-body');
      tbody.innerHTML = '';

      // Update KPI
      document.getElementById('stock-critico').textContent = result.data.length;

      result.data.slice(0, 10).forEach((item) => {
        const alertClass = item.stock_disponible === 0 ? 'danger' : 'warning';
        const row = `
          <tr>
            <td>${item.nombre}</td>
            <td><span class="badge bg-${alertClass}">${item.stock_disponible}</span></td>
            <td>${item.estado_stock}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      document.getElementById('inventario-loading').classList.add('d-none');
      document.getElementById('inventario-table').classList.remove('d-none');
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error loading critical inventory:', error);
    document.getElementById('inventario-loading').classList.add('d-none');
    showError(
      'inventario-loading',
      error.message || 'No se pudo cargar el inventario. Verifica tu conexión.',
      'loadInventarioCritico'
    );
  }
}

// Load KPIs
async function loadKPIs() {
  try {
    // Load sales data
    const ventasResponse = await fetchWithTimeout(`${API_URL}/views/ventas-mensuales`);
    if (ventasResponse.ok) {
      const ventasResult = await ventasResponse.json();
      if (ventasResult.success && ventasResult.data.length > 0) {
        const ventasMes = ventasResult.data[0].total_mes || 0;
        document.getElementById('ventas-mes').textContent =
          `$${parseFloat(ventasMes).toLocaleString('es-CL')}`;
      }
    }

    // Load products count (from top-productos view)
    const productosResponse = await fetchWithTimeout(`${API_URL}/views/top-productos`);
    if (productosResponse.ok) {
      const productosResult = await productosResponse.json();
      if (productosResult.success) {
        document.getElementById('total-productos').textContent = productosResult.data.length;
      }
    }

    // Load clients count (from analisis-clientes view)
    const clientesResponse = await fetchWithTimeout(`${API_URL}/views/analisis-clientes`);
    if (clientesResponse.ok) {
      const clientesResult = await clientesResponse.json();
      if (clientesResult.success) {
        document.getElementById('total-clientes').textContent = clientesResult.data.length;
      }
    }
  } catch (error) {
    console.error('Error loading KPIs:', error);
    // KPIs will show $0 if they fail - acceptable fallback
  }
}
