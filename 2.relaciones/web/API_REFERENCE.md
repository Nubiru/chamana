# API Reference - Phase 2

## Base URL

```
http://localhost:3000/api
```

## Authentication

None (university phase - add auth in production)

## Endpoints

### Categorias

#### List Categories

```http
GET /categorias
```

Returns all categories.

**Response**:

```json
[
  {
    "id": 1,
    "nombre": "Buzo",
    "descripcion": "Buzos y sudaderas"
  }
]
```

#### Get Category by ID

```http
GET /categorias/:id
```

**Response**:

```json
{
  "id": 1,
  "nombre": "Buzo",
  "descripcion": "Buzos y sudaderas",
  "fecha_creacion": "2025-10-20T10:00:00.000Z"
}
```

#### Get Products in Category

```http
GET /categorias/:id/prendas
```

Returns all products in category.

**Response**:

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

#### List Products

```http
GET /productos?categoria_id=1&activa=true&tela_ids=1,2,3
```

**Query Parameters**:

- `categoria_id` (optional) - Filter by category
- `activa` (optional) - Filter by active status (default: true)
- `tela_ids` (optional) - Comma-separated tela IDs (for seasonal filtering)
- `limit` (optional) - Max results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response**:

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

#### Get Product by ID

```http
GET /productos/:id
```

**Response**:

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

#### Get Stock History ⭐ NEW

```http
GET /productos/:id/historial-stock?limit=50
```

Returns inventory movement history for a specific product.

**Query Parameters**:

- `limit` (optional) - Max results (default: no limit)

**Response**:

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

**Movement Types**:

- `venta` - Sale (decreases stock)
- `recepcion` - Reception (increases stock)
- `ajuste` - Adjustment (manual correction)

---

### Pedidos (Orders)

#### List Orders

```http
GET /pedidos?cliente_id=1&estado=pendiente
```

**Query Parameters**:

- `cliente_id` (optional) - Filter by client
- `estado` (optional) - Filter by status (pendiente/completado/cancelado)
- `limit` (optional) - Max results (default: 50)
- `offset` (optional) - Pagination offset

**Response**:

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

#### Get Order by ID

```http
GET /pedidos/:id
```

**Response**:

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

#### Create Order

```http
POST /pedidos
```

**Request Body**:

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

**Validation**:

- `cliente_id`: Required, must exist
- `items`: Required, non-empty array
- `items[].prenda_id`: Required, must exist
- `items[].cantidad`: Required, positive integer
- `items[].precio_unitario`: Required, positive number
- `descuento`: Optional, non-negative number
- `notas`: Optional, string

**Response**:

```json
{
  "pedido_id": 11,
  "cliente_nombre": "María García López",
  "total": "80000.00",
  "estado": "pendiente",
  "fecha_pedido": "2025-10-23T15:30:00.000Z"
}
```

#### Complete Order

```http
PUT /pedidos/:id/completar
```

Marks order as completed and updates stock. Creates inventory movement records.

**Response**:

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

**Business Rules**:

- Order must be in `pendiente` state
- All products must have sufficient stock
- Stock updates are atomic (all or nothing)
- Creates `movimientos_inventario` records
- Updates `fecha_ultima_venta` for each product

#### Cancel Order

```http
PUT /pedidos/:id/cancelar
```

**Response**:

```json
{
  "pedido_id": 8,
  "estado": "cancelado",
  "fecha_cancelacion": "2025-10-23T15:40:00.000Z"
}
```

---

### Telas (Seasonal Fabrics) ⭐ NEW

#### Filter Fabrics by Season/Year

```http
GET /telas/temporadas?temporada=Invierno&año=2025&activo=true
```

Demonstrates 2NF normalization with many-to-many relationship between `telas` and `temporadas`.

**Query Parameters**:

- `temporada` (optional) - Season name (Verano, Invierno)
- `año` (optional) - Year (2024, 2025, 2026)
- `activo` (optional) - Filter active only (default: all)

**Response**:

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

**Use Case**:

This endpoint enables seasonal product filtering on the frontend:

1. User selects "Invierno" + "2025"
2. Frontend calls `/api/telas/temporadas?temporada=Invierno&año=2025&activo=true`
3. Gets list of tela IDs: `[1, 2, 3]`
4. Frontend calls `/api/productos?tela_ids=1,2,3`
5. Displays only products made with winter 2025 fabrics

---

### Usuarios (Clientes)

#### List Users

```http
GET /usuarios
```

**Response**:

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

#### Get User by ID

```http
GET /usuarios/:id
```

**Response**:

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

#### Create User

```http
POST /usuarios
```

**Request Body**:

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

**Response**:

```json
{
  "id": 25,
  "nombre": "Ana",
  "apellido": "Silva",
  "email": "ana.silva@email.com",
  "fecha_registro": "2025-10-23T15:45:00.000Z"
}
```

#### Update User

```http
PUT /usuarios/:id
```

**Request Body** (partial updates supported):

```json
{
  "telefono": "+56999888777",
  "direccion": "Nueva Dirección 456"
}
```

**Response**:

```json
{
  "id": 1,
  "nombre": "María",
  "apellido": "García López",
  "telefono": "+56999888777",
  "direccion": "Nueva Dirección 456"
}
```

#### Delete User

```http
DELETE /usuarios/:id
```

**Response**:

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "details": {
    "originalError": {...},
    "query": "..."
  },
  "stack": "Error stack trace (only in development)"
}
```

### Status Codes

- `200` - Success
- `400` - Validation error (ValidationError)
- `404` - Not found (NotFoundError)
- `500` - Server error (DatabaseError, unexpected errors)

### Error Examples

**Validation Error** (400):

```json
{
  "success": false,
  "error": "cliente_id es requerido"
}
```

**Not Found Error** (404):

```json
{
  "success": false,
  "error": "Producto con id 999 no encontrado"
}
```

**Database Error** (500):

```json
{
  "success": false,
  "error": "Error de base de datos",
  "details": {
    "originalError": "relation \"productos\" does not exist"
  }
}
```

**Stock Insufficient Error** (400):

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

Returns:

```json
{
  "success": true,
  "message": "✅ CHAMANA E-commerce API funcionando correctamente",
  "version": "2.0.0",
  "database": "chamana_db_fase2",
  "timestamp": "2025-10-23T15:30:00.000Z"
}
```

### Database Version Check

The API automatically connects to the database specified by `DB_VERSION` environment variable:

- `DB_VERSION=fase1` → `chamana_db_fase1` (1NF)
- `DB_VERSION=fase2` → `chamana_db_fase2` (2NF)

---

## Rate Limiting

**Current**: None (university phase)

**Production**: Recommended 100 requests/minute per IP

---

## CORS

**Current**: Disabled (same-origin only)

**Production**: Configure allowed origins

---

## Data Types

### Money

All money values are returned as strings with 2 decimal places:

```json
"40000.00"
```

Frontend should parse as float: `parseFloat("40000.00")` → `40000.0`

### Dates

All dates are ISO 8601 strings in UTC:

```json
"2025-10-23T15:30:00.000Z"
```

Frontend should parse with `new Date()` and format for locale:

```javascript
new Date('2025-10-23T15:30:00.000Z').toLocaleString('es-CL');
// "23-10-2025 12:30:00"
```

### IDs

All IDs are integers (PostgreSQL SERIAL):

```json
"id": 1
```

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-23  
**Status**: Phase 2 Complete (2NF + Stock Management + Seasonal Filtering)
