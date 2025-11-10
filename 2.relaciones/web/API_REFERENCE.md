# Referencia de API - Fase 2

## URL Base

```
http://localhost:3000/api
```

## Autenticación

Ninguna (fase universitaria - agregar auth en producción)

## Endpoints

### Categorias

#### Listar Categorías

```http
GET /categorias
```

Retorna todas las categorías.

**Respuesta**:

```json
[
  {
    "id": 1,
    "nombre": "Buzo",
    "descripcion": "Buzos y sudaderas"
  }
]
```

#### Obtener Categoría por ID

```http
GET /categorias/:id
```

**Respuesta**:

```json
{
  "id": 1,
  "nombre": "Buzo",
  "descripcion": "Buzos y sudaderas",
  "fecha_creacion": "2025-10-20T10:00:00.000Z"
}
```

#### Obtener Productos en Categoría

```http
GET /categorias/:id/prendas
```

Retorna todos los productos en la categoría.

**Respuesta**:

```json
[
  {
    "id": 1,
    "nombre": "Prenda-Cat1-ID1",
    "tipo": "Prenda",
    "precio_chamana": "40000.00",
    "stock_disponible": 5,
    "tela_nombre": "Jersey Bordó"
  }
]
```

---

### Productos

#### Listar Productos

```http
GET /productos?categoria_id=1&activa=true&tela_ids=1,2,3
```

**Parámetros de Consulta**:

- `categoria_id` (opcional) - Filtrar por categoría
- `activa` (opcional) - Filtrar por estado activo (por defecto: true)
- `tela_ids` (opcional) - IDs de tela separados por comas (para filtrado estacional)
- `limit` (opcional) - Máximo de resultados (por defecto: 50)
- `offset` (opcional) - Desplazamiento de paginación (por defecto: 0)

**Respuesta**:

```json
[
  {
    "id": 1,
    "nombre": "Prenda-Cat1-ID1",
    "tipo": "Prenda",
    "precio_chamana": "40000.00",
    "activa": true,
    "stock_disponible": 0,
    "stock_inicial": 1,
    "stock_vendido": 1,
    "fecha_ultima_venta": "2025-10-23T00:09:14.879Z",
    "categoria_nombre": "Buzo",
    "tela_nombre": "Jersey Bordó",
    "coleccion_nombre": "Verano 2025",
    "diseno_nombre": "Diseño Clásico",
    "coleccion_año": 2025,
    "coleccion_temporada": "Verano"
  }
]
```

#### Obtener Producto por ID

```http
GET /productos/:id
```

**Respuesta**:

```json
{
  "id": 1,
  "nombre": "Prenda-Cat1-ID1",
  "tipo": "Prenda",
  "precio_chamana": "40000.00",
  "activa": true,
  "stock_disponible": 0,
  "stock_inicial": 1,
  "stock_vendido": 1,
  "fecha_ultima_venta": "2025-10-23T00:09:14.879Z",
  "fecha_creacion": "2025-10-20T10:00:00.000Z",
  "categoria_id": 1,
  "categoria_nombre": "Buzo",
  "tela_id": 1,
  "tela_nombre": "Jersey Bordó",
  "diseno_id": 1,
  "diseno_nombre": "Diseño Clásico",
  "coleccion_id": 1,
  "coleccion_nombre": "Verano 2025"
}
```

#### Obtener Historial de Stock ⭐ NUEVO

```http
GET /productos/:id/historial-stock?limit=50
```

Retorna el historial de movimientos de inventario para un producto específico.

**Parámetros de Consulta**:

- `limit` (opcional) - Máximo de resultados (por defecto: sin límite)

**Respuesta**:

```json
[
  {
    "id": 9,
    "prenda_id": 1,
    "fecha": "2025-10-23T00:09:14.879Z",
    "tipo": "venta",
    "cantidad": 1,
    "stock_anterior": 1,
    "stock_nuevo": 0,
    "motivo": "Venta en pedido #6",
    "pedido_id": 6,
    "fecha_pedido": "2025-10-23T00:09:14.879Z"
  }
]
```

**Tipos de Movimiento**:

- `venta` - Venta (disminuye stock)
- `recepcion` - Recepción (aumenta stock)
- `ajuste` - Ajuste (corrección manual)

---

### Pedidos (Orders)

#### Listar Pedidos

```http
GET /pedidos?cliente_id=1&estado=pendiente
```

**Parámetros de Consulta**:

- `cliente_id` (opcional) - Filtrar por cliente
- `estado` (opcional) - Filtrar por estado (pendiente/completado/cancelado)
- `limit` (opcional) - Máximo de resultados (por defecto: 50)
- `offset` (opcional) - Desplazamiento de paginación

**Respuesta**:

