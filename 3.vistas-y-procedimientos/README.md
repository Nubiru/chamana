# Fase 3: Tercera Forma Normal (3NF) + Vistas y Procedimientos

**Estado**: ✅ Completado  
**Fecha**: Noviembre 2025  
**Autor**: Gabriel Osemberg

## Índice

1. [Objetivos](#objetivos)
2. [Normalización 3NF](#normalización-3nf)
3. [Vistas de BI](#vistas-de-bi)
4. [Procedimientos Almacenados](#procedimientos-almacenados)
5. [Triggers](#triggers)
6. [Aplicación Web](#aplicación-web)
7. [Instalación](#instalación)
8. [Uso](#uso)
9. [Datos Reales](#datos-reales)
10. [Comparación con Fase 2](#comparación-con-fase-2)

---

## Objetivos

Aplicar Tercera Forma Normal (3NF) eliminando dependencias transitivas y agregando:
- Vistas de Business Intelligence
- Procedimientos almacenados con lógica de negocio
- Triggers para automatización
- Aplicación web profesional con Bootstrap 5

---

## Normalización 3NF

### Regla de 3NF

> Ningún atributo no clave debe depender transitivamente de la clave primaria.  
> Es decir: **eliminar dependencias de atributos no clave entre sí**.

### Problemas Encontrados en Fase 2

| Tabla Original | Problema | Solución |
|----------------|----------|----------|
| `clientes` | Dirección mezclada con datos del cliente | Nueva tabla `direcciones` |
| `prendas` | Tipo de prenda como string (redundante) | Nueva tabla `tipos_prenda` |
| `pedidos` | Estado como string sin historial | Nuevas tablas `estados_pedido` + `historial_estados_pedido` |
| `telas` | Proveedor implícito en precio | Nuevas tablas `proveedores` + `telas_proveedores` |
| `pedidos` | Método de pago como string | Nueva tabla `metodos_pago` |

### Nuevas Tablas 3NF

#### 1. direcciones

Elimina dependencia transitiva: `cliente_id → direccion → ciudad, region, codigo_postal`

```sql
CREATE TABLE direcciones (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) CHECK (tipo IN ('envio', 'facturacion', 'principal')),
  direccion TEXT NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estado VARCHAR(100),
  codigo_postal VARCHAR(10),
  pais VARCHAR(50) DEFAULT 'México',
  predeterminada BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Ventajas**:
- Un cliente puede tener múltiples direcciones
- Direcciones reutilizables (misma ciudad/CP no se duplica)
- Historial de direcciones (activa/inactiva)

#### 2. tipos_prenda

Elimina dependencia transitiva: `prenda_id → tipo → descripcion_tipo, cuidados`

```sql
CREATE TABLE tipos_prenda (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  cuidados TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Ventajas**:
- Catálogo centralizado de tipos
- Fácil agregar nuevos tipos sin modificar prendas
- Consistencia en nombres

#### 3. estados_pedido

Elimina dependencia transitiva: `pedido_id → estado → descripcion_estado, color, workflow`

```sql
CREATE TABLE estados_pedido (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  orden_workflow INTEGER,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Ventajas**:
- Workflow definido (orden de estados)
- Estados reutilizables
- Fácil agregar nuevos estados

#### 4. historial_estados_pedido

Auditoría completa de cambios de estado:

```sql
CREATE TABLE historial_estados_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estado_anterior_id INTEGER REFERENCES estados_pedido(id),
  estado_nuevo_id INTEGER NOT NULL REFERENCES estados_pedido(id),
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER,
  comentario TEXT
);
```

**Ventajas**:
- Trazabilidad completa
- Auditoría para cumplimiento
- Análisis de tiempos de procesamiento

#### 5. proveedores

Catálogo de proveedores de telas:

```sql
CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. telas_proveedores

Relación M:M entre telas y proveedores con precios:

```sql
CREATE TABLE telas_proveedores (
  id SERIAL PRIMARY KEY,
  tela_id INTEGER NOT NULL REFERENCES telas(id) ON DELETE CASCADE,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  precio_proveedor DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'MXN',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tela_id, proveedor_id)
);
```

**Ventajas**:
- Múltiples proveedores por tela
- Comparación de precios
- Historial de precios por proveedor

#### 7. metodos_pago

Catálogo de métodos de pago:

```sql
CREATE TABLE metodos_pago (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Vistas de BI

### 1. vista_ventas_mensuales

**Propósito**: Análisis de ventas agregadas por mes

```sql
CREATE VIEW vista_ventas_mensuales AS
SELECT
  TO_CHAR(p.fecha_pedido, 'YYYY-MM') as mes,
  COUNT(p.id) as cantidad_pedidos,
  SUM(p.total) as total_ventas,
  AVG(p.total) as ticket_promedio
FROM pedidos p
WHERE p.fecha_pedido IS NOT NULL
GROUP BY TO_CHAR(p.fecha_pedido, 'YYYY-MM')
ORDER BY mes DESC;
```

**Uso**:
```sql
SELECT * FROM vista_ventas_mensuales;
```

### 2. vista_inventario_critico

**Propósito**: Alertas de stock bajo o agotado

```sql
CREATE VIEW vista_inventario_critico AS
SELECT
  pr.id,
  pr.nombre as nombre_prenda,
  pr.stock_disponible as stock_actual,
  CASE
    WHEN pr.stock_disponible = 0 THEN 'AGOTADO'
    WHEN pr.stock_disponible <= 5 THEN 'CRÍTICO'
    WHEN pr.stock_disponible <= 10 THEN 'BAJO'
    ELSE 'NORMAL'
  END as alerta_stock
FROM prendas pr
WHERE pr.stock_disponible <= 10 OR pr.stock_disponible = 0
ORDER BY pr.stock_disponible ASC;
```

### 3. vista_top_productos

**Propósito**: Productos más vendidos por ingresos

```sql
CREATE VIEW vista_top_productos AS
SELECT
  pr.id,
  pr.nombre as nombre_prenda,
  SUM(pp.cantidad) as total_vendido,
  SUM(pp.subtotal) as ingresos_totales
FROM prendas pr
JOIN pedidos_prendas pp ON pp.prenda_id = pr.id
JOIN pedidos p ON p.id = pp.pedido_id
WHERE p.estado = 'completado'
GROUP BY pr.id, pr.nombre
ORDER BY ingresos_totales DESC;
```

### 4. vista_analisis_clientes

**Propósito**: Segmentación y análisis de clientes

```sql
CREATE VIEW vista_analisis_clientes AS
SELECT
  c.id,
  c.nombre as nombre_cliente,
  c.email,
  COUNT(DISTINCT p.id) as total_pedidos,
  SUM(p.total) as total_gastado,
  AVG(p.total) as promedio_por_pedido,
  CASE
    WHEN SUM(p.total) > 100000 THEN 'VIP'
    WHEN SUM(p.total) > 50000 THEN 'ACTIVO'
    ELSE 'OCCASIONAL'
  END as segmento
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nombre, c.email;
```

### 5. vista_rotacion_inventario

**Propósito**: Métricas de rotación de stock

```sql
CREATE VIEW vista_rotacion_inventario AS
SELECT
  pr.id,
  pr.nombre as nombre_prenda,
  pr.stock_disponible as stock_actual,
  COUNT(DISTINCT pp.pedido_id) as vendidos_ultimos_30_dias,
  CASE
    WHEN COUNT(DISTINCT pp.pedido_id) > 0 THEN
      (pr.stock_disponible::DECIMAL / COUNT(DISTINCT pp.pedido_id)) * 30
    ELSE NULL
  END as rotacion
FROM prendas pr
LEFT JOIN pedidos_prendas pp ON pp.prenda_id = pr.id
LEFT JOIN pedidos p ON p.id = pp.pedido_id
  AND p.fecha_pedido >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.id, pr.nombre, pr.stock_disponible
ORDER BY rotacion DESC NULLS LAST;
```

---

## Procedimientos Almacenados

### 1. procesar_pedido()

**Propósito**: Procesa un pedido completo: valida stock, crea pedido, actualiza inventario

**Firma**:
```sql
CREATE OR REPLACE FUNCTION procesar_pedido(
  p_cliente_id INTEGER,
  p_items JSONB,
  p_descuento DECIMAL DEFAULT 0
) RETURNS INTEGER
```

**Lógica**:
1. Valida que el cliente existe y está activo
2. Crea pedido con estado 'pendiente'
3. Para cada item en `p_items`:
   - Valida stock disponible
   - Inserta en `pedidos_prendas`
   - Reduce stock (`stock_vendido += cantidad`)
   - Registra movimiento en `movimientos_inventario`
4. Calcula totales (subtotal - descuento)
5. Actualiza pedido con totales
6. Retorna ID del pedido creado

**Uso**:
```sql
SELECT procesar_pedido(
  1, -- cliente_id
  '[{"prenda_id": 1, "cantidad": 2}, {"prenda_id": 3, "cantidad": 1}]'::jsonb,
  0  -- descuento
);
```

### 2. reabastecer_inventario()

**Propósito**: Reabastece stock de una prenda con auditoría

**Firma**:
```sql
CREATE OR REPLACE FUNCTION reabastecer_inventario(
  p_prenda_id INTEGER,
  p_cantidad INTEGER,
  p_motivo TEXT DEFAULT 'Reabastecimiento manual'
) RETURNS BOOLEAN
```

**Lógica**:
1. Valida que la prenda existe y está activa
2. Valida que cantidad > 0
3. Actualiza `stock_inicial += cantidad`
4. Registra movimiento en `movimientos_inventario` (tipo: 'ajuste')
5. Retorna TRUE si exitoso

**Uso**:
```sql
SELECT reabastecer_inventario(1, 10, 'Reabastecimiento mensual');
```

### 3. calcular_comision_vendedor()

**Propósito**: Calcula comisiones de venta por día en un rango de fechas

**Firma**:
```sql
CREATE OR REPLACE FUNCTION calcular_comision_vendedor(
  p_fecha_inicio DATE,
  p_fecha_fin DATE,
  p_porcentaje_comision DECIMAL DEFAULT 5.0
) RETURNS TABLE (
  fecha DATE,
  total_ventas DECIMAL,
  comision DECIMAL,
  pedidos INTEGER
)
```

**Lógica**:
1. Agrupa pedidos completados por fecha
2. Calcula total de ventas por día
3. Calcula comisión (total_ventas * porcentaje / 100)
4. Retorna tabla con fecha, ventas, comisión, cantidad de pedidos

**Uso**:
```sql
SELECT * FROM calcular_comision_vendedor('2025-11-01', '2025-11-30', 5.0);
```

---

## Triggers

### 1. trigger_track_order_state

**Propósito**: Registra automáticamente cambios de estado en pedidos

**Evento**: `AFTER UPDATE ON pedidos`  
**Condición**: Cuando cambia el campo `estado_id`

```sql
CREATE TRIGGER trigger_track_order_state
AFTER UPDATE ON pedidos
FOR EACH ROW
WHEN (OLD.estado_id IS DISTINCT FROM NEW.estado_id)
EXECUTE FUNCTION track_order_state_change();
```

**Función**:
```sql
CREATE OR REPLACE FUNCTION track_order_state_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO historial_estados_pedido (
    pedido_id, estado_anterior_id, estado_nuevo_id, fecha_cambio
  ) VALUES (
    NEW.id, OLD.estado_id, NEW.estado_id, CURRENT_TIMESTAMP
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. trigger_stock_alert

**Propósito**: Genera alertas cuando stock cae a niveles críticos

**Evento**: `AFTER UPDATE ON movimientos_inventario`  
**Condición**: Cuando `stock_nuevo <= 5`

```sql
CREATE TRIGGER trigger_stock_alert
AFTER INSERT ON movimientos_inventario
FOR EACH ROW
WHEN (NEW.stock_nuevo <= 5)
EXECUTE FUNCTION check_stock_alert();
```

### 3. trigger_manage_default_address

**Propósito**: Gestiona dirección predeterminada (solo una por cliente)

**Evento**: `BEFORE INSERT OR UPDATE ON direcciones`

```sql
CREATE TRIGGER trigger_manage_default_address
BEFORE INSERT OR UPDATE ON direcciones
FOR EACH ROW
WHEN (NEW.predeterminada = TRUE)
EXECUTE FUNCTION manage_default_address();
```

---

## Aplicación Web

### Tecnologías

- **Backend**: Express.js 4.18.2
- **Frontend**: Bootstrap 5.3.2 + Vanilla JavaScript
- **Database Driver**: node-postgres (pg) 8.11.3
- **Styling**: Bootstrap Icons 1.11.1

### Estructura

```
3.vistas-y-procedimientos/
├── server.js              # Express server
├── package.json
├── routes/
│   ├── views.js          # API endpoints for views
│   └── procedures.js     # API endpoints for procedures
├── public/
│   ├── index.html        # Dashboard
│   ├── reportes.html     # Reports page (5 views)
│   ├── procesos.html      # Processes page (3 procedures)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── dashboard.js
│       ├── reportes.js
│       └── procesos.js
└── database/
    └── scripts/          # Migration scripts
```

### Páginas

#### Dashboard (`/`)

- **KPI Cards**: Ventas del mes, Total productos, Stock crítico, Clientes
- **Top 10 Productos**: Tabla con productos más vendidos
- **Inventario Crítico**: Tabla con productos de stock bajo

#### Reportes (`/reportes.html`)

- **5 Tabs**: Ventas Mensuales, Inventario Crítico, Top Productos, Análisis Clientes, Rotación Inventario
- **Tablas Interactivas**: Datos en tiempo real desde vistas
- **Exportación CSV**: Botón de exportar en cada reporte

#### Procesos (`/procesos.html`)

- **3 Formularios**: Procesar Pedido, Reabastecer Inventario, Calcular Comisión
- **Historial de Ejecuciones**: Tabla con últimas 20 ejecuciones
- **Resultados en Tiempo Real**: Mensajes de éxito/error con badges

---

## Instalación

### Requisitos Previos

- PostgreSQL 15+
- Node.js 18+
- npm 9+

### Paso 1: Configurar Base de Datos

```bash
cd 3.vistas-y-procedimientos/database/scripts
npm install
npm run migrate      # Crea DB, tablas, vistas, procedures, triggers
npm run seed-real    # Inserta datos reales de Chamana
npm run verify       # Verifica implementación
```

### Paso 2: Configurar Aplicación Web

```bash
cd ../../web
npm install
```

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
PORT=3003
```

---

## Uso

### Iniciar Servidor Web

```bash
cd 3.vistas-y-procedimientos/web
npm start
```

**Output Esperado**:
```
🚀 Phase 3 Server running on http://localhost:3003
📊 Dashboard: http://localhost:3003
📈 Reports: http://localhost:3003/reportes.html
⚙️  Processes: http://localhost:3003/procesos.html
```

### Probar Vistas

```bash
curl http://localhost:3003/api/views/ventas-mensuales
curl http://localhost:3003/api/views/inventario-critico
curl http://localhost:3003/api/views/top-productos
curl http://localhost:3003/api/views/analisis-clientes
curl http://localhost:3003/api/views/rotacion-inventario
```

### Probar Procedimientos

```bash
# Procesar pedido
curl -X POST http://localhost:3003/api/procedures/procesar-pedido \
  -H "Content-Type: application/json" \
  -d '{"cliente_id": 1, "items": [{"prenda_id": 1, "cantidad": 2}], "descuento": 0}'

# Reabastecer inventario
curl -X POST http://localhost:3003/api/procedures/reabastecer-inventario \
  -H "Content-Type: application/json" \
  -d '{"prenda_id": 1, "cantidad": 10}'

# Calcular comisión
curl -X POST http://localhost:3003/api/procedures/calcular-comision \
  -H "Content-Type: application/json" \
  -d '{"fecha_inicio": "2025-11-01", "fecha_fin": "2025-11-30", "porcentaje": 5.0}'
```

---

## Datos Reales

### Colecciones CHAMANA

**Tierra (Invierno 2025)**:
- 16 diseños únicos
- 17 telas con precios reales
- Inspiración: Naturaleza, elementos terrestres

**Magia (Verano 2026)**:
- 11 diseños únicos
- 21 telas con precios reales
- Inspiración: Místico, etéreo

**Total**: 27 diseños únicos, 38 telas con precios reales, 15+ prendas de muestra

---

## Comparación con Fase 2

| Aspecto | Fase 2 (2NF) | Fase 3 (3NF) | Mejora |
|---------|--------------|--------------|--------|
| **Tablas** | 12 | 19 (+7) | ✅ +7 tablas |
| **Normalización** | 2NF | 3NF | ✅ Completa |
| **Vistas** | 0 | 5 | ✅ Analytics |
| **Procedures** | 0 | 3 | ✅ Lógica en DB |
| **Triggers** | 0 | 3 | ✅ Automatización |
| **Dependencias** | Solo directas | Sin transitivas | ✅ Perfecta |
| **Redundancia** | Baja | Mínima | ✅ Eliminada |
| **Web UI** | Vanilla CSS | Bootstrap 5 | ✅ Moderna |
| **Integridad** | Alta | Muy Alta | ✅ Mejorada |

---

## Documentación Adicional

- **Scripts de migración**: `database/scripts/01-07_*.js`
- **Demo JOINs**: `database/scripts/08_demo_joins.sql`
- **Verificación**: `database/scripts/09_verificar.js`
- **Datos reales**: `database/scripts/10_seed_chamana_real_data.js`
- **Comparativa Fase 2 vs 3**: `docs/diagramas/fase3/comparativa-fase2-vs-fase3.md`

---

## Navegación

- **← Atrás**: [README Principal](../README.md)
- **← Fase 2**: [2.relaciones](../2.relaciones/)
- **📊 Diagramas**: [Visualización de esta fase](../diagramas/fase3/) (próximamente)
- **📚 Documentación Detallada**: [GitHub Wiki](../wiki) (próximamente)

---

**Base de Datos**: `chamana_db_fase3`  
**Forma Normal**: 3NF (Tercera Forma Normal)  
**Estado**: Sin dependencias transitivas, sistema completo con BI

---

**Autor**: Gabriel Osemberg  
**Proyecto Académico**: Bases de Datos  
**Fecha**: Noviembre 2025  
**Licencia**: MIT

