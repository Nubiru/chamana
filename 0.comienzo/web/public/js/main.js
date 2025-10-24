// =====================================================
// JavaScript Principal - Fase 0: Comienzo
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 15 de Octubre, 2025
// Versión: 0.1.0
// =====================================================

// Variables globales
let currentData = {
  prendas: [],
  clientes: [],
  categorias: []
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 CHAMANA E-commerce iniciado');

  // Verificar conexión a la API
  testAPIConnection();

  // Cargar datos del dashboard si estamos en la página principal
  if (window.location.pathname === '/') {
    loadDashboardData();
  }
});

// Función para probar la conexión a la API
async function testAPIConnection() {
  try {
    const response = await api.testConnection();
    console.log('✅ Conexión a la API exitosa:', response);
  } catch (error) {
    console.error('❌ Error de conexión a la API:', error);
    showNotification('Error de conexión con el servidor', 'error');
  }
}

// Función para cargar datos del dashboard
async function loadDashboardData() {
  showLoading();

  try {
    // Cargar datos en paralelo
    const [prendasResponse, clientesResponse, categoriasResponse] =
      await Promise.all([
        api.getPrendas(),
        api.getClientes(),
        api.getCategorias()
      ]);

    // Actualizar datos globales
    currentData.prendas = prendasResponse.data || [];
    currentData.clientes = clientesResponse.data || [];
    currentData.categorias = categoriasResponse.data || [];

    // Actualizar estadísticas
    updateStatistics();

    // Actualizar datos recientes
    updateRecentData();

    console.log('✅ Datos del dashboard cargados exitosamente');
  } catch (error) {
    console.error('❌ Error al cargar datos del dashboard:', error);
    handleAPIError(error, 'cargar datos del dashboard');
  } finally {
    hideLoading();
  }
}

// Función para actualizar estadísticas
function updateStatistics() {
  // Total de prendas
  const totalPrendas = currentData.prendas.length;
  document.getElementById('total-prendas').textContent = totalPrendas;

  // Total de clientes
  const totalClientes = currentData.clientes.length;
  document.getElementById('total-clientes').textContent = totalClientes;

  // Total de categorías
  const totalCategorias = currentData.categorias.length;
  document.getElementById('total-categorias').textContent = totalCategorias;

  // Valor total del inventario
  const valorInventario = currentData.prendas.reduce((total, prenda) => {
    return (
      total +
      parseFloat(prenda.precio_chamana || 0) * parseInt(prenda.stock || 0)
    );
  }, 0);

  document.getElementById('valor-inventario').textContent =
    formatCurrency(valorInventario);
}

// Función para actualizar datos recientes
function updateRecentData() {
  // Prendas recientes (últimos 5)
  const recentPrendas = currentData.prendas
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    .slice(0, 5);

  const productosContainer = document.getElementById('recent-productos');
  if (productosContainer) {
    if (recentPrendas.length === 0) {
      productosContainer.innerHTML =
        '<p style="color: #959D90; font-style: italic;">No hay prendas disponibles</p>';
    } else {
      productosContainer.innerHTML = recentPrendas
        .map(
          (prenda) => `
            <p>• <strong>${prenda.nombre_completo}</strong> - ${formatCurrency(
            prenda.precio_chamana
          )} (Stock: ${prenda.stock})</p>
        `
        )
        .join('');
    }
  }

  // Clientes recientes (últimos 5)
  const recentClientes = currentData.clientes
    .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro))
    .slice(0, 5);

  const clientesContainer = document.getElementById('recent-clientes');
  if (clientesContainer) {
    if (recentClientes.length === 0) {
      clientesContainer.innerHTML =
        '<p style="color: #959D90; font-style: italic;">No hay clientes disponibles</p>';
    } else {
      clientesContainer.innerHTML = recentClientes
        .map(
          (cliente) => `
            <p>• <strong>${cliente.nombre} ${cliente.apellido}</strong> - ${cliente.email}</p>
        `
        )
        .join('');
    }
  }
}

// Función para cargar datos recientes (llamada desde botón)
async function loadRecentData() {
  showNotification('Actualizando datos...', 'info', 2000);
  await loadDashboardData();
  showNotification('Datos actualizados correctamente', 'success', 3000);
}