```json
[
  {
    "id": 8,
    "cliente_id": 18,
    "cliente_nombre": "Isabella González Sánchez",
    "fecha_pedido": "2025-10-22T10:30:13.681Z",
    "estado": "pendiente",
    "subtotal": "80000.00",
    "descuento": "0.00",
    "total": "80000.00",
    "items_count": 2,
    "notas": null
  }
]
```

#### Obtener Pedido por ID

```http
GET /pedidos/:id
```

**Respuesta**:

```json
{
  "pedido": {
    "id": 8,
    "cliente_id": 18,
    "cliente_nombre": "Isabella González Sánchez",
    "cliente_email": "isabella.gonzalez@email.com",
    "fecha_pedido": "2025-10-22T10:30:13.681Z",
    "estado": "pendiente",
    "subtotal": "80000.00",
    "descuento": "0.00",
    "total": "80000.00",
    "notas": null
  },
  "items": [
    {
      "id": 15,
      "prenda_id": 6,
      "prenda_nombre": "Prenda-Cat1-ID6",
      "cantidad": 2,
      "precio_unitario": "40000.00",
      "subtotal": "80000.00"
    }
  ]
}
```

#### Crear Pedido

```http
POST /pedidos
```

**Cuerpo de la Petición**:

```json
{
  "cliente_id": 1,
  "items": [
    {
      "prenda_id": 6,
      "cantidad": 2,
      "precio_unitario": 40000
    }
  ],
  "descuento": 0,
  "notas": "Entrega urgente"
}
```

**Validación**:

- `cliente_id`: Requerido, debe existir
- `items`: Requerido, array no vacío
- `items[].prenda_id`: Requerido, debe existir
- `items[].cantidad`: Requerido, entero positivo
- `items[].precio_unitario`: Requerido, número positivo
- `descuento`: Opcional, número no negativo
- `notas`: Opcional, string

**Respuesta**:

```json
{
  "pedido_id": 11,
  "cliente_nombre": "María García López",
  "total": "80000.00",
  "estado": "pendiente",
  "fecha_pedido": "2025-10-23T15:30:00.000Z"
}
```

#### Completar Pedido

```http
PUT /pedidos/:id/completar
```

Marca el pedido como completado y actualiza el stock. Crea registros de movimientos de inventario.

**Respuesta**:

```json
{
  "pedido_id": 8,
  "estado": "completado",
  "fecha_completado": "2025-10-23T15:35:00.000Z",
  "stock_updates": [
    {
      "prenda_id": 6,
      "nombre": "Prenda-Cat1-ID6",
      "cantidad_vendida": 2,
      "stock_anterior": 3,
      "stock_nuevo": 1
    }
  ]
}
```

**Reglas de Negocio**:

- El pedido debe estar en estado `pendiente`
- Todos los productos deben tener stock suficiente
- Las actualizaciones de stock son atómicas (todo o nada)
- Crea registros en `movimientos_inventario`
- Actualiza `fecha_ultima_venta` para cada producto

#### Cancelar Pedido

```http
PUT /pedidos/:id/cancelar
```

**Respuesta**:

```json
{
  "pedido_id": 8,
  "estado": "cancelado",
  "fecha_cancelacion": "2025-10-23T15:40:00.000Z"
}
```

---

### Telas (Telas Estacionales) ⭐ NUEVO

#### Filtrar Telas por Temporada/Año

```http
GET /telas/temporadas?temporada=Invierno&año=2025&activo=true
```

Demuestra normalización 2NF con relación muchos-a-muchos entre `telas` y `temporadas`.

**Parámetros de Consulta**:

- `temporada` (opcional) - Nombre de temporada (Verano, Invierno)
- `año` (opcional) - Año (2024, 2025, 2026)
- `activo` (opcional) - Filtrar solo activos (por defecto: todos)

**Respuesta**:

```json
[
  {
    "id": 1,
    "nombre": "Jersey Bordó",
    "tipo": "Jersey",
    "descripcion": "Jersey suave color bordó",
    "costo_por_metro": "5000.00",
    "temporada_nombre": "Invierno",
    "año_valor": 2025,
    "activo": true,
    "fecha_inicio": "2025-03-01",
    "fecha_fin": "2025-08-31"
  }
]
```

**Caso de Uso**:

Este endpoint permite el filtrado estacional de productos en el frontend:

1. Usuario selecciona "Invierno" + "2025"
2. Frontend llama `/api/telas/temporadas?temporada=Invierno&año=2025&activo=true`
3. Obtiene lista de IDs de tela: `[1, 2, 3]`
4. Frontend llama `/api/productos?tela_ids=1,2,3`
5. Muestra solo productos hechos con telas de invierno 2025

---

### Usuarios (Clientes)

#### Listar Usuarios

```http
GET /usuarios
```

**Respuesta**:

