# Migración de Base de Datos

## Scripts Disponibles

### Configuración Inicial

```bash
cd database/scripts
npm install
node 00_db.js
```

### Scripts de Migración

| Script | Descripción |
|--------|-------------|
| `00_db.js` | Esquema completo Fase 3 (3NF) |
| `11_add_indexes.js` | Índices de performance |
| `12_optimize_views.js` | Optimización de vistas |
| `13_materialized_views.js` | Vistas materializadas |
| `14_create_users_auth.js` | Tablas de autenticación |
| `15_additional_views.js` | Vistas adicionales |

## Estructura de la Base de Datos (3NF)

### Tablas Principales

- **artesanas** - Artesanas productoras
- **categorias** - Categorías de productos
- **productos** - Catálogo de prendas
- **clientes** - Clientes B2C/B2B
- **pedidos** - Órdenes de compra
- **detalle_pedidos** - Items de pedidos
- **pagos** - Transacciones
- **comisiones** - Comisiones de artesanas

### Vistas Materializadas

- `vista_ventas_mensuales`
- `vista_inventario_critico`
- `vista_top_productos`
- `vista_analisis_clientes`
- `vista_rotacion_inventario`

### Procedimientos Almacenados

- `procesar_pedido()` - Procesar orden completa
- `reabastecer_inventario()` - Actualizar stock
- `calcular_comision()` - Calcular comisión

## Variables de Entorno

```bash
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=chamana_db_fase3
DB_PASSWORD=tu_password
DB_PORT=5432
```
