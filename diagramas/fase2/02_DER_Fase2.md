# DER - Diagrama Entidad-Relación (Lógico)

## Fase 2: Segunda Forma Normal (2NF)

**CHAMANA E-commerce - Especificación Técnica Completa**

---

## Sistema Completo: 12 Tablas con Tipos de Datos

```mermaid
erDiagram
    %% TABLAS BASE (desde Fase 1)

    clientes ||--o{ pedidos : "FK cliente_id"
    clientes {
        SERIAL id PK
        VARCHAR(100) nombre "NOT NULL"
        VARCHAR(100) apellido "NOT NULL"
        VARCHAR(255) email "UNIQUE, NOT NULL"
        VARCHAR(20) telefono
        TEXT direccion
        VARCHAR(100) ciudad
        VARCHAR(10) codigo_postal
        TIMESTAMP fecha_registro "DEFAULT NOW()"
        BOOLEAN activo "DEFAULT true"
    }

    categorias ||--o{ prendas : "FK categoria_id"
    categorias {
        SERIAL id PK
        VARCHAR(100) nombre "UNIQUE, NOT NULL"
        TEXT descripcion
    }

    disenos ||--o{ prendas : "FK diseno_id"
    disenos {
        SERIAL id PK
        VARCHAR(100) nombre "UNIQUE, NOT NULL"
        TEXT descripcion
        TEXT imagen_url
    }

    telas ||--o{ prendas : "FK tela_id"
    telas {
        SERIAL id PK
        VARCHAR(100) nombre "UNIQUE, NOT NULL"
        TEXT descripcion
        DECIMAL(10,2) precio_metro
    }

    años ||--o{ colecciones : "FK año_id"
    años {
        SERIAL id PK
        INTEGER año "UNIQUE, NOT NULL"
    }

    temporadas ||--o{ colecciones : "FK temporada_id"
    temporadas {
        SERIAL id PK
        VARCHAR(50) nombre "UNIQUE, NOT NULL"
    }

    colecciones ||--o{ prendas : "FK coleccion_id"
    colecciones {
        SERIAL id PK
        VARCHAR(200) nombre "NOT NULL"
        INTEGER año_id "FK"
        INTEGER temporada_id "FK"
        TEXT descripcion
        DATE fecha_inicio
        DATE fecha_fin
        BOOLEAN activa "DEFAULT true"
    }

    %% TABLA MEJORADA (Fase 2)

    prendas ||--o{ pedidos_prendas : "FK prenda_id"
    prendas ||--o{ movimientos_inventario : "FK prenda_id"
    prendas {
        SERIAL id PK
        VARCHAR(200) nombre "NOT NULL"
        VARCHAR(100) tipo "NOT NULL"
        DECIMAL(10,2) precio_chamana "NOT NULL, CHECK > 0"
        INTEGER categoria_id "FK, NOT NULL"
        INTEGER diseno_id "FK, NOT NULL"
        INTEGER tela_id "FK, NOT NULL"
        INTEGER coleccion_id "FK"
        TEXT descripcion
        TIMESTAMP fecha_creacion "DEFAULT NOW()"
        TIMESTAMP fecha_ultima_venta
        BOOLEAN activa "DEFAULT true"
        INTEGER stock_inicial "DEFAULT 0, CHECK >= 0"
        INTEGER stock_vendido "DEFAULT 0, CHECK >= 0"
        INTEGER stock_disponible "GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED"
    }

    %% NUEVAS TABLAS (Fase 2 - 2NF)

    pedidos ||--|{ pedidos_prendas : "FK pedido_id"
    pedidos ||--o{ movimientos_inventario : "FK pedido_id"
    pedidos {
        SERIAL id PK
        INTEGER cliente_id "FK, NOT NULL"
        TIMESTAMP fecha_pedido "DEFAULT NOW(), NOT NULL"
        VARCHAR(20) estado "CHECK IN (pendiente, completado, cancelado), DEFAULT pendiente"
        DECIMAL(10,2) subtotal "NOT NULL, CHECK >= 0"
        DECIMAL(10,2) descuento "DEFAULT 0, CHECK >= 0"
        DECIMAL(10,2) total "NOT NULL, CHECK >= 0"
        TIMESTAMP fecha_completado
        TIMESTAMP fecha_cancelado
        TEXT notas
    }

    pedidos_prendas {
        SERIAL id PK
        INTEGER pedido_id "FK, NOT NULL"
        INTEGER prenda_id "FK, NOT NULL"
        INTEGER cantidad "NOT NULL, CHECK > 0"
        DECIMAL(10,2) precio_unitario "NOT NULL, CHECK > 0"
        DECIMAL(10,2) subtotal "NOT NULL, CHECK >= 0"
        UNIQUE (pedido_id, prenda_id)
    }

    telas ||--o{ telas_temporadas : "FK tela_id"
    temporadas ||--o{ telas_temporadas : "FK temporada_id"
    años ||--o{ telas_temporadas : "FK año_id"
    telas_temporadas {
        SERIAL id PK
        INTEGER tela_id "FK, NOT NULL"
        INTEGER temporada_id "FK, NOT NULL"
        INTEGER año_id "FK, NOT NULL"
        BOOLEAN activo "DEFAULT true"
        TIMESTAMP fecha_registro "DEFAULT NOW()"
        UNIQUE (tela_id, temporada_id, año_id)
    }

    movimientos_inventario {
        SERIAL id PK
        INTEGER prenda_id "FK, NOT NULL"
        VARCHAR(20) tipo "CHECK IN (venta, ajuste, devolucion), NOT NULL"
        INTEGER cantidad "NOT NULL"
        INTEGER stock_anterior "NOT NULL, CHECK >= 0"
        INTEGER stock_nuevo "NOT NULL, CHECK >= 0"
        INTEGER pedido_id "FK, NULLABLE"
        TEXT motivo "NOT NULL"
        TIMESTAMP fecha "DEFAULT NOW(), NOT NULL"
    }
```

