# API Documentation

## Productos

### GET /api/products
Buscar productos con filtros

**Query Parameters**:
- `categoryId` - ID de categoría
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `q` - Búsqueda de texto

**Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

## Vistas

### GET /api/views/{view}
Obtener datos de vistas materializadas

**Vistas Disponibles**:
- `ventas-mensuales` - Ventas por mes
- `inventario-critico` - Stock bajo
- `top-productos` - Productos más vendidos
- `analisis-clientes` - Métricas de clientes
- `rotacion-inventario` - Rotación de stock

## Procedimientos

### POST /api/procedures/procesar-pedido
Procesar un nuevo pedido

**Body**:
```json
{
  "cliente_id": 1,
  "items": [
    {"prenda_id": 1, "cantidad": 2}
  ],
  "descuento": 0
}
```

### POST /api/procedures/reabastecer-inventario
Reabastecer inventario

**Body**:
```json
{
  "prenda_id": 1,
  "cantidad": 100,
  "motivo": "Reposición mensual"
}
```

### GET /api/procedures/calcular-comision?artesana_id=1
Calcular comisión de artesana

