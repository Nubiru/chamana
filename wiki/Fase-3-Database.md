# 📊 Fase 3: Base de Datos Normalizada (3NF)

**Base de Datos Completa en Tercera Forma Normal con Business Intelligence**

---

## 📑 Tabla de Contenidos

- [Resumen Ejecutivo](#-resumen-ejecutivo)
- [Normalización a 3NF](#-normalización-a-3nf)
- [Estructura de Tablas](#-estructura-de-tablas)
- [Relaciones y Claves Foráneas](#-relaciones-y-claves-foráneas)
- [Vistas de Business Intelligence](#-vistas-de-business-intelligence)
- [Procedimientos Almacenados](#-procedimientos-almacenados)
- [Triggers Automáticos](#-triggers-automáticos)
- [Diagrama ERD](#-diagrama-erd)
- [Reglas de Integridad](#-reglas-de-integridad)

---

## 📋 Resumen Ejecutivo

### Estadísticas de la Base de Datos

| Métrica | Cantidad | Descripción |
|---------|----------|-------------|
| **Tablas** | 19 | Todas normalizadas a 3NF |
| **Relaciones FK** | 24 | Integridad referencial completa |
| **Vistas BI** | 5 | Análisis y reportes |
| **Procedimientos** | 3 | Lógica de negocio encapsulada |
| **Triggers** | 3 | Automatización y validaciones |
| **Índices** | 68+ | Optimización de queries |
| **Filas de Datos** | ~1,200 | Datos reales de ejemplo |

### Características Principales

- ✅ **3NF Completa**: Sin dependencias transitivas
- ✅ **0% Redundancia**: Datos normalizados
- ✅ **Integridad Referencial**: Todas las FK con ON DELETE/UPDATE
- ✅ **Business Intelligence**: 5 vistas optimizadas
- ✅ **Automatización**: Triggers para auditoría y validaciones
- ✅ **Escalable**: Diseño preparado para crecimiento

---

## 🎯 Normalización a 3NF

### Principios Aplicados

#### 1. Primera Forma Normal (1NF)
- ✅ Todas las tablas tienen clave primaria única
- ✅ Todos los valores son atómicos (no hay listas ni arrays)
- ✅ No hay grupos repetitivos

#### 2. Segunda Forma Normal (2NF)
- ✅ Cumple 1NF
- ✅ No hay dependencias parciales
- ✅ Todos los atributos dependen de la clave primaria completa

#### 3. Tercera Forma Normal (3NF)
- ✅ Cumple 2NF
- ✅ **No hay dependencias transitivas**
- ✅ Todos los atributos no clave dependen directamente de la clave primaria

### Transformaciones Aplicadas

#### Eliminación de Dependencias Transitivas

**Antes (Fase 2 - 2NF)**:
```sql
clientes {
  id,
  nombre,
  direccion,      -- ❌ Dependencia transitiva
  ciudad,         -- ❌ Dependencia transitiva
  codigo_postal   -- ❌ Dependencia transitiva
}

pedidos {
  id,
  estado          -- ❌ Valor repetido (texto libre)
}

prendas {
  id,
  tipo            -- ❌ Valor repetido (texto libre)
}
```

**Después (Fase 3 - 3NF)**:
```sql
clientes {
  id,
  nombre,
  email
  -- ✅ Direcciones normalizadas en tabla separada
}

direcciones {
  id,
  cliente_id,     -- ✅ FK a clientes
  tipo,
  direccion,
  ciudad,
  codigo_postal
  -- ✅ Múltiples direcciones por cliente
}

pedidos {
  id,
  estado_id       -- ✅ FK a estados_pedido (normalizado)
}

estados_pedido {
  id,
  codigo,
  nombre,
  descripcion,
  orden_workflow
  -- ✅ Estados centralizados con workflow
}

prendas {
  id,
  tipo_prenda_id  -- ✅ FK a tipos_prenda (normalizado)
}

tipos_prenda {
  id,
  nombre,
  descripcion,
  cuidados
  -- ✅ Información detallada centralizada
}
```

---

## 🗂️ Estructura de Tablas

### 📊 19 Tablas Normalizadas

#### Tablas Core (Existentes desde Fase 2)

1. **clientes** - Información básica de clientes
2. **pedidos** - Órdenes de compra
3. **pedidos_prendas** - Líneas de pedido (junction table)
4. **prendas** - Catálogo de productos
5. **categorias** - Clasificación de prendas
6. **telas** - Tipos de tela disponibles
7. **patrones** - Diseños de prendas
8. **artesanos** - Artesanos que confeccionan
9. **años** - Tabla de referencia de años
10. **temporadas** - Temporadas del año
11. **colecciones** - Colecciones estacionales
12. **movimientos_inventario** - Auditoría de inventario

#### Tablas Nuevas (Fase 3 - 3NF)

13. **direcciones** ⭐ - Direcciones de clientes (normalizado)
14. **estados_pedido** ⭐ - Estados del workflow de pedidos
15. **metodos_pago** ⭐ - Métodos de pago disponibles
16. **historial_estados_pedido** ⭐ - Auditoría de cambios de estado
17. **tipos_prenda** ⭐ - Tipos de prenda con info de cuidado
18. **proveedores** ⭐ - Proveedores de materiales
19. **telas_proveedores** ⭐ - Relación M:N telas-proveedores

### Descripción Detallada por Tabla

#### 1. `clientes`
**Propósito**: Información básica de clientes

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del cliente |
| apellido | VARCHAR(100) | NOT NULL | Apellido del cliente |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Email único |
| telefono | VARCHAR(20) | | Teléfono de contacto |
| fecha_registro | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| activo | BOOLEAN | DEFAULT TRUE | Estado activo/inactivo |

**Cambios desde Fase 2**: ➖ Removidas columnas de dirección (movidas a tabla `direcciones`)

---

#### 2. `direcciones` ⭐ NUEVA (3NF)
**Propósito**: Múltiples direcciones por cliente (normalización 3NF)

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| cliente_id | INTEGER | FK, NOT NULL | Referencia a clientes |
| tipo | VARCHAR(20) | NOT NULL | 'envio', 'facturacion', 'otro' |
| calle | VARCHAR(200) | NOT NULL | Dirección completa |
| ciudad | VARCHAR(100) | NOT NULL | Ciudad |
| estado | VARCHAR(100) | | Estado/Provincia |
| codigo_postal | VARCHAR(10) | | Código postal |
| pais | VARCHAR(50) | DEFAULT 'Perú' | País |
| predeterminada | BOOLEAN | DEFAULT FALSE | Dirección predeterminada |

**Justificación 3NF**: Elimina dependencia transitiva. Las direcciones dependen solo de `cliente_id`, permitiendo múltiples direcciones por cliente.

---

#### 3. `pedidos`
**Propósito**: Órdenes de compra de clientes

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| cliente_id | INTEGER | FK, NOT NULL | Referencia a clientes |
| estado_id | INTEGER | FK, NOT NULL | Referencia a estados_pedido |
| metodo_pago_id | INTEGER | FK | Referencia a metodos_pago |
| direccion_envio_id | INTEGER | FK | Referencia a direcciones |
| subtotal | DECIMAL(10,2) | NOT NULL, >= 0 | Subtotal antes de descuentos |
| descuento | DECIMAL(10,2) | DEFAULT 0, >= 0 | Descuento aplicado |
| total | DECIMAL(10,2) | NOT NULL, >= 0 | Total final |
| fecha_pedido | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| fecha_completado | TIMESTAMP | | Fecha de completado |

**Cambios desde Fase 2**: ➕ Agregados `estado_id`, `metodo_pago_id`, `direccion_envio_id` (normalizados)

---

#### 4. `estados_pedido` ⭐ NUEVA (3NF)
**Propósito**: Estados del workflow de pedidos (normalizado)

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre del estado |
| descripcion | TEXT | | Descripción del estado |
| orden_workflow | INTEGER | NOT NULL | Orden en el flujo (1, 2, 3...) |

**Estados Implementados**:
- `pendiente` (orden: 1)
- `confirmado` (orden: 2)
- `en_proceso` (orden: 3)
- `enviado` (orden: 4)
- `entregado` (orden: 5)
- `cancelado` (orden: 99)
- `devuelto` (orden: 100)

**Justificación 3NF**: Centraliza gestión de estados, elimina redundancia de texto repetido.

---

#### 5. `metodos_pago` ⭐ NUEVA (3NF)
**Propósito**: Métodos de pago disponibles

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| codigo | VARCHAR(20) | UNIQUE, NOT NULL | Código único ('efectivo', 'tarjeta') |
| nombre | VARCHAR(50) | NOT NULL | Nombre del método |
| tipo | VARCHAR(20) | NOT NULL | 'efectivo', 'tarjeta', 'transferencia' |
| comision | DECIMAL(5,2) | DEFAULT 0 | Comisión porcentual |
| orden | INTEGER | NOT NULL | Orden de visualización |

**Métodos Implementados**:
- Efectivo (comisión: 0%)
- Tarjeta de Crédito (comisión: 3.5%)
- Tarjeta de Débito (comisión: 2.0%)
- Transferencia Bancaria (comisión: 0%)
- Yape/Plin (comisión: 0%)

**Justificación 3NF**: Normaliza información de métodos de pago con sus comisiones.

---

#### 6. `historial_estados_pedido` ⭐ NUEVA (3NF)
**Propósito**: Auditoría completa de cambios de estado

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| pedido_id | INTEGER | FK, NOT NULL | Referencia a pedidos |
| estado_anterior_id | INTEGER | FK | Estado anterior (NULL si es nuevo) |
| estado_nuevo_id | INTEGER | FK, NOT NULL | Nuevo estado |
| fecha_cambio | TIMESTAMP | DEFAULT NOW() | Timestamp del cambio |
| usuario_id | INTEGER | | Usuario que realizó el cambio |

**Justificación 3NF**: Proporciona trazabilidad completa de todos los cambios de estado.

---

#### 7. `pedidos_prendas`
**Propósito**: Líneas de pedido (junction table)

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| pedido_id | INTEGER | FK, NOT NULL | Referencia a pedidos |
| prenda_id | INTEGER | FK, NOT NULL | Referencia a prendas |
| cantidad | INTEGER | NOT NULL, > 0 | Cantidad de prendas |
| precio_unitario | DECIMAL(10,2) | NOT NULL, >= 0 | Precio al momento del pedido |
| subtotal | DECIMAL(10,2) | NOT NULL, >= 0 | cantidad × precio_unitario |

---

#### 8. `prendas`
**Propósito**: Catálogo de productos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(200) | NOT NULL | Nombre completo |
| tipo_prenda_id | INTEGER | FK, NOT NULL | Referencia a tipos_prenda |
| categoria_id | INTEGER | FK, NOT NULL | Referencia a categorias |
| tela_id | INTEGER | FK, NOT NULL | Referencia a telas |
| patron_id | INTEGER | FK, NOT NULL | Referencia a patrones |
| artesano_id | INTEGER | FK, NOT NULL | Referencia a artesanos |
| coleccion_id | INTEGER | FK | Referencia a colecciones |
| precio_chamana | DECIMAL(10,2) | NOT NULL, >= 0 | Precio de venta |
| stock_inicial | INTEGER | DEFAULT 0, >= 0 | Stock inicial |
| stock_vendido | INTEGER | DEFAULT 0, >= 0 | Cantidad vendida |
| activa | BOOLEAN | DEFAULT TRUE | Producto activo |
| fecha_ultima_venta | TIMESTAMP | | Última venta registrada |

**Cambios desde Fase 2**: ➕ Agregado `tipo_prenda_id` (normalizado)

---

#### 9. `tipos_prenda` ⭐ NUEVA (3NF)
**Propósito**: Tipos de prenda con información de cuidado

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre del tipo ('Blusa', 'Vestido') |
| descripcion | TEXT | | Descripción del tipo |
| cuidados | TEXT | | Instrucciones de cuidado |

**Tipos Implementados**:
- Blusa
- Vestido
- Pantalón
- Falda
- Chaleco

**Justificación 3NF**: Extrae información detallada de tipos, eliminando dependencias transitivas.

---

#### 10. `categorias`
**Propósito**: Clasificación general de prendas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | UNIQUE, NOT NULL | Nombre de la categoría |
| descripcion | TEXT | | Descripción |

---

#### 11. `telas`
**Propósito**: Tipos de tela disponibles

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre de la tela |
| descripcion | TEXT | | Descripción |
| unidad | VARCHAR(20) | | Unidad de medida ('metro', 'kg') |

---

#### 12. `proveedores` ⭐ NUEVA (3NF)
**Propósito**: Proveedores de telas y materiales

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del proveedor |
| contacto | VARCHAR(100) | | Persona de contacto |
| telefono | VARCHAR(20) | | Teléfono |

**Justificación 3NF**: Separa información de proveedores de las telas.

---

#### 13. `telas_proveedores` ⭐ NUEVA (3NF)
**Propósito**: Relación M:N entre telas y proveedores con precios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| tela_id | INTEGER | FK, NOT NULL | Referencia a telas |
| proveedor_id | INTEGER | FK, NOT NULL | Referencia a proveedores |
| precio_proveedor | DECIMAL(10,2) | NOT NULL, >= 0 | Precio por unidad |

**Justificación 3NF**: Una tela puede tener múltiples proveedores con precios diferentes.

---

#### 14. `patrones`
**Propósito**: Diseños de prendas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | UNIQUE, NOT NULL | Nombre del patrón |
| descripcion | TEXT | | Descripción |
| origen | VARCHAR(100) | | Origen del diseño |

---

#### 15. `artesanos`
**Propósito**: Artesanos que confeccionan las prendas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre del artesano |
| especialidad | VARCHAR(100) | | Especialidad |
| comunidad | VARCHAR(100) | | Comunidad de origen |

---

#### 16. `años`
**Propósito**: Tabla de referencia de años

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| año | INTEGER | UNIQUE, NOT NULL | Año (2022, 2023, 2024...) |
| temporada | VARCHAR(50) | | Temporada principal |

---

#### 17. `temporadas`
**Propósito**: Temporadas del año

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | 'Verano', 'Invierno' |

---

#### 18. `colecciones`
**Propósito**: Colecciones estacionales de prendas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| nombre | VARCHAR(200) | NOT NULL | Nombre de la colección |
| año_id | INTEGER | FK, NOT NULL | Referencia a años |
| temporada_id | INTEGER | FK, NOT NULL | Referencia a temporadas |
| fecha_inicio | DATE | | Inicio de la colección |
| fecha_fin | DATE | | Fin de la colección |
| activa | BOOLEAN | DEFAULT TRUE | Colección activa |

---

#### 19. `movimientos_inventario`
**Propósito**: Auditoría de cambios en inventario

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | SERIAL | PK | Identificador único |
| prenda_id | INTEGER | FK, NOT NULL | Referencia a prendas |
| tipo | VARCHAR(20) | NOT NULL | 'entrada', 'salida', 'ajuste' |
| cantidad | INTEGER | NOT NULL | Cantidad del movimiento |
| stock_anterior | INTEGER | NOT NULL, >= 0 | Stock antes del movimiento |
| stock_nuevo | INTEGER | NOT NULL, >= 0 | Stock después del movimiento |
| pedido_id | INTEGER | FK | Referencia a pedido (si aplica) |
| motivo | TEXT | | Razón del movimiento |
| fecha | TIMESTAMP | DEFAULT NOW() | Timestamp del movimiento |

---

## 🔗 Relaciones y Claves Foráneas

### 24 Relaciones FK Implementadas

| # | Tabla Origen | Columna | Tabla Destino | ON DELETE |
|---|-------------|---------|---------------|-----------|
| 1 | `direcciones` | cliente_id | `clientes` | CASCADE |
| 2 | `pedidos` | cliente_id | `clientes` | RESTRICT |
| 3 | `pedidos` | estado_id | `estados_pedido` | RESTRICT |
| 4 | `pedidos` | metodo_pago_id | `metodos_pago` | SET NULL |
| 5 | `pedidos` | direccion_envio_id | `direcciones` | SET NULL |
| 6 | `historial_estados_pedido` | pedido_id | `pedidos` | CASCADE |
| 7 | `historial_estados_pedido` | estado_anterior_id | `estados_pedido` | SET NULL |
| 8 | `historial_estados_pedido` | estado_nuevo_id | `estados_pedido` | RESTRICT |
| 9 | `pedidos_prendas` | pedido_id | `pedidos` | CASCADE |
| 10 | `pedidos_prendas` | prenda_id | `prendas` | RESTRICT |
| 11 | `prendas` | tipo_prenda_id | `tipos_prenda` | RESTRICT |
| 12 | `prendas` | categoria_id | `categorias` | RESTRICT |
| 13 | `prendas` | tela_id | `telas` | RESTRICT |
| 14 | `prendas` | patron_id | `patrones` | RESTRICT |
| 15 | `prendas` | artesano_id | `artesanos` | RESTRICT |
| 16 | `prendas` | coleccion_id | `colecciones` | SET NULL |
| 17 | `telas_proveedores` | tela_id | `telas` | CASCADE |
| 18 | `telas_proveedores` | proveedor_id | `proveedores` | CASCADE |
| 19 | `colecciones` | año_id | `años` | RESTRICT |
| 20 | `colecciones` | temporada_id | `temporadas` | RESTRICT |
| 21 | `movimientos_inventario` | prenda_id | `prendas` | RESTRICT |
| 22 | `movimientos_inventario` | pedido_id | `pedidos` | SET NULL |

### Cardinalidades

- **1:N** (Uno a Muchos): 18 relaciones
- **N:M** (Muchos a Muchos): 1 relación (`telas` ↔ `proveedores` via `telas_proveedores`)

---

## 📊 Vistas de Business Intelligence

### 5 Vistas Implementadas

#### 1. `vista_ventas_mensuales`
**Propósito**: Análisis de ventas agrupadas por mes

```sql
SELECT
  DATE_TRUNC('month', fecha_pedido) as mes,
  SUM(total) as total_ventas,
  COUNT(*) as cantidad_pedidos,
  AVG(total) as ticket_promedio
FROM pedidos
WHERE estado_id IN (SELECT id FROM estados_pedido WHERE nombre IN ('entregado', 'completado'))
GROUP BY DATE_TRUNC('month', fecha_pedido)
ORDER BY mes DESC;
```

**Uso**: Dashboard principal, reportes ejecutivos

---

#### 2. `vista_inventario_critico`
**Propósito**: Alertas de productos con stock bajo

```sql
SELECT
  p.id,
  p.nombre,
  c.nombre as categoria,
  (p.stock_inicial - p.stock_vendido) as stock_disponible,
  CASE
    WHEN (p.stock_inicial - p.stock_vendido) = 0 THEN 'AGOTADO'
    WHEN (p.stock_inicial - p.stock_vendido) <= 5 THEN 'CRÍTICO'
    WHEN (p.stock_inicial - p.stock_vendido) <= 10 THEN 'BAJO'
    ELSE 'NORMAL'
  END as estado_stock
FROM prendas p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activa = TRUE
  AND (p.stock_inicial - p.stock_vendido) <= 10
ORDER BY stock_disponible ASC;
```

**Uso**: Alertas de inventario, reabastecimiento

---

#### 3. `vista_top_productos`
**Propósito**: Productos más vendidos por ingresos

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

**Uso**: Análisis de productos, decisiones de inventario

---

#### 4. `vista_analisis_clientes`
**Propósito**: Segmentación de clientes por valor

```sql
SELECT
  c.id,
  c.nombre,
  c.email,
  COUNT(DISTINCT p.id) as total_pedidos,
  SUM(p.total) as valor_total,
  AVG(p.total) as ticket_promedio,
  MAX(p.fecha_pedido) as ultima_compra,
  CASE
    WHEN SUM(p.total) > 1000 THEN 'VIP'
    WHEN SUM(p.total) > 500 THEN 'Premium'
    WHEN SUM(p.total) > 100 THEN 'Regular'
    ELSE 'Nuevo'
  END as segmento
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
WHERE c.activo = TRUE
GROUP BY c.id, c.nombre, c.email
ORDER BY valor_total DESC;
```

**Uso**: Marketing, análisis de clientes, segmentación

---

#### 5. `vista_rotacion_inventario`
**Propósito**: Análisis de rotación de stock

```sql
SELECT
  p.id,
  p.nombre,
  p.stock_inicial,
  p.stock_vendido,
  (p.stock_inicial - p.stock_vendido) as stock_disponible,
  ROUND(
    (CAST(p.stock_vendido AS DECIMAL) / NULLIF(p.stock_inicial, 0)) * 100,
    2
  ) as porcentaje_rotacion,
  CASE
    WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) > 0.75 THEN 'Alta Rotación'
    WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) > 0.50 THEN 'Media Rotación'
    WHEN p.stock_vendido::DECIMAL / NULLIF(p.stock_inicial, 0) > 0.25 THEN 'Baja Rotación'
    ELSE 'Muy Baja Rotación'
  END as clasificacion_rotacion
FROM prendas p
WHERE p.activa = TRUE AND p.stock_inicial > 0
ORDER BY porcentaje_rotacion DESC;
```

**Uso**: Gestión de inventario, análisis de rotación

---

## 🔧 Procedimientos Almacenados

### 3 Procedimientos Implementados

#### 1. `procesar_pedido()`
**Propósito**: Procesa un pedido completo con validaciones

**Parámetros**:
- `p_cliente_id` (INTEGER): ID del cliente
- `p_items` (JSONB): Array de items `[{"prenda_id": 1, "cantidad": 2}]`
- `p_descuento` (DECIMAL): Descuento aplicado (opcional)

**Retorna**: INTEGER (ID del pedido creado)

**Funcionalidad**:
1. Valida que el cliente esté activo
2. Verifica stock disponible para cada item
3. Crea el pedido con estado "pendiente"
4. Inserta los items del pedido
5. Actualiza el stock de las prendas
6. Registra movimientos de inventario
7. Calcula totales automáticamente

**Ejemplo de uso**:
```sql
SELECT procesar_pedido(
  1,  -- cliente_id
  '[{"prenda_id": 5, "cantidad": 2}, {"prenda_id": 8, "cantidad": 1}]'::JSONB,
  10.00  -- descuento opcional
);
```

---

#### 2. `reabastecer_inventario()`
**Propósito**: Reabastece inventario con auditoría completa

**Parámetros**:
- `p_prenda_id` (INTEGER): ID de la prenda
- `p_cantidad` (INTEGER): Cantidad a agregar
- `p_motivo` (TEXT): Razón del reabastecimiento

**Retorna**: BOOLEAN (true si exitoso)

**Funcionalidad**:
1. Valida que la prenda exista
2. Actualiza `stock_inicial` sumando la cantidad
3. Recalcula `stock_disponible` automáticamente
4. Registra movimiento de inventario tipo "entrada"
5. Genera alerta si el stock sigue bajo

**Ejemplo de uso**:
```sql
SELECT reabastecer_inventario(5, 20, 'Reposición semanal');
```

---

#### 3. `calcular_comision()`
**Propósito**: Calcula comisiones de vendedores

**Parámetros**:
- `p_fecha_inicio` (DATE): Fecha inicial
- `p_fecha_fin` (DATE): Fecha final
- `p_porcentaje` (DECIMAL): Porcentaje de comisión

**Retorna**: TABLE con resultados

**Funcionalidad**:
1. Filtra pedidos por rango de fechas
2. Agrupa ventas por vendedor/artesano
3. Calcula comisión por venta
4. Suma totales por vendedor

**Ejemplo de uso**:
```sql
SELECT * FROM calcular_comision(
  '2024-01-01'::DATE,
  '2024-01-31'::DATE,
  5.0  -- 5% de comisión
);
```

---

## ⚡ Triggers Automáticos

### 3 Triggers Implementados

#### 1. `trigger_actualizar_stock_pedido`
**Tabla**: `pedidos_prendas`
**Evento**: AFTER INSERT
**Función**: `actualizar_stock_prenda()`

**Funcionalidad**:
- Actualiza automáticamente el `stock_vendido` de la prenda
- Recalcula el `stock_disponible`
- Se ejecuta cada vez que se agrega un item a un pedido

---

#### 2. `trigger_registrar_historial_estado`
**Tabla**: `pedidos`
**Evento**: AFTER UPDATE OF estado_id
**Función**: `registrar_historial_estado()`

**Funcionalidad**:
- Registra automáticamente cambios de estado en `historial_estados_pedido`
- Captura estado anterior y nuevo
- Registra timestamp y usuario del cambio
- Proporciona auditoría completa

---

#### 3. `trigger_alertar_stock_critico`
**Tabla**: `prendas`
**Evento**: AFTER UPDATE OF stock_disponible
**Función**: `alertar_stock_critico()`

**Funcionalidad**:
- Genera NOTICE cuando stock <= 5 unidades
- Genera WARNING cuando stock = 0 (agotado)
- Incluye información de la prenda y stock actual
- Facilita alertas en tiempo real

---

## 📐 Diagrama ERD

### Diagrama Entidad-Relación Completo

```mermaid
erDiagram
    clientes ||--o{ pedidos : "realiza"
    clientes ||--o{ direcciones : "tiene"
    pedidos ||--o{ pedidos_prendas : "contiene"
    pedidos }o--|| estados_pedido : "tiene estado"
    pedidos }o--|| metodos_pago : "pagado con"
    pedidos }o--o| direcciones : "envío a"
    pedidos ||--o{ historial_estados_pedido : "registra cambios"
    prendas ||--o{ pedidos_prendas : "incluida en"
    prendas }o--|| tipos_prenda : "es de tipo"
    prendas }o--|| categorias : "pertenece a"
    prendas }o--|| telas : "material"
    prendas }o--|| patrones : "diseño"
    prendas }o--|| artesanos : "confeccionada por"
    prendas }o--o| colecciones : "pertenece a"
    prendas ||--o{ movimientos_inventario : "registra movimientos"
    telas ||--o{ telas_proveedores : "suministrada por"
    proveedores ||--o{ telas_proveedores : "suministra"
    colecciones }o--|| años : "año"
    colecciones }o--|| temporadas : "temporada"

    clientes {
        int id PK
        varchar nombre
        varchar apellido
        varchar email UK
        varchar telefono
        boolean activo
        timestamp created_at
    }

    direcciones {
        int id PK
        int cliente_id FK
        varchar tipo
        varchar calle
        varchar ciudad
        varchar estado
        varchar codigo_postal
        varchar pais
        boolean predeterminada
    }

    pedidos {
        int id PK
        int cliente_id FK
        int estado_id FK
        int metodo_pago_id FK
        int direccion_envio_id FK
        decimal subtotal
        decimal descuento
        decimal total
        timestamp fecha_pedido
        timestamp fecha_completado
    }

    estados_pedido {
        int id PK
        varchar nombre UK
        text descripcion
        int orden_workflow
    }

    metodos_pago {
        int id PK
        varchar codigo UK
        varchar nombre
        varchar tipo
        decimal comision
        int orden
    }

    historial_estados_pedido {
        int id PK
        int pedido_id FK
        int estado_anterior_id FK
        int estado_nuevo_id FK
        timestamp fecha_cambio
        int usuario_id
    }

    pedidos_prendas {
        int id PK
        int pedido_id FK
        int prenda_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }

    prendas {
        int id PK
        varchar nombre
        int tipo_prenda_id FK
        int categoria_id FK
        int tela_id FK
        int patron_id FK
        int artesano_id FK
        int coleccion_id FK
        decimal precio_chamana
        int stock_inicial
        int stock_vendido
        boolean activa
        timestamp fecha_ultima_venta
    }

    tipos_prenda {
        int id PK
        varchar nombre UK
        text descripcion
        text cuidados
    }

    categorias {
        int id PK
        varchar nombre UK
        text descripcion
    }

    telas {
        int id PK
        varchar nombre UK
        text descripcion
        varchar unidad
    }

    proveedores {
        int id PK
        varchar nombre
        varchar contacto
        varchar telefono
    }

    telas_proveedores {
        int id PK
        int tela_id FK
        int proveedor_id FK
        decimal precio_proveedor
    }

    patrones {
        int id PK
        varchar nombre UK
        text descripcion
        varchar origen
    }

    artesanos {
        int id PK
        varchar nombre
        varchar especialidad
        varchar comunidad
    }

    años {
        int id PK
        int año UK
        varchar temporada
    }

    temporadas {
        int id PK
        varchar nombre UK
    }

    colecciones {
        int id PK
        varchar nombre
        int año_id FK
        int temporada_id FK
        date fecha_inicio
        date fecha_fin
        boolean activa
    }

    movimientos_inventario {
        int id PK
        int prenda_id FK
        varchar tipo
        int cantidad
        int stock_anterior
        int stock_nuevo
        int pedido_id FK
        text motivo
        timestamp fecha
    }
```

---

## 🛡️ Reglas de Integridad

### CHECK Constraints

```sql
-- Valores no negativos en precios y cantidades
CHECK (precio_chamana >= 0)                    -- prendas
CHECK (subtotal >= 0)                          -- pedidos, pedidos_prendas
CHECK (descuento >= 0)                         -- pedidos
CHECK (total >= 0)                             -- pedidos
CHECK (cantidad > 0)                           -- pedidos_prendas
CHECK (stock_inicial >= 0)                     -- prendas
CHECK (stock_vendido >= 0)                     -- prendas
CHECK (precio_proveedor >= 0)                  -- telas_proveedores

-- Valores enumerados
CHECK (tipo IN ('entrada', 'salida', 'ajuste')) -- movimientos_inventario
CHECK (tipo IN ('envio', 'facturacion', 'otro')) -- direcciones
```

### UNIQUE Constraints

```sql
UNIQUE (email)                                  -- clientes
UNIQUE (nombre)                                 -- estados_pedido
UNIQUE (codigo)                                 -- metodos_pago
UNIQUE (nombre)                                 -- tipos_prenda
UNIQUE (nombre)                                 -- categorias
UNIQUE (nombre)                                 -- telas
UNIQUE (nombre)                                 -- patrones
UNIQUE (año)                                    -- años
UNIQUE (nombre)                                 -- temporadas
UNIQUE (tela_id, proveedor_id)                  -- telas_proveedores
```

### DEFAULT Values

```sql
DEFAULT TRUE                                    -- activo, activa, predeterminada
DEFAULT FALSE                                   -- varios booleanos
DEFAULT 0                                       -- descuento, comision, stock_inicial, stock_vendido
DEFAULT CURRENT_TIMESTAMP                       -- fecha_registro, fecha_pedido, fecha_cambio
DEFAULT 'Perú'                                  -- pais
```

---

## 📈 Ventajas de la Normalización 3NF

### Beneficios Técnicos

1. **✅ Sin Redundancia**: Cada dato se almacena una sola vez
2. **✅ Integridad Referencial**: Relaciones FK garantizan consistencia
3. **✅ Flexibilidad**: Fácil agregar nuevos estados, métodos de pago, tipos
4. **✅ Auditoría Completa**: Historial de todos los cambios importantes
5. **✅ Escalabilidad**: Diseño preparado para crecimiento
6. **✅ Mantenimiento**: Cambios centralizados sin afectar datos relacionados

### Beneficios de Negocio

1. **✅ Múltiples Direcciones**: Clientes pueden tener varias direcciones
2. **✅ Workflow Configurable**: Estados de pedido gestionables
3. **✅ Gestión de Proveedores**: Comparación de precios entre proveedores
4. **✅ Reportes Avanzados**: 5 vistas BI para toma de decisiones
5. **✅ Automatización**: Triggers reducen errores manuales
6. **✅ Trazabilidad**: Historial completo de cambios para auditoría

---

## 📊 Comparación con Fases Anteriores

| Aspecto | Fase 2 (2NF) | Fase 3 (3NF) | Mejora |
|---------|-------------|-------------|--------|
| **Tablas** | 12 | 19 | +7 tablas normalizadas |
| **Dependencias Transitivas** | ❌ Presentes | ✅ Eliminadas | 100% |
| **Direcciones por Cliente** | 1 | N | Múltiples |
| **Estados de Pedido** | Texto libre | Tabla normalizada | Centralizado |
| **Proveedores** | No gestionados | Tabla + relación M:N | Completo |
| **Auditoría** | Parcial | Completa | Historial |
| **Vistas BI** | 0 | 5 | Análisis avanzado |
| **Procedimientos** | 0 | 3 | Lógica encapsulada |
| **Triggers** | 0 | 3 | Automatización |

---

## 🎓 Conclusiones

### Logros de la Fase 3

- ✅ **Normalización 3NF Completa**: Sin dependencias transitivas
- ✅ **19 Tablas Optimizadas**: Todas siguiendo principios ACID
- ✅ **24 Relaciones FK**: Integridad referencial garantizada
- ✅ **Business Intelligence**: 5 vistas para análisis y reportes
- ✅ **Automatización**: 3 procedimientos + 3 triggers
- ✅ **Escalabilidad**: Diseño preparado para crecimiento futuro
- ✅ **Documentación Completa**: Diagramas, scripts y guías

### Próximos Pasos

- **Fase 4**: Optimización de performance (índices, vistas materializadas)
- **Fase 5-7**: Implementación completa de portales B2C/B2B

---

**Base de Datos**: `chamana_db_fase3`
**Forma Normal**: 3NF (Tercera Forma Normal)
**Estado**: ✅ Completa - Entrega Académica
**Autor**: Gabriel Osemberg
**Fecha**: Noviembre 2025

---

> 📊 "Un buen diseño de base de datos es la base de cualquier aplicación exitosa"