---

## Especificaciones Técnicas

### Tabla: `prendas` ⭐ MEJORADA (Fase 2)

**Cambios desde Fase 1**:

- ➕ **Agregado**: `stock_inicial` (inventario base)
- ➕ **Agregado**: `stock_vendido` (cantidad vendida)
- ➕ **Agregado**: `stock_disponible` (columna generada automáticamente)
- ➕ **Agregado**: `fecha_ultima_venta` (trazabilidad)

**Columna Generada**:

```sql
stock_disponible = stock_inicial - stock_vendido
```

Calculada automáticamente por PostgreSQL, garantiza consistencia.

---

### Tabla: `pedidos` ⭐ NUEVA (Fase 2 - 2NF)

**Propósito**: Órdenes de compra de clientes

**10 columnas** con validaciones estrictas

- **Estado**: CHECK IN ('pendiente', 'completado', 'cancelado')
- **Montos**: CHECK >= 0 para subtotal, descuento, total
- **Foreign Key**: cliente_id → clientes(id) ON DELETE RESTRICT

---

### Tabla: `pedidos_prendas` ⭐ NUEVA (Fase 2 - Junction Table)

**Propósito**: Líneas de pedido (items individuales)

**6 columnas**

- **UNIQUE Constraint**: (pedido_id, prenda_id) - No duplicar prendas en mismo pedido
- **Foreign Keys**:
  - pedido_id → pedidos(id) ON DELETE CASCADE
  - prenda_id → prendas(id) ON DELETE RESTRICT

**Justificación 2NF**: Atributos de línea (`cantidad`, `precio_unitario`) dependen completamente de la clave compuesta `(pedido_id, prenda_id)`, no solo de `pedido_id`.

---

### Tabla: `telas_temporadas` ⭐ NUEVA (Fase 2 - Junction Table)

**Propósito**: Disponibilidad de telas por temporada y año

**6 columnas**

- **UNIQUE Constraint**: (tela_id, temporada_id, año_id) - No duplicar asignaciones
- **Foreign Keys**:
  - tela_id → telas(id) ON DELETE CASCADE
  - temporada_id → temporadas(id) ON DELETE RESTRICT
  - año_id → años(id) ON DELETE RESTRICT

**Justificación 2NF**: Permite que una tela esté disponible en múltiples temporadas/años sin duplicar datos de la tela.

