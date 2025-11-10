# 📊 Vistas y Procedimientos Almacenados

**Catálogo Completo de Vistas, Procedimientos y Triggers**

---

## 📑 Tabla de Contenidos

- [Resumen](#-resumen)
- [Vistas de Business Intelligence](#-vistas-de-business-intelligence-5-vistas)
- [Procedimientos Almacenados](#-procedimientos-almacenados-3-procedures)
- [Triggers Automáticos](#-triggers-automáticos-3-triggers)
- [Ejemplos de Uso desde API](#-ejemplos-de-uso-desde-api)

---

## 📋 Resumen

### Estadísticas

| Tipo                      | Fase 3 | Fase 4 (Optimización) | Total  |
| ------------------------- | ------ | --------------------- | ------ |
| **Vistas Normales**       | 5      | 5                     | 5      |
| **Vistas Optimizadas**    | 0      | 5                     | 5      |
| **Vistas Materializadas** | 0      | 4                     | 4      |
| **Procedimientos**        | 3      | 3                     | 3      |
| **Triggers**              | 3      | 3                     | 3      |
| **Total Objetos**         | 11     | 20                    | **20** |

---

## 📊 Vistas de Business Intelligence (5 vistas)

### 1. `vista_ventas_mensuales`

**Propósito**: Análisis de ventas agrupadas por mes

**Tablas involucradas**: `pedidos`, `estados_pedido`

**Columnas**:

- `mes` (TIMESTAMP): Mes agrupado (primer día del mes)
- `total_ventas` (DECIMAL): Suma de ventas del mes
- `cantidad_pedidos` (INTEGER): Cantidad de pedidos
- `ticket_promedio` (DECIMAL): Promedio de venta por pedido

**SQL**:

```sql
SELECT
  DATE_TRUNC('month', fecha_pedido) as mes,
  SUM(total) as total_ventas,
  COUNT(*) as cantidad_pedidos,
  AVG(total) as ticket_promedio
FROM pedidos
WHERE estado_id IN (
  SELECT id FROM estados_pedido
  WHERE nombre IN ('entregado', 'completado')
)
GROUP BY DATE_TRUNC('month', fecha_pedido)
ORDER BY mes DESC;
```

**Uso**:

- Dashboard principal
- Reportes ejecutivos mensuales
- Análisis de tendencias de venta

**Performance**:

- Fase 3: 200-500ms
- Fase 4 (optimizada): 50-150ms
- Fase 4 (materializada): 0-50ms

---

### 2. `vista_inventario_critico`

**Propósito**: Alertas de productos con stock bajo

**Tablas involucradas**: `prendas`, `categorias`, `telas`, `patrones`

**Columnas**:

- `id` (INTEGER): ID de la prenda
- `nombre` (VARCHAR): Nombre del producto
- `categoria` (VARCHAR): Categoría del producto
- `tela` (VARCHAR): Tipo de tela
- `patron` (VARCHAR): Patrón/diseño
- `stock_disponible` (INTEGER): Unidades disponibles
- `estado_stock` (VARCHAR): 'AGOTADO', 'CRÍTICO', 'BAJO', 'NORMAL'

**SQL**:

```sql
SELECT
  p.id,
  p.nombre,
  c.nombre as categoria,
  t.nombre as tela,
  pa.nombre as patron,
  (p.stock_inicial - p.stock_vendido) as stock_disponible,
  CASE
    WHEN (p.stock_inicial - p.stock_vendido) = 0 THEN 'AGOTADO'
    WHEN (p.stock_inicial - p.stock_vendido) <= 5 THEN 'CRÍTICO'
    WHEN (p.stock_inicial - p.stock_vendido) <= 10 THEN 'BAJO'
    ELSE 'NORMAL'
  END as estado_stock
FROM prendas p
JOIN categorias c ON p.categoria_id = c.id
JOIN telas t ON p.tela_id = t.id
JOIN patrones pa ON p.patron_id = pa.id
WHERE p.activa = TRUE
  AND (p.stock_inicial - p.stock_vendido) <= 10
ORDER BY stock_disponible ASC;
```

**Uso**:

- Alertas de reabastecimiento
- Dashboard de inventario
- Planificación de compras

**Performance**:

- Fase 3: 150-400ms
- Fase 4 (optimizada): 50-100ms
- Fase 4 (materializada): 0-20ms

---

### 3. `vista_top_productos`

**Propósito**: Productos más vendidos por ingresos

**Tablas involucradas**: `prendas`, `pedidos_prendas`, `categorias`

**Columnas**:

- `id` (INTEGER): ID de la prenda
- `nombre` (VARCHAR): Nombre del producto
- `categoria` (VARCHAR): Categoría
- `unidades_vendidas` (INTEGER): Total de unidades vendidas
- `ingresos_totales` (DECIMAL): Ingresos generados
- `precio_promedio` (DECIMAL): Precio promedio de venta

**SQL**:

```sql
SELECT
  p.id,
  p.nombre,
  c.nombre as categoria,
  SUM(pp.cantidad) as unidades_vendidas,
  SUM(pp.subtotal) as ingresos_totales,
  AVG(pp.precio_unitario) as precio_promedio
FROM prendas p
JOIN pedidos_prendas pp ON p.id = pp.prenda_id
JOIN categorias c ON p.categoria_id = c.id
GROUP BY p.id, p.nombre, c.nombre
HAVING SUM(pp.cantidad) > 0
ORDER BY ingresos_totales DESC
LIMIT 20;
```

**Uso**:

- Análisis de productos
- Decisiones de inventario
- Marketing y promociones

**Performance**:

- Fase 3: 150-400ms
- Fase 4 (optimizada): 30-80ms
- Fase 4 (materializada): 0-30ms

---

### 4. `vista_analisis_clientes`

**Propósito**: Segmentación de clientes por valor de vida

**Tablas involucradas**: `clientes`, `pedidos`, `pedidos_prendas`

**Columnas**:

- `id` (INTEGER): ID del cliente
- `nombre` (VARCHAR): Nombre completo
- `email` (VARCHAR): Email del cliente
- `total_pedidos` (INTEGER): Cantidad de pedidos realizados
- `valor_total` (DECIMAL): Valor total de compras
- `ticket_promedio` (DECIMAL): Promedio de compra
- `ultima_compra` (TIMESTAMP): Fecha de última compra
- `segmento` (VARCHAR): 'VIP', 'Premium', 'Regular', 'Nuevo'

**SQL**:

```sql
SELECT
  c.id,
  c.nombre || ' ' || c.apellido as nombre,
  c.email,
  COUNT(DISTINCT p.id) as total_pedidos,
  COALESCE(SUM(p.total), 0) as valor_total,
  COALESCE(AVG(p.total), 0) as ticket_promedio,
  MAX(p.fecha_pedido) as ultima_compra,
  CASE
    WHEN COALESCE(SUM(p.total), 0) > 1000 THEN 'VIP'
    WHEN COALESCE(SUM(p.total), 0) > 500 THEN 'Premium'
    WHEN COALESCE(SUM(p.total), 0) > 100 THEN 'Regular'
    ELSE 'Nuevo'
  END as segmento
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
WHERE c.activo = TRUE
GROUP BY c.id, c.nombre, c.apellido, c.email
ORDER BY valor_total DESC;
```

**Uso**:

- Marketing y segmentación
- Programas de fidelidad
- Análisis de retención

**Performance**:

- Fase 3: 300-800ms
- Fase 4 (optimizada): 100-200ms
- Fase 4 (materializada): 0-40ms

---

### 5. `vista_rotacion_inventario`

**Propósito**: Análisis de rotación de stock por producto

**Tablas involucradas**: `prendas`, `categorias`

**Columnas**:

- `id` (INTEGER): ID de la prenda
- `nombre` (VARCHAR): Nombre del producto
- `categoria` (VARCHAR): Categoría
- `stock_inicial` (INTEGER): Stock inicial
- `stock_vendido` (INTEGER): Unidades vendidas
- `stock_disponible` (INTEGER): Stock actual
- `porcentaje_rotacion` (DECIMAL): Porcentaje vendido
- `clasificacion_rotacion` (VARCHAR): 'Alta', 'Media', 'Baja', 'Muy Baja'

**SQL**:

```sql
SELECT
  p.id,
  p.nombre,
  c.nombre as categoria,
  p.stock_inicial,
  p.stock_vendido,
  (p.stock_inicial - p.stock_vendido) as stock_disponible,
  ROUND(
    (p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0)) * 100,
    2
  ) as porcentaje_rotacion,
  CASE
    WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) > 0.75 THEN 'Alta Rotación'
    WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) > 0.50 THEN 'Media Rotación'
    WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) > 0.25 THEN 'Baja Rotación'
    ELSE 'Muy Baja Rotación'
  END as clasificacion_rotacion
FROM prendas p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activa = TRUE AND p.stock_inicial > 0
ORDER BY porcentaje_rotacion DESC;
```

**Uso**:

- Gestión de inventario
- Análisis de rotación
- Decisiones de reabastecimiento

**Performance**:

- Fase 3: 200-500ms
- Fase 4 (optimizada): 50-150ms

---

## 🔧 Procedimientos Almacenados (3 procedures)

### 1. `procesar_pedido()`

**Propósito**: Procesa un pedido completo con validaciones y actualización de stock

**Firma**:

```sql
procesar_pedido(
  p_cliente_id INTEGER,
  p_items JSONB,
  p_descuento DECIMAL DEFAULT 0
) RETURNS INTEGER
```

**Parámetros**:

- `p_cliente_id` (INTEGER): ID del cliente que realiza el pedido
- `p_items` (JSONB): Array de items `[{"prenda_id": 1, "cantidad": 2}, ...]`
- `p_descuento` (DECIMAL, opcional): Descuento a aplicar (default: 0)

**Retorna**: INTEGER (ID del pedido creado)

**Lógica de negocio**:

1. ✅ Valida que el cliente esté activo
2. ✅ Verifica stock disponible para cada item
3. ✅ Crea el pedido con estado "pendiente"
4. ✅ Inserta los items del pedido (tabla `pedidos_prendas`)
5. ✅ Actualiza el `stock_vendido` de cada prenda
6. ✅ Registra movimientos de inventario (tipo "salida")
7. ✅ Calcula subtotal y total automáticamente

**Ejemplo de uso**:

```sql
-- Crear pedido con 2 items
SELECT procesar_pedido(
  1,  -- cliente_id
  '[
    {"prenda_id": 5, "cantidad": 2},
    {"prenda_id": 8, "cantidad": 1}
  ]'::JSONB,
  10.00  -- 10.00 de descuento
);

-- Retorna: 42 (ID del nuevo pedido)
```

**Ejemplo desde API**:

```typescript
// POST /api/procedures/procesar-pedido
const response = await fetch('/api/procedures/procesar-pedido', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cliente_id: 1,
    items: [
      { prenda_id: 5, cantidad: 2 },
      { prenda_id: 8, cantidad: 1 }
    ],
    descuento: 10.0
  })
});

const { pedido_id } = await response.json();
console.log(`Pedido creado: ${pedido_id}`);
```

**Excepciones**:

- `CLIENTE_NO_ACTIVO`: Si el cliente no está activo
- `STOCK_INSUFICIENTE`: Si no hay suficiente stock para algún item
- `PRENDA_NO_ENCONTRADA`: Si alguna prenda no existe

---

### 2. `reabastecer_inventario()`

**Propósito**: Reabastece el inventario de una prenda con auditoría completa

**Firma**:

```sql
reabastecer_inventario(
  p_prenda_id INTEGER,
  p_cantidad INTEGER,
  p_motivo TEXT
) RETURNS BOOLEAN
```

**Parámetros**:

- `p_prenda_id` (INTEGER): ID de la prenda a reabastecer
- `p_cantidad` (INTEGER): Cantidad a agregar al stock
- `p_motivo` (TEXT): Razón del reabastecimiento

**Retorna**: BOOLEAN (true si exitoso, false si fallo)

**Lógica de negocio**:

1. ✅ Valida que la prenda exista y esté activa
2. ✅ Actualiza `stock_inicial` sumando la cantidad
3. ✅ Recalcula `stock_disponible` automáticamente
4. ✅ Registra movimiento de inventario (tipo "entrada")
5. ✅ Genera alerta si el stock sigue bajo después del reabastecimiento

**Ejemplo de uso**:

```sql
-- Reabastecer 20 unidades de la prenda 5
SELECT reabastecer_inventario(
  5,                          -- prenda_id
  20,                         -- cantidad
  'Reposición semanal'        -- motivo
);

-- Retorna: true
```

**Ejemplo desde API**:

```typescript
// POST /api/procedures/reabastecer-inventario
const response = await fetch('/api/procedures/reabastecer-inventario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prenda_id: 5,
    cantidad: 20,
    motivo: 'Reposición semanal'
  })
});

const { success, stock_nuevo } = await response.json();
console.log(`Stock actualizado a: ${stock_nuevo} unidades`);
```

**Excepciones**:

- `PRENDA_NO_ENCONTRADA`: Si la prenda no existe
- `PRENDA_INACTIVA`: Si la prenda no está activa
- `CANTIDAD_INVALIDA`: Si la cantidad es <= 0

---

### 3. `calcular_comision()`

**Propósito**: Calcula comisiones de vendedores/artesanos en un período

**Firma**:

```sql
calcular_comision(
  p_fecha_inicio DATE,
  p_fecha_fin DATE,
  p_porcentaje DECIMAL
) RETURNS TABLE(
  artesano_id INTEGER,
  artesano_nombre VARCHAR,
  total_ventas DECIMAL,
  comision DECIMAL
)
```

**Parámetros**:

- `p_fecha_inicio` (DATE): Fecha inicial del período
- `p_fecha_fin` (DATE): Fecha final del período
- `p_porcentaje` (DECIMAL): Porcentaje de comisión (ej: 5.0 para 5%)

**Retorna**: TABLE con comisiones calculadas

**Lógica de negocio**:

1. ✅ Filtra pedidos completados en el rango de fechas
2. ✅ Agrupa ventas por artesano (a través de prendas)
3. ✅ Calcula total de ventas por artesano
4. ✅ Calcula comisión aplicando el porcentaje
5. ✅ Ordena por comisión descendente

**Ejemplo de uso**:

```sql
-- Calcular comisiones de enero 2024 con 5% de comisión
SELECT * FROM calcular_comision(
  '2024-01-01'::DATE,
  '2024-01-31'::DATE,
  5.0  -- 5% de comisión
);

-- Resultado:
-- artesano_id | artesano_nombre | total_ventas | comision
-- ------------|-----------------|--------------|----------
-- 3           | María Quispe    | 2500.00      | 125.00
-- 1           | Juan Huamán     | 1800.00      | 90.00
-- 5           | Rosa Ccari      | 1200.00      | 60.00
```

**Ejemplo desde API**:

```typescript
// POST /api/procedures/calcular-comision
const response = await fetch('/api/procedures/calcular-comision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fecha_inicio: '2024-01-01',
    fecha_fin: '2024-01-31',
    porcentaje: 5.0
  })
});

const comisiones = await response.json();
console.table(comisiones);
```

---

## ⚡ Triggers Automáticos (3 triggers)

### 1. `trigger_actualizar_stock_pedido`

**Tabla**: `pedidos_prendas`
**Evento**: `AFTER INSERT`
**Función**: `actualizar_stock_prenda()`

**Propósito**: Actualiza automáticamente el stock cuando se agrega un item a un pedido

**Lógica**:

```sql
CREATE OR REPLACE FUNCTION actualizar_stock_prenda()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar stock_vendido de la prenda
  UPDATE prendas
  SET stock_vendido = stock_vendido + NEW.cantidad,
      fecha_ultima_venta = CURRENT_TIMESTAMP
  WHERE id = NEW.prenda_id;

  -- Registrar movimiento de inventario
  INSERT INTO movimientos_inventario (
    prenda_id, tipo, cantidad, stock_anterior, stock_nuevo, pedido_id, fecha
  )
  SELECT
    NEW.prenda_id,
    'salida',
    NEW.cantidad,
    stock_inicial - stock_vendido,
    stock_inicial - stock_vendido - NEW.cantidad,
    (SELECT pedido_id FROM pedidos_prendas WHERE id = NEW.id),
    CURRENT_TIMESTAMP
  FROM prendas WHERE id = NEW.prenda_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Se ejecuta**: Cada vez que se inserta un item en `pedidos_prendas`

**Uso**: Automático - No requiere invocación manual

---

### 2. `trigger_registrar_historial_estado`

**Tabla**: `pedidos`
**Evento**: `AFTER UPDATE OF estado_id`
**Función**: `registrar_historial_estado()`

**Propósito**: Registra automáticamente cambios de estado en el historial

**Lógica**:

```sql
CREATE OR REPLACE FUNCTION registrar_historial_estado()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si el estado cambió
  IF OLD.estado_id IS DISTINCT FROM NEW.estado_id THEN
    INSERT INTO historial_estados_pedido (
      pedido_id,
      estado_anterior_id,
      estado_nuevo_id,
      fecha_cambio
    ) VALUES (
      NEW.id,
      OLD.estado_id,
      NEW.estado_id,
      CURRENT_TIMESTAMP
    );

    -- Generar NOTICE para logging
    RAISE NOTICE 'Estado de pedido % cambió de % a %',
      NEW.id, OLD.estado_id, NEW.estado_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Se ejecuta**: Cuando se actualiza el `estado_id` de un pedido

**Uso**: Automático - Proporciona auditoría completa de cambios de estado

---

### 3. `trigger_alertar_stock_critico`

**Tabla**: `prendas`
**Evento**: `AFTER UPDATE`
**Función**: `alertar_stock_critico()`

**Propósito**: Genera alertas cuando el stock es crítico o se agota

**Lógica**:

```sql
CREATE OR REPLACE FUNCTION alertar_stock_critico()
RETURNS TRIGGER AS $$
DECLARE
  v_stock_disponible INTEGER;
BEGIN
  v_stock_disponible := NEW.stock_inicial - NEW.stock_vendido;

  -- Alerta de stock agotado
  IF v_stock_disponible = 0 AND (OLD.stock_inicial - OLD.stock_vendido) > 0 THEN
    RAISE WARNING 'STOCK AGOTADO: Prenda % (%) - Stock: 0 unidades',
      NEW.id, NEW.nombre;

  -- Alerta de stock crítico (1-5 unidades)
  ELSIF v_stock_disponible > 0 AND v_stock_disponible <= 5
    AND (OLD.stock_inicial - OLD.stock_vendido) > 5 THEN
    RAISE NOTICE 'STOCK CRÍTICO: Prenda % (%) - Stock: % unidades',
      NEW.id, NEW.nombre, v_stock_disponible;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Se ejecuta**: Cuando se actualiza el stock de una prenda

**Uso**: Automático - Facilita alertas en tiempo real

---

## 🔌 Ejemplos de Uso desde API

### Consultar Vistas

#### GET /api/views/[view]

```typescript
// Ventas mensuales
const ventas = await fetch('/api/views/vista_ventas_mensuales');
const data = await ventas.json();

// Top productos
const top = await fetch('/api/views/vista_top_productos');
const productos = await top.json();

// Inventario crítico
const inventario = await fetch('/api/views/vista_inventario_critico');
const criticos = await inventario.json();

// Análisis de clientes
const clientes = await fetch('/api/views/vista_analisis_clientes');
const analisis = await clientes.json();

// Rotación de inventario
const rotacion = await fetch('/api/views/vista_rotacion_inventario');
const rotaciones = await rotacion.json();
```

### Ejecutar Procedimientos

#### POST /api/procedures/[procedure]

```typescript
// Procesar pedido
const pedido = await fetch('/api/procedures/procesar-pedido', {
  method: 'POST',
  body: JSON.stringify({
    cliente_id: 1,
    items: [{ prenda_id: 5, cantidad: 2 }],
    descuento: 0
  })
});

// Reabastecer inventario
const reabastecimiento = await fetch('/api/procedures/reabastecer-inventario', {
  method: 'POST',
  body: JSON.stringify({
    prenda_id: 5,
    cantidad: 20,
    motivo: 'Reposición mensual'
  })
});

// Calcular comisiones
const comisiones = await fetch('/api/procedures/calcular-comision', {
  method: 'POST',
  body: JSON.stringify({
    fecha_inicio: '2024-01-01',
    fecha_fin: '2024-01-31',
    porcentaje: 5.0
  })
});
```

---

## 📊 Resumen de Performance

| Vista/Procedimiento       | Complejidad | Fase 3    | Fase 4 (Optimizada) | Fase 4 (Materializada) |
| ------------------------- | ----------- | --------- | ------------------- | ---------------------- |
| vista_ventas_mensuales    | Media       | 200-500ms | 50-150ms            | 0-50ms                 |
| vista_inventario_critico  | Media-Alta  | 150-400ms | 50-100ms            | 0-20ms                 |
| vista_top_productos       | Media       | 150-400ms | 30-80ms             | 0-30ms                 |
| vista_analisis_clientes   | Alta        | 300-800ms | 100-200ms           | 0-40ms                 |
| vista_rotacion_inventario | Media       | 200-500ms | 50-150ms            | N/A                    |
| procesar_pedido()         | Alta        | 150-300ms | 100-200ms           | N/A                    |
| reabastecer_inventario()  | Baja        | 50-100ms  | 30-70ms             | N/A                    |
| calcular_comision()       | Media       | 100-250ms | 50-120ms            | N/A                    |

---

## 📝 Referencias

- [Fase 3: Base de Datos 3NF](./2.4.Fase-3-Tercera-Forma-Normal) - Estructura completa
- [Fase 4: Optimización](./2.5.Fase-4-Optimizacion) - Optimizaciones y performance
- [Comparación de Performance](./Performance-Comparison) - Análisis detallado Fase 3 vs Fase 4
- [Documentación de API](./API-Documentation) - Endpoints REST

---

**Última Actualización**: Noviembre 2025
**Autor**: Gabriel Osemberg
**Base de Datos**: chamana_db_fase3

---

> 📊 "Las vistas y procedimientos almacenados son el puente entre la base de datos y la lógica de negocio"