```json
[
  {
    "id": 1,
    "nombre": "María",
    "apellido": "García López",
    "email": "maria.garcia@email.com",
    "telefono": "+56912345678",
    "direccion": "Calle Principal 123",
    "ciudad": "Santiago",
    "codigo_postal": "8320000",
    "activo": true,
    "fecha_registro": "2025-01-15T10:00:00.000Z"
  }
]
```

#### Obtener Usuario por ID

```http
GET /usuarios/:id
```

**Respuesta**:

```json
{
  "id": 1,
  "nombre": "María",
  "apellido": "García López",
  "email": "maria.garcia@email.com",
  "telefono": "+56912345678",
  "direccion": "Calle Principal 123",
  "ciudad": "Santiago",
  "codigo_postal": "8320000",
  "activo": true,
  "fecha_registro": "2025-01-15T10:00:00.000Z"
}
```

#### Crear Usuario

```http
POST /usuarios
```

**Cuerpo de la Petición**:

```json
{
  "nombre": "Ana",
  "apellido": "Silva",
  "email": "ana.silva@email.com",
  "telefono": "+56987654321",
  "direccion": "Calle Falsa 123",
  "ciudad": "Valparaíso",
  "codigo_postal": "2340000"
}
```

**Respuesta**:

```json
{
  "id": 25,
  "nombre": "Ana",
  "apellido": "Silva",
  "email": "ana.silva@email.com",
  "fecha_registro": "2025-10-23T15:45:00.000Z"
}
```

#### Actualizar Usuario

```http
PUT /usuarios/:id
```

**Cuerpo de la Petición** (actualizaciones parciales soportadas):

```json
{
  "telefono": "+56999888777",
  "direccion": "Nueva Dirección 456"
}
```

**Respuesta**:

```json
{
  "id": 1,
  "nombre": "María",
  "apellido": "García López",
  "telefono": "+56999888777",
  "direccion": "Nueva Dirección 456"
}
```

#### Eliminar Usuario

```http
DELETE /usuarios/:id
```

**Respuesta**:

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Respuestas de Error

Todos los errores siguen este formato:

```json
{
  "success": false,
  "error": "Mensaje de error amigable al usuario",
  "details": {
    "originalError": {...},
    "query": "..."
  },
  "stack": "Stack trace del error (solo en desarrollo)"
}
```

### Códigos de Estado

- `200` - Éxito
- `400` - Error de validación (ValidationError)
- `404` - No encontrado (NotFoundError)
- `500` - Error del servidor (DatabaseError, errores inesperados)

### Ejemplos de Error

**Error de Validación** (400):

```json
{
  "success": false,
  "error": "cliente_id es requerido"
}
```

**Error No Encontrado** (404):

```json
{
  "success": false,
  "error": "Producto con id 999 no encontrado"
}
```

**Error de Base de Datos** (500):

```json
{
  "success": false,
  "error": "Error de base de datos",
  "details": {
    "originalError": "relation \"productos\" does not exist"
  }
}
```

**Error de Stock Insuficiente** (400):

```json
{
  "success": false,
  "error": "Stock insuficiente al completar pedido. Prenda 6: disponible 1, necesario 2"
}
```

---

## Testing

### Health Check

```http
GET /api/test
```

Retorna:

```json
{
  "success": true,
  "message": "✅ CHAMANA E-commerce API funcionando correctamente",
  "version": "2.0.0",
  "database": "chamana_db_fase2",
  "timestamp": "2025-10-23T15:30:00.000Z"
}
```

### Verificación de Versión de Base de Datos

La API se conecta automáticamente a la base de datos especificada por la variable de entorno `DB_VERSION`:

- `DB_VERSION=fase1` → `chamana_db_fase1` (1NF)
- `DB_VERSION=fase2` → `chamana_db_fase2` (2NF)

---

## Rate Limiting

**Actual**: Ninguno (fase universitaria)

**Producción**: Recomendado 100 peticiones/minuto por IP

---

## CORS

**Actual**: Deshabilitado (solo mismo origen)

**Producción**: Configurar orígenes permitidos

---

## Tipos de Datos

### Dinero

Todos los valores de dinero se retornan como strings con 2 decimales:

```json
"40000.00"
```

El frontend debe parsear como float: `parseFloat("40000.00")` → `40000.0`

### Fechas

Todas las fechas son strings ISO 8601 en UTC:

```json
"2025-10-23T15:30:00.000Z"
```

El frontend debe parsear con `new Date()` y formatear para locale:

```javascript
new Date('2025-10-23T15:30:00.000Z').toLocaleString('es-CL');
// "23-10-2025 12:30:00"
```

### IDs

Todos los IDs son enteros (PostgreSQL SERIAL):

```json
"id": 1
```

---

**Versión**: 2.0.0  
**Última Actualización**: 2025-10-23  
**Estado**: Fase 2 Completa (2NF + Gestión de Stock + Filtrado Estacional)