---

### Tabla: `movimientos_inventario` ⭐ NUEVA (Fase 2)

**Propósito**: Auditoría de cambios en stock

**9 columnas**

- **Tipo**: CHECK IN ('venta', 'ajuste', 'devolucion')
- **Trazabilidad**: Registra stock_anterior y stock_nuevo
- **Opcional**: pedido_id puede ser NULL (para ajustes manuales)

---

## Resumen de Foreign Keys

| FK  | Desde                              | Hacia            | Acción ON DELETE |
| --- | ---------------------------------- | ---------------- | ---------------- |
| 1   | `colecciones.año_id`               | `años.id`        | RESTRICT         |
| 2   | `colecciones.temporada_id`         | `temporadas.id`  | RESTRICT         |
| 3   | `prendas.categoria_id`             | `categorias.id`  | RESTRICT         |
| 4   | `prendas.diseno_id`                | `disenos.id`     | RESTRICT         |
| 5   | `prendas.tela_id`                  | `telas.id`       | RESTRICT         |
| 6   | `prendas.coleccion_id`             | `colecciones.id` | SET NULL         |
| 7   | `pedidos.cliente_id`               | `clientes.id`    | RESTRICT         |
| 8   | `pedidos_prendas.pedido_id`        | `pedidos.id`     | CASCADE          |
| 9   | `pedidos_prendas.prenda_id`        | `prendas.id`     | RESTRICT         |
| 10  | `telas_temporadas.tela_id`         | `telas.id`       | CASCADE          |
| 11  | `telas_temporadas.temporada_id`    | `temporadas.id`  | RESTRICT         |
| 12  | `telas_temporadas.año_id`          | `años.id`        | RESTRICT         |
| 13  | `movimientos_inventario.prenda_id` | `prendas.id`     | RESTRICT         |
| 14  | `movimientos_inventario.pedido_id` | `pedidos.id`     | SET NULL         |

---

## Índices (34 total)

**Por Tabla**:

- `clientes`: 3 (email, activo, nombre)
- `categorias`: 1 (nombre)
- `disenos`: 1 (nombre)
- `telas`: 1 (nombre)
- `años`: 1 (año)
- `temporadas`: 1 (nombre)
- `colecciones`: 3 (año_id, temporada_id, activa)
- `prendas`: 8 (todos los FKs + activa + tipo + fecha_creacion + stock_disponible)
- `pedidos`: 4 (cliente_id, estado, fecha_pedido, fecha_completado)
- `pedidos_prendas`: 2 (pedido_id, prenda_id)
- `telas_temporadas`: 5 (tela_id, temporada_id, año_id, activo, compuesto)
- `movimientos_inventario`: 4 (prenda_id, pedido_id, tipo, fecha)

---

## Características Avanzadas

### 1. Columna Generada (PostgreSQL 12+)

```sql
stock_disponible INTEGER GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED
```

- **Ventaja**: Cálculo automático, sin posibilidad de desincronización
- **Performance**: Indexable como columna normal

### 2. CHECK Constraints para Integridad

```sql
CHECK (estado IN ('pendiente', 'completado', 'cancelado'))
CHECK (precio_chamana > 0)
CHECK (stock_anterior >= 0)
```

- **Ventaja**: Validación a nivel de base de datos

### 3. ON DELETE Policies

- **RESTRICT**: Previene eliminación si hay referencias
- **CASCADE**: Elimina registros dependientes
- **SET NULL**: Limpia referencia sin eliminar

---

## Métricas del Modelo

| Métrica                | Valor       |
| ---------------------- | ----------- |
| **Total Tablas**       | 12          |
| **Columnas Totales**   | ~90         |
| **Primary Keys**       | 12 (SERIAL) |
| **Foreign Keys**       | 14          |
| **Índices**            | 34          |
| **UNIQUE Constraints** | 8           |
| **CHECK Constraints**  | 15+         |
| **Columnas Generadas** | 1           |

---

**Base de Datos**: `chamana_db_fase2`  
**PostgreSQL**: 12+  
**Forma Normal**: 2NF  
**Estado**: Sin dependencias parciales
