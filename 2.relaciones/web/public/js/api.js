// =====================================================
// API Client - Fase 0: Comienzo
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 15 de Octubre, 2025
// Versión: 0.1.0
// =====================================================

class APIClient {
  constructor() {
    this.baseURL = '/api';
  }

  // Método genérico para hacer peticiones HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Wrap array responses in {data: [...]} for backwards compatibility
      if (Array.isArray(data)) {
        return { data };
      }

      // If data is already an object with a message or data field, return as-is
      if (data && (data.data || data.message)) {
        return data;
      }

      // Otherwise wrap in {data: ...}
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Método conveniente para GET requests
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Métodos para Prendas (usando endpoint /productos)
  async getPrendas() {
    return this.request('/productos');
  }

  async getPrenda(id) {
    return this.request(`/productos/${id}`);
  }

  async createPrenda(prenda) {
    return this.request('/productos', {
      method: 'POST',
      body: JSON.stringify(prenda),
    });
  }

  async updatePrenda(id, prenda) {
    return this.request(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prenda),
    });
  }

  async deletePrenda(id) {
    return this.request(`/productos/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPrendas(termino) {
    return this.request(`/productos/buscar/${encodeURIComponent(termino)}`);
  }

  // Métodos de compatibilidad para productos
  async getProductos() {
    return this.getPrendas();
  }

  async getProducto(id) {
    return this.getPrenda(id);
  }

  async createProducto(producto) {
    return this.createPrenda(producto);
  }

  async updateProducto(id, producto) {
    return this.updatePrenda(id, producto);
  }

  async deleteProducto(id) {
    return this.deletePrenda(id);
  }

  async searchProductos(termino) {
    return this.searchPrendas(termino);
  }

  // Métodos para Telas (Seasonal Fabrics)
  async getTelas(temporada = null, año = null) {
    let endpoint = '/telas/temporadas';
    const params = new URLSearchParams();
    if (temporada) params.append('temporada', temporada);
    if (año) params.append('año', año);
    if (params.toString()) endpoint += '?' + params.toString();
    return this.request(endpoint);
  }

  async getTelasBySeason(temporada) {
    return this.getTelas(temporada, null);
  }

  async getTemporadas() {
    return this.request('/telas/seasons');
  }

  async getAños() {
    return this.request('/telas/years');
  }

  // Métodos para Clientes (usando endpoint /usuarios)
  async getClientes() {
    return this.request('/usuarios');
  }

  async getCliente(id) {
    return this.request(`/usuarios/${id}`);
  }

  async createCliente(usuario) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  }

  async updateCliente(id, usuario) {
    return this.request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  }

  async deleteCliente(id) {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  async searchClientes(termino) {
    return this.request(`/usuarios/buscar/${encodeURIComponent(termino)}`);
  }

  async getClientesEstadisticas() {
    return this.request('/usuarios/estadisticas');
  }

  // Métodos para Categorías
  async getCategorias() {
    return this.request('/categorias');
  }

  async getCategoria(id) {
    return this.request(`/categorias/${id}`);
  }

  async createCategoria(categoria) {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  async updateCategoria(id, categoria) {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    });
  }

  async deleteCategoria(id) {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCategorias(termino) {
    return this.request(`/categorias/buscar/${encodeURIComponent(termino)}`);
  }

  async getProductosByCategoria(categoriaId) {
    return this.request(`/categorias/${categoriaId}/productos`);
  }

  // Método para probar la conexión
  async testConnection() {
    return this.request('/test');
  }
}

// Crear instancia global del cliente API
const api = new APIClient();

// Funciones de utilidad para el manejo de errores
function handleAPIError(error, context = '') {
  console.error(`Error en ${context}:`, error);

  let message = 'Ha ocurrido un error inesperado';

  if (error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  showNotification(message, 'error');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info', duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">&times;</button>
        </div>
    `;

  container.appendChild(notification);

  // Auto-remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, duration);
}

// Función para mostrar loading
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

// Función para ocultar loading
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Función para formatear números como moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

// Función para formatear fechas
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Función para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar datos requeridos
function validateRequired(data, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Los siguientes campos son requeridos: ${missing.join(', ')}`);
  }
}

// Exportar para uso global
window.api = api;
window.handleAPIError = handleAPIError;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.isValidEmail = isValidEmail;
window.validateRequired = validateRequired;