// Función para crear un producto
async function createProducto(productoData) {
  try {
    validateRequired(productoData, ['nombre', 'precio']);

    if (productoData.precio < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    const response = await api.createProducto(productoData);
    showNotification('Producto creado exitosamente', 'success');

    // Recargar datos si estamos en el dashboard
    if (window.location.pathname === '/') {
      await loadDashboardData();
    }

    return response;
  } catch (error) {
    handleAPIError(error, 'crear producto');
    throw error;
  }
}

// Función para crear un usuario
async function createUsuario(usuarioData) {
  try {
    validateRequired(usuarioData, ['nombre', 'email']);

    if (!isValidEmail(usuarioData.email)) {
      throw new Error('El formato del email no es válido');
    }

    const response = await api.createUsuario(usuarioData);
    showNotification('Usuario creado exitosamente', 'success');

    // Recargar datos si estamos en el dashboard
    if (window.location.pathname === '/') {
      await loadDashboardData();
    }

    return response;
  } catch (error) {
    handleAPIError(error, 'crear usuario');
    throw error;
  }
}

// Función para crear una categoría
async function createCategoria(categoriaData) {
  try {
    validateRequired(categoriaData, ['nombre']);

    const response = await api.createCategoria(categoriaData);
    showNotification('Categoría creada exitosamente', 'success');

    // Recargar datos si estamos en el dashboard
    if (window.location.pathname === '/') {
      await loadDashboardData();
    }

    return response;
  } catch (error) {
    handleAPIError(error, 'crear categoría');
    throw error;
  }
}

// Función para eliminar un elemento
async function deleteItem(type, id, name) {
  if (!confirm(`¿Estás seguro de que quieres eliminar ${name}?`)) {
    return;
  }

  showLoading();

  try {
    let response;
    switch (type) {
      case 'producto':
        response = await api.deleteProducto(id);
        break;
      case 'usuario':
        response = await api.deleteUsuario(id);
        break;
      case 'categoria':
        response = await api.deleteCategoria(id);
        break;
      default:
        throw new Error('Tipo de elemento no válido');
    }

    showNotification(
      `${type.charAt(0).toUpperCase() + type.slice(1)} eliminado exitosamente`,
      'success'
    );

    // Recargar datos
    if (window.location.pathname === '/') {
      await loadDashboardData();
    } else {
      // Si estamos en una página específica, recargar la página
      window.location.reload();
    }
  } catch (error) {
    handleAPIError(error, `eliminar ${type}`);
  } finally {
    hideLoading();
  }
}

// Función para buscar elementos
async function searchItems(type, termino) {
  if (!termino || termino.trim() === '') {
    return [];
  }

  try {
    let response;
    switch (type) {
      case 'productos':
        response = await api.searchProductos(termino);
        break;
      case 'usuarios':
        response = await api.searchUsuarios(termino);
        break;
      case 'categorias':
        response = await api.searchCategorias(termino);
        break;
      default:
        throw new Error('Tipo de búsqueda no válido');
    }

    return response.data || [];
  } catch (error) {
    handleAPIError(error, `buscar ${type}`);
    return [];
  }
}

// Función para mostrar formulario modal
function showModal(title, content, onSave = null) {
  // Crear modal si no existe
  let modal = document.getElementById('modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">${title}</h2>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body" id="modal-body">
                    ${content}
                </div>
                <div class="modal-footer" id="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  }

  // Actualizar contenido
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;

  // Agregar botón de guardar si se proporciona función
  const footer = document.getElementById('modal-footer');
  if (onSave) {
    const saveButton = footer.querySelector('.btn-primary');
    if (!saveButton) {
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary';
      saveBtn.textContent = 'Guardar';
      saveBtn.onclick = onSave;
      footer.insertBefore(saveBtn, footer.firstChild);
    }
  }

  // Mostrar modal
  modal.style.display = 'block';
}

// Función para cerrar modal
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function (event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
};

// Función para exportar datos
function exportData(type, format = 'json') {
  try {
    let data, filename;

    switch (type) {
      case 'productos':
        data = currentData.prendas;
        filename = 'productos';
        break;
      case 'usuarios':
        data = currentData.clientes;
        filename = 'usuarios';
        break;
      case 'categorias':
        data = currentData.categorias;
        filename = 'categorias';
        break;
      default:
        throw new Error('Tipo de datos no válido');
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Implementar exportación CSV si es necesario
      showNotification('Exportación CSV no implementada aún', 'warning');
    }

    showNotification(`Datos de ${type} exportados exitosamente`, 'success');
  } catch (error) {
    handleAPIError(error, `exportar datos de ${type}`);
  }
}

// Función para inicializar tooltips
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach((element) => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

// Función para mostrar tooltip
function showTooltip(event) {
  const element = event.target;
  const text = element.getAttribute('data-tooltip');

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  tooltip.id = 'tooltip';

  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  tooltip.style.left =
    rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
  tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

// Función para ocultar tooltip
function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Inicializar tooltips cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeTooltips);

// Exportar funciones globales
window.loadDashboardData = loadDashboardData;
window.loadRecentData = loadRecentData;
window.createProducto = createProducto;
window.createUsuario = createUsuario;
window.createCategoria = createCategoria;
window.deleteItem = deleteItem;
window.searchItems = searchItems;
window.showModal = showModal;
window.closeModal = closeModal;
window.exportData = exportData;
