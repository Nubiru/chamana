/**
 * Frontend Logic: Orders Management
 * Maneja la creación, visualización y gestión de pedidos
 */

let itemCounter = 0;
let prendasCache = [];
let clientesCache = [];

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', async () => {
  await loadClientes();
  await loadPrendas();
  await loadOrders();

  // Setup form handler
  document.getElementById('crear-pedido-form').addEventListener('submit', createOrder);
});

/**
 * Cargar clientes para dropdown
 */
async function loadClientes() {
  try {
    const response = await api.getClientes();
    // Handle both array and object with data property
    clientesCache = Array.isArray(response) ? response : response.data || response;
    const select = document.getElementById('cliente-select');

    if (Array.isArray(clientesCache)) {
      clientesCache.forEach((cliente) => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nombre} ${cliente.apellido} (${cliente.email})`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading clientes:', error);
    // Don't alert on load, just log it
  }
}

/**
 * Cargar prendas para items del pedido
 */
async function loadPrendas() {
  try {
    const response = await api.getProductos();
    prendasCache = response.data || response;
  } catch (error) {
    console.error('Error loading prendas:', error);
    alert('Error cargando productos');
  }
}

/**
 * Agregar item al pedido (dinámico)
 * Used from HTML: onclick="addOrderItem()"
 */
function addOrderItem() {
  itemCounter++;
  const container = document.getElementById('order-items-container');

  const itemDiv = document.createElement('div');
  itemDiv.className = 'order-item';
  itemDiv.id = `order-item-${itemCounter}`;

  itemDiv.innerHTML = `
    <div class="order-item-content">
      <select class="prenda-select" data-item-id="${itemCounter}" onchange="updateOrderTotal()" required>
        <option value="">Seleccionar prenda...</option>
        ${prendasCache
          .map(
            (p) => `
          <option value="${p.id}" 
                  data-precio="${p.precio_chamana}" 
                  data-stock="${p.stock_disponible}">
            ${p.nombre} - $${p.precio_chamana.toLocaleString('es-CL')} 
            (Stock: ${p.stock_disponible})
          </option>
        `
          )
          .join('')}
      </select>

      <input type="number" 
             class="cantidad-input" 
             data-item-id="${itemCounter}" 
             min="1" 
             value="1" 
             onchange="updateOrderTotal()" 
             required>

      <button type="button" 
              onclick="removeOrderItem(${itemCounter})" 
              class="btn btn-danger-sm">
        Eliminar
      </button>
    </div>
  `;

  container.appendChild(itemDiv);
  updateOrderTotal();
}
// Expose to window for HTML access
window.addOrderItem = addOrderItem;

/**
 * Remover item del pedido
 * Used from dynamically generated HTML: onclick="removeOrderItem(${itemCounter})"
 */
function removeOrderItem(itemId) {
  const item = document.getElementById(`order-item-${itemId}`);
  if (item) {
    item.remove();
    updateOrderTotal();
  }
}
// Expose to window for HTML access
window.removeOrderItem = removeOrderItem;

/**
 * Calcular y actualizar total del pedido
 */
function updateOrderTotal() {
  let total = 0;

  const items = document.querySelectorAll('.order-item');
  items.forEach((item) => {
    const select = item.querySelector('.prenda-select');
    const cantidadInput = item.querySelector('.cantidad-input');

    if (select.value && cantidadInput.value) {
      const option = select.options[select.selectedIndex];
      const precio = parseFloat(option.dataset.precio);
      const cantidad = parseInt(cantidadInput.value, 10);

      total += precio * cantidad;
    }
  });

  const descuento = parseInt(document.getElementById('descuento-input').value, 10) || 0;
  total -= descuento;

  document.getElementById('order-total').textContent = `$${total.toLocaleString('es-CL')}`;
}

/**
 * Crear pedido (submit form)
 */
async function createOrder(e) {
  e.preventDefault();

  const clienteId = parseInt(document.getElementById('cliente-select').value, 10);
  const descuento = parseInt(document.getElementById('descuento-input').value, 10) || 0;
  const notas = document.getElementById('notas-input').value.trim() || null;

  // Recolectar items
  const items = [];
  const itemDivs = document.querySelectorAll('.order-item');

  for (const itemDiv of itemDivs) {
    const select = itemDiv.querySelector('.prenda-select');
    const cantidadInput = itemDiv.querySelector('.cantidad-input');

    if (select.value && cantidadInput.value) {
      const option = select.options[select.selectedIndex];
      const stock = parseInt(option.dataset.stock, 10);
      const cantidad = parseInt(cantidadInput.value, 10);

      // Validar stock (frontend)
      if (cantidad > stock) {
        alert(`Stock insuficiente para ${option.text}. Disponible: ${stock}`);
        return;
      }

      items.push({
        prenda_id: parseInt(select.value, 10),
        cantidad: cantidad,
        precio_unitario: parseFloat(option.dataset.precio),
      });
    }
  }

  if (items.length === 0) {
    alert('Debe agregar al menos un producto');
    return;
  }

  try {
    const result = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_id: clienteId,
        items,
        descuento,
        notas,
      }),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.message || 'Error creating order');
    }

    alert(
      `✅ Pedido #${
        data.pedido_id
      } creado exitosamente.\nTotal: $${data.total.toLocaleString('es-CL')}`
    );

    // Reset form
    document.getElementById('crear-pedido-form').reset();
    document.getElementById('order-items-container').innerHTML = '';
    itemCounter = 0;

    // Reload orders list
    await loadOrders();
  } catch (error) {
    console.error('Error creating order:', error);
    alert('❌ Error creando pedido: ' + error.message);
  }
}

/**
 * Cargar lista de pedidos
 */
async function loadOrders() {
  try {
    const estado = document.getElementById('estado-filter').value;
    const url = estado ? `/api/pedidos?estado=${estado}` : '/api/pedidos';

    const response = await fetch(url);
    const orders = await response.json();

    const tbody = document.getElementById('orders-table-body');

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.id}</td>
        <td>${new Date(order.fecha_pedido).toLocaleDateString('es-CL')}</td>
        <td>${order.cliente_nombre}</td>
        <td>${order.items_count}</td>
        <td>$${order.total.toLocaleString('es-CL')}</td>
        <td><span class="badge badge-${order.estado}">${order.estado}</span></td>
        <td class="actions">
          <button onclick="viewOrder(${order.id})" class="btn btn-sm">Ver</button>
          ${
            order.estado === 'pendiente'
              ? `
            <button onclick="completarPedido(${order.id})" class="btn btn-sm btn-success">Completar</button>
            <button onclick="cancelarPedido(${order.id})" class="btn btn-sm btn-danger">Cancelar</button>
          `
              : ''
          }
        </td>
      </tr>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Error cargando pedidos');
  }
}

/**
 * Filtrar pedidos por estado
 * Used from HTML: onchange="filterOrders()"
 */
function filterOrders() {
  loadOrders();
}
// Expose to window for HTML access
window.filterOrders = filterOrders;

/**
 * Ver detalles de pedido (modal)
 * Used from dynamically generated HTML: onclick="viewOrder(${order.id})"
 */
async function viewOrder(orderId) {
  try {
    const response = await fetch(`/api/pedidos/${orderId}`);
    const order = await response.json();

    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-details-content');

    document.getElementById('modal-order-id').textContent = order.id;

    content.innerHTML = `
      <div class="order-details">
        <h3>Información del Cliente</h3>
        <p><strong>Cliente:</strong> ${order.cliente_nombre}</p>
        <p><strong>Email:</strong> ${order.cliente_email}</p>
        <p><strong>Teléfono:</strong> ${order.cliente_telefono || 'N/A'}</p>

        <h3>Información del Pedido</h3>
        <p><strong>Fecha:</strong> ${new Date(order.fecha_pedido).toLocaleString('es-CL')}</p>
        <p><strong>Estado:</strong> <span class="badge badge-${order.estado}">${
          order.estado
        }</span></p>
        ${order.notas ? `<p><strong>Notas:</strong> ${order.notas}</p>` : ''}

        <h3>Items del Pedido</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Prenda</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.prenda_nombre}</td>
                <td>${item.prenda_tipo || '-'}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio_unitario.toLocaleString('es-CL')}</td>
                <td>$${item.subtotal.toLocaleString('es-CL')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> $${order.subtotal.toLocaleString('es-CL')}</p>
          <p><strong>Descuento:</strong> -$${order.descuento.toLocaleString('es-CL')}</p>
          <h3><strong>Total:</strong> $${order.total.toLocaleString('es-CL')}</h3>
        </div>

        ${
          order.fecha_completado
            ? `<p class="success"><strong>Completado:</strong> ${new Date(
                order.fecha_completado
              ).toLocaleString('es-CL')}</p>`
            : ''
        }
        ${
          order.fecha_cancelado
            ? `<p class="error"><strong>Cancelado:</strong> ${new Date(
                order.fecha_cancelado
              ).toLocaleString('es-CL')}</p>`
            : ''
        }
      </div>
    `;

    modal.style.display = 'block';
  } catch (error) {
    console.error('Error viewing order:', error);
    alert('Error cargando detalles del pedido');
  }
}
// Expose to window for HTML access
window.viewOrder = viewOrder;

/**
 * Completar pedido
 * Used from dynamically generated HTML: onclick="completarPedido(${order.id})"
 */
async function completarPedido(orderId) {
  if (
    !confirm(
      '¿Completar este pedido?\n\nEsto actualizará el stock de las prendas y no se puede deshacer.'
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/pedidos/${orderId}/completar`, {
      method: 'PUT',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error completing order');
    }

    alert('✅ Pedido completado y stock actualizado');
    await loadOrders();
  } catch (error) {
    console.error('Error completing order:', error);
    alert('❌ Error completando pedido: ' + error.message);
  }
}
// Expose to window for HTML access
window.completarPedido = completarPedido;

/**
 * Cancelar pedido
 * Used from dynamically generated HTML: onclick="cancelarPedido(${order.id})"
 */
async function cancelarPedido(orderId) {
  if (!confirm('¿Cancelar este pedido?')) {
    return;
  }

  try {
    const response = await fetch(`/api/pedidos/${orderId}/cancelar`, {
      method: 'PUT',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error canceling order');
    }

    alert('✅ Pedido cancelado');
    await loadOrders();
  } catch (error) {
    console.error('Error canceling order:', error);
    alert('❌ Error cancelando pedido: ' + error.message);
  }
}
// Expose to window for HTML access
window.cancelarPedido = cancelarPedido;

/**
 * Cerrar modal
 * Used from HTML: onclick="closeOrderModal()"
 */
function closeOrderModal() {
  document.getElementById('order-modal').style.display = 'none';
}
// Expose to window for HTML access
window.closeOrderModal = closeOrderModal;

// Cerrar modal al hacer click fuera
window.onclick = (event) => {
  const modal = document.getElementById('order-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};
