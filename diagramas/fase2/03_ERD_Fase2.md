# ERD - Entity-Relationship Diagram (Físico/Técnico)

## Fase 2: Segunda Forma Normal (2NF)

**CHAMANA E-commerce - Modelo Físico PostgreSQL con Gestión de Pedidos e Inventario**

---

## Diagrama Entidad-Relación

```mermaid
erDiagram
    clientes ||--o{ pedidos : "realiza (1:N)"
    pedidos ||--o{ pedidos_prendas : "contiene (1:N)"
    prendas ||--o{ pedidos_prendas : "incluida_en (1:N)"
    categorias ||--o{ prendas : "clasifica (1:N)"
    disenos ||--o{ prendas : "usa (1:N)"
    telas ||--o{ prendas : "usa (1:N)"
    telas ||--o{ telas_temporadas : "disponible_en (1:N)"
    colecciones ||--o{ prendas : "contiene (1:N)"
    años ||--o{ colecciones : "tiene (1:N)"
    años ||--o{ telas_temporadas : "tiene (1:N)"
    temporadas ||--o{ colecciones : "tiene (1:N)"
    temporadas ||--o{ telas_temporadas : "tiene (1:N)"
    prendas ||--o{ movimientos_inventario : "tiene (1:N)"
    pedidos o--o{ movimientos_inventario : "genera (0:1)"

    clientes {
        serial id PK "Clave primaria autoincremental"
        varchar_100 nombre "NOT NULL"
        varchar_100 apellido "NOT NULL"
        varchar_150 email UK "UNIQUE, NOT NULL"
        varchar_20 telefono "Opcional"
        text direccion "Opcional"
        varchar_100 ciudad "Opcional"
        varchar_10 codigo_postal "Opcional"
        timestamp fecha_registro "DEFAULT CURRENT_TIMESTAMP"
        boolean activo "DEFAULT TRUE"
    }

    pedidos {
        serial id PK "Clave primaria autoincremental"
        integer cliente_id FK "REFERENCES clientes(id)"
        timestamp fecha_pedido "DEFAULT CURRENT_TIMESTAMP, NOT NULL"
        varchar_20 estado "DEFAULT 'pendiente', CHECK IN ('pendiente','completado','cancelado')"
        numeric_10_2 subtotal "NOT NULL, CHECK >= 0"
        numeric_10_2 descuento "DEFAULT 0, CHECK >= 0"
        numeric_10_2 total "NOT NULL, CHECK >= 0"
        text notas "Opcional"
        timestamp fecha_completado "Opcional"
        timestamp fecha_cancelado "Opcional"
    }

    pedidos_prendas {
        serial id PK "Clave primaria autoincremental"
        integer pedido_id FK "REFERENCES pedidos(id)"
        integer prenda_id FK "REFERENCES prendas(id)"
        integer cantidad "NOT NULL, CHECK > 0"
        numeric_10_2 precio_unitario "NOT NULL, CHECK >= 0"
        numeric_10_2 subtotal "NOT NULL, CHECK >= 0"
    }

    categorias {
        serial id PK "Clave primaria autoincremental"
        varchar_100 nombre UK "UNIQUE, NOT NULL"
        text descripcion "Opcional"
    }

    disenos {
        serial id PK "Clave primaria autoincremental"
        varchar_150 nombre UK "UNIQUE, NOT NULL"
        text descripcion "Opcional"
        timestamp fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
    }

    telas {
        serial id PK "Clave primaria autoincremental"
        varchar_150 nombre UK "UNIQUE, NOT NULL"
        varchar_50 tipo "NOT NULL"
        text descripcion "Opcional"
        numeric_10_2 costo_por_metro "CHECK >= 0"
    }

    años {
        serial id PK "Clave primaria autoincremental"
        integer año UK "UNIQUE, NOT NULL"
    }

    temporadas {
        serial id PK "Clave primaria autoincremental"
        varchar_50 nombre UK "UNIQUE, NOT NULL"
    }

    colecciones {
        serial id PK "Clave primaria autoincremental"
        integer año_id FK "REFERENCES años(id)"
        integer temporada_id FK "REFERENCES temporadas(id)"
        varchar_200 nombre "NOT NULL"
        text descripcion "Opcional"
        date fecha_inicio "Opcional"
        date fecha_fin "Opcional"
        boolean activa "DEFAULT TRUE"
    }

    telas_temporadas {
        serial id PK "Clave primaria autoincremental"
        integer tela_id FK "REFERENCES telas(id)"
        integer temporada_id FK "REFERENCES temporadas(id)"
        integer año_id FK "REFERENCES años(id)"
        boolean activo "DEFAULT TRUE"
        numeric_10_2 stock_metros "CHECK >= 0"
        numeric_10_2 costo_por_metro "CHECK >= 0"
        date fecha_inicio "Opcional"
        date fecha_fin "Opcional"
    }

    prendas {
        serial id PK "Clave primaria autoincremental"
        varchar_200 nombre "NOT NULL"
        varchar_100 tipo "NOT NULL"
        numeric_10_2 precio_chamana "NOT NULL, CHECK >= 0"
        integer categoria_id FK "REFERENCES categorias(id)"
        integer diseno_id FK "REFERENCES disenos(id)"
        integer tela_id FK "REFERENCES telas(id)"
        integer coleccion_id FK "REFERENCES colecciones(id)"
        text descripcion "Opcional"
        timestamp fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
        boolean activa "DEFAULT TRUE"
        integer stock_inicial "DEFAULT 0, CHECK >= 0"
        integer stock_vendido "DEFAULT 0, CHECK >= 0"
        timestamp fecha_ultima_venta "Opcional"
        integer stock_disponible "GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED"
    }

    movimientos_inventario {
        serial id PK "Clave primaria autoincremental"
        integer prenda_id FK "REFERENCES prendas(id)"
        varchar_20 tipo "NOT NULL, CHECK IN ('entrada','salida','ajuste')"
        integer cantidad "NOT NULL"
        integer stock_anterior "NOT NULL, CHECK >= 0"
        integer stock_nuevo "NOT NULL, CHECK >= 0"
        integer pedido_id FK "REFERENCES pedidos(id), NULLABLE"
        text motivo "Opcional"
        timestamp fecha "DEFAULT CURRENT_TIMESTAMP, NOT NULL"
        varchar_100 usuario "Opcional"
    }
```

---

## Especificaciones Técnicas por Tabla

### Tabla: `clientes` (Modificada para Fase 2)

**Schema**: `public`  
**Propósito**: Información completa de clientes con datos de envío

| Columna          | Tipo           | Restricciones             | Descripción                    |
| ---------------- | -------------- | ------------------------- | ------------------------------ |
| `id`             | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental |
| `nombre`         | `VARCHAR(100)`  | NOT NULL                  | Nombre del cliente             |
| `apellido`       | `VARCHAR(100)`  | NOT NULL                  | Apellido del cliente           |
| `email`          | `VARCHAR(150)`  | UNIQUE, NOT NULL          | Email único del cliente        |
| `telefono`       | `VARCHAR(20)`   | Opcional                  | Teléfono de contacto           |
| `direccion`      | `TEXT`         | Opcional                  | Dirección de envío             |
| `ciudad`         | `VARCHAR(100)`  | Opcional                  | Ciudad de envío                |
| `codigo_postal`  | `VARCHAR(10)`   | Opcional                  | Código postal                  |
| `fecha_registro` | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP | Fecha de registro               |
| `activo`         | `BOOLEAN`       | DEFAULT TRUE              | Estado activo/inactivo         |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `activo` (para consultas de clientes activos)

**Cambios desde Fase 1**:

- ➕ Agregado: `direccion` (para envíos)
- ➕ Agregado: `ciudad` (para envíos)
- ➕ Agregado: `codigo_postal` (para envíos)
- 🔄 Modificado: `email` VARCHAR(255) → VARCHAR(150)

---

### Tabla: `pedidos` ⭐ NUEVA (Fase 2 - 2NF)

**Schema**: `public`  
**Propósito**: Órdenes de compra de clientes

| Columna           | Tipo            | Restricciones             | Descripción                              |
| ----------------- | --------------- | ------------------------- | ---------------------------------------- |
| `id`              | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `cliente_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a clientes(id)                |
| `fecha_pedido`    | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Fecha de creación del pedido    |
| `estado`          | `VARCHAR(20)`   | DEFAULT 'pendiente', CHECK | Estado: pendiente, completado, cancelado |
| `subtotal`        | `NUMERIC(10,2)`  | NOT NULL, CHECK >= 0      | Subtotal antes de descuentos             |
| `descuento`       | `NUMERIC(10,2)`  | DEFAULT 0, CHECK >= 0     | Descuento aplicado                       |
| `total`           | `NUMERIC(10,2)`  | NOT NULL, CHECK >= 0      | Total final del pedido                   |
| `notas`           | `TEXT`          | Opcional                  | Notas adicionales del pedido            |
| `fecha_completado`| `TIMESTAMP`     | Opcional                  | Fecha de completado                      |
| `fecha_cancelado` | `TIMESTAMP`     | Opcional                  | Fecha de cancelación                     |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `cliente_id` → `clientes(id)` ON DELETE RESTRICT
- INDEX: `cliente_id` (para búsquedas por cliente)
- INDEX: `estado` (para filtros por estado)
- INDEX: `fecha_pedido` (para ordenamiento temporal)
- INDEX: `fecha_completado` (para reportes)

**Restricciones**:

```sql
CHECK (estado IN ('pendiente', 'completado', 'cancelado'))
CHECK (subtotal >= 0)
CHECK (descuento >= 0)
CHECK (total >= 0)
CHECK (total = subtotal - descuento) -- Validación lógica
```

---

### Tabla: `pedidos_prendas` ⭐ NUEVA (Fase 2 - Junction Table)

**Schema**: `public`  
**Propósito**: Líneas de pedido (items individuales de cada pedido)

| Columna          | Tipo            | Restricciones    | Descripción                              |
| ---------------- | --------------- | ---------------- | ---------------------------------------- |
| `id`             | `SERIAL`        | PRIMARY KEY      | Clave primaria autoincremental           |
| `pedido_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a pedidos(id)                |
| `prenda_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a prendas(id)                |
| `cantidad`       | `INTEGER`       | NOT NULL, CHECK > 0 | Cantidad de prendas en el pedido        |
| `precio_unitario`| `NUMERIC(10,2)` | NOT NULL, CHECK >= 0 | Precio unitario al momento del pedido  |
| `subtotal`       | `NUMERIC(10,2)` | NOT NULL, CHECK >= 0 | Subtotal = cantidad × precio_unitario   |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `pedido_id` → `pedidos(id)` ON DELETE CASCADE
- FOREIGN KEY: `prenda_id` → `prendas(id)` ON DELETE RESTRICT
- UNIQUE: `(pedido_id, prenda_id)` (no duplicar prendas en mismo pedido)
- INDEX: `pedido_id` (para consultas de items por pedido)
- INDEX: `prenda_id` (para consultas de pedidos por prenda)

**Justificación 2NF**: Los atributos `cantidad`, `precio_unitario` y `subtotal` dependen completamente de la clave compuesta `(pedido_id, prenda_id)`, no solo de `pedido_id`. Esto elimina dependencias parciales.

**Restricciones**:

```sql
CHECK (cantidad > 0)
CHECK (precio_unitario >= 0)
CHECK (subtotal >= 0)
CHECK (subtotal = cantidad * precio_unitario) -- Validación lógica
```

---

### Tabla: `prendas` (Modificada para Fase 2)

**Schema**: `public`  
**Propósito**: Catálogo de productos con gestión de inventario

| Columna            | Tipo            | Restricciones             | Descripción                              |
| ------------------ | --------------- | ------------------------- | ---------------------------------------- |
| `id`               | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `nombre`           | `VARCHAR(200)`  | NOT NULL                  | Nombre completo de la prenda             |
| `tipo`             | `VARCHAR(100)`   | NOT NULL                  | Tipo de prenda                           |
| `precio_chamana`   | `NUMERIC(10,2)`  | NOT NULL, CHECK >= 0      | Precio de venta CHAMANA                  |
| `categoria_id`     | `INTEGER`       | FOREIGN KEY               | Referencia a categorias(id)              |
| `diseno_id`        | `INTEGER`       | FOREIGN KEY               | Referencia a disenos(id)                 |
| `tela_id`          | `INTEGER`       | FOREIGN KEY               | Referencia a telas(id)                   |
| `coleccion_id`     | `INTEGER`       | FOREIGN KEY               | Referencia a colecciones(id) - Opcional |
| `descripcion`      | `TEXT`          | Opcional                  | Descripción detallada                    |
| `fecha_creacion`   | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP | Fecha de creación                        |
| `activa`           | `BOOLEAN`       | DEFAULT TRUE              | Estado activo/inactivo                   |
| `stock_inicial`    | `INTEGER`       | DEFAULT 0, CHECK >= 0     | Stock inicial al crear prenda            |
| `stock_vendido`    | `INTEGER`       | DEFAULT 0, CHECK >= 0     | Cantidad vendida                         |
| `fecha_ultima_venta`| `TIMESTAMP`    | Opcional                  | Fecha de última venta                    |
| `stock_disponible` | `INTEGER`       | GENERATED ALWAYS AS (...) STORED | Stock calculado automáticamente |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `categoria_id` → `categorias(id)`
- FOREIGN KEY: `diseno_id` → `disenos(id)`
- FOREIGN KEY: `tela_id` → `telas(id)`
- FOREIGN KEY: `coleccion_id` → `colecciones(id)` ON DELETE SET NULL
- INDEX: `tipo` (para búsquedas por tipo)
- INDEX: `activa` (para filtrar prendas activas)
- INDEX: `stock_disponible` (para consultas de inventario)
- INDEX: `fecha_creacion` (para ordenamiento)

**Cambios desde Fase 1**:

- ➕ Agregado: `stock_inicial` (inventario base)
- ➕ Agregado: `stock_vendido` (cantidad vendida)
- ➕ Agregado: `stock_disponible` (columna generada)
- ➕ Agregado: `fecha_ultima_venta` (trazabilidad)
- ➖ Removido: `precio_arro` (simplificado)
- ➖ Removido: `nombre_completo` (ahora solo `nombre`)

**Columna Generada**:

```sql
stock_disponible INTEGER GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED
```

Esta columna se calcula automáticamente por PostgreSQL, garantizando consistencia sin necesidad de triggers.

---

### Tabla: `categorias`

**Schema**: `public`  
**Propósito**: Clasificar prendas por tipo

| Columna       | Tipo          | Restricciones    | Descripción                    |
| ------------- | ------------- | ---------------- | ------------------------------ |
| `id`          | `SERIAL`      | PRIMARY KEY      | Clave primaria autoincremental |
| `nombre`      | `VARCHAR(100)` | UNIQUE, NOT NULL | Nombre de la categoría         |
| `descripcion` | `TEXT`        | Opcional         | Descripción detallada          |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `nombre`

---

### Tabla: `disenos` (Modificada para Fase 2)

**Schema**: `public`  
**Propósito**: Diseños de prendas normalizados

| Columna         | Tipo           | Restricciones             | Descripción                    |
| --------------- | -------------- | ------------------------- | ------------------------------ |
| `id`            | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental |
| `nombre`        | `VARCHAR(150)`  | UNIQUE, NOT NULL          | Nombre del diseño              |
| `descripcion`   | `TEXT`         | Opcional                  | Descripción del diseño         |
| `fecha_creacion`| `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Fecha de creación              |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `nombre`

**Cambios desde Fase 1**:

- ➕ Agregado: `fecha_creacion` (trazabilidad)
- ➖ Removido: `activo` (simplificado)

---

### Tabla: `telas` (Modificada para Fase 2)

**Schema**: `public`  
**Propósito**: Tipos de tela normalizados

| Columna          | Tipo            | Restricciones    | Descripción                    |
| ---------------- | --------------- | ---------------- | ------------------------------ |
| `id`             | `SERIAL`        | PRIMARY KEY      | Clave primaria autoincremental |
| `nombre`         | `VARCHAR(150)`   | UNIQUE, NOT NULL | Nombre de la tela              |
| `tipo`           | `VARCHAR(50)`    | NOT NULL         | Tipo de tela                   |
| `descripcion`    | `TEXT`          | Opcional         | Descripción de la tela         |
| `costo_por_metro`| `NUMERIC(10,2)`  | CHECK >= 0       | Costo por metro de tela        |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `nombre`
- INDEX: `tipo` (para búsquedas por tipo)

**Cambios desde Fase 1**:

- ➕ Agregado: `costo_por_metro` (para cálculo de costos)
- ➖ Removido: `activo` (simplificado)

---

### Tabla: `años`

**Schema**: `public`  
**Propósito**: Años disponibles para colecciones

| Columna | Tipo      | Restricciones    | Descripción                    |
| ------- | --------- | ---------------- | ------------------------------ |
| `id`     | `SERIAL`  | PRIMARY KEY      | Clave primaria autoincremental |
| `año`    | `INTEGER`  | UNIQUE, NOT NULL | Año (ej: 2022, 2023, 2024)     |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `año`

---

### Tabla: `temporadas`

**Schema**: `public`  
**Propósito**: Temporadas del año para clasificar colecciones

| Columna  | Tipo          | Restricciones    | Descripción                    |
| -------- | ------------- | ---------------- | ------------------------------ |
| `id`      | `SERIAL`      | PRIMARY KEY      | Clave primaria autoincremental |
| `nombre`  | `VARCHAR(50)`  | UNIQUE, NOT NULL | Nombre de la temporada         |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `nombre`

---

### Tabla: `colecciones` (Modificada para Fase 2)

**Schema**: `public`  
**Propósito**: Colecciones estacionales (combinación de año + temporada)

| Columna        | Tipo           | Restricciones    | Descripción                    |
| -------------- | -------------- | ---------------- | ------------------------------ |
| `id`           | `SERIAL`       | PRIMARY KEY      | Clave primaria autoincremental |
| `año_id`       | `INTEGER`      | FOREIGN KEY      | Referencia a años(id)          |
| `temporada_id` | `INTEGER`      | FOREIGN KEY      | Referencia a temporadas(id)     |
| `nombre`       | `VARCHAR(200)`  | NOT NULL         | Nombre de la colección          |
| `descripcion`  | `TEXT`         | Opcional         | Descripción de la colección    |
| `fecha_inicio` | `DATE`         | Opcional         | Fecha de inicio                |
| `fecha_fin`    | `DATE`         | Opcional         | Fecha de fin                   |
| `activa`       | `BOOLEAN`      | DEFAULT TRUE     | Estado activo/inactivo         |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `año_id` → `años(id)`
- FOREIGN KEY: `temporada_id` → `temporadas(id)`
- INDEX: `año_id` (para consultas por año)
- INDEX: `temporada_id` (para consultas por temporada)
- INDEX: `activa` (para filtrar colecciones activas)

**Cambios desde Fase 1**:

- ➕ Agregado: `fecha_inicio` (rango de fechas)
- ➕ Agregado: `fecha_fin` (rango de fechas)
- ➖ Removido: UNIQUE constraint en `nombre` (permite nombres duplicados en diferentes años)

---

### Tabla: `telas_temporadas` ⭐ NUEVA (Fase 2 - Junction Table)

**Schema**: `public`  
**Propósito**: Disponibilidad de telas por temporada y año

| Columna          | Tipo            | Restricciones    | Descripción                              |
| ---------------- | --------------- | ---------------- | ---------------------------------------- |
| `id`             | `SERIAL`        | PRIMARY KEY      | Clave primaria autoincremental            |
| `tela_id`        | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a telas(id)                  |
| `temporada_id`   | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a temporadas(id)              |
| `año_id`         | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a años(id)                    |
| `activo`         | `BOOLEAN`       | DEFAULT TRUE     | Estado activo/inactivo                   |
| `stock_metros`   | `NUMERIC(10,2)`  | CHECK >= 0     | Stock disponible en metros                |
| `costo_por_metro`| `NUMERIC(10,2)` | CHECK >= 0     | Costo por metro en esta temporada/año    |
| `fecha_inicio`   | `DATE`         | Opcional         | Fecha de inicio de disponibilidad        |
| `fecha_fin`      | `DATE`         | Opcional         | Fecha de fin de disponibilidad           |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `tela_id` → `telas(id)` ON DELETE CASCADE
- FOREIGN KEY: `temporada_id` → `temporadas(id)` ON DELETE RESTRICT
- FOREIGN KEY: `año_id` → `años(id)` ON DELETE RESTRICT
- UNIQUE: `(tela_id, temporada_id, año_id)` (no duplicar asignaciones)
- INDEX: `tela_id` (para consultas por tela)
- INDEX: `temporada_id` (para consultas por temporada)
- INDEX: `año_id` (para consultas por año)
- INDEX: `activo` (para filtrar telas activas)

**Justificación 2NF**: Permite que una tela esté disponible en múltiples temporadas/años sin duplicar datos de la tela. Los atributos `stock_metros` y `costo_por_metro` dependen completamente de la clave compuesta `(tela_id, temporada_id, año_id)`.

---

### Tabla: `movimientos_inventario` ⭐ NUEVA (Fase 2)

**Schema**: `public`  
**Propósito**: Auditoría de cambios en stock (trazabilidad completa)

| Columna          | Tipo            | Restricciones             | Descripción                              |
| ---------------- | --------------- | ------------------------- | ---------------------------------------- |
| `id`             | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `prenda_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a prendas(id)                  |
| `tipo`           | `VARCHAR(20)`   | NOT NULL, CHECK           | Tipo: entrada, salida, ajuste             |
| `cantidad`       | `INTEGER`      | NOT NULL                  | Cantidad del movimiento                   |
| `stock_anterior` | `INTEGER`       | NOT NULL, CHECK >= 0      | Stock antes del movimiento                |
| `stock_nuevo`    | `INTEGER`       | NOT NULL, CHECK >= 0      | Stock después del movimiento             |
| `pedido_id`      | `INTEGER`       | FOREIGN KEY, NULLABLE     | Referencia a pedidos(id) - Opcional     |
| `motivo`         | `TEXT`          | Opcional                  | Motivo del movimiento                     |
| `fecha`          | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Fecha del movimiento          |
| `usuario`        | `VARCHAR(100)`  | Opcional                  | Usuario que realizó el movimiento        |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `prenda_id` → `prendas(id)` ON DELETE RESTRICT
- FOREIGN KEY: `pedido_id` → `pedidos(id)` ON DELETE SET NULL
- INDEX: `prenda_id` (para consultas por prenda)
- INDEX: `pedido_id` (para consultas por pedido)
- INDEX: `tipo` (para filtros por tipo)
- INDEX: `fecha` (para ordenamiento temporal)

**Restricciones**:

```sql
CHECK (tipo IN ('entrada', 'salida', 'ajuste'))
CHECK (stock_anterior >= 0)
CHECK (stock_nuevo >= 0)
CHECK (stock_nuevo = stock_anterior + cantidad) -- Para entrada
CHECK (stock_nuevo = stock_anterior - cantidad) -- Para salida
```

**Nota**: La relación con `pedidos` es opcional (NULLABLE) porque los ajustes manuales no están asociados a un pedido.

---

## Relaciones

### clientes → pedidos (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un cliente puede realizar 0 o muchos pedidos

- **Clave Foránea**: `pedidos.cliente_id` → `clientes.id`
- **Restricción**: Un pedido debe pertenecer a exactamente un cliente
- **Integridad Referencial**: ON DELETE RESTRICT

**Representación Visual**:

```
clientes (1) ||--o{ (N) pedidos
```

---

### pedidos → pedidos_prendas (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un pedido puede contener 1 o muchos items

- **Clave Foránea**: `pedidos_prendas.pedido_id` → `pedidos.id`
- **Restricción**: Un item debe pertenecer a exactamente un pedido
- **Integridad Referencial**: ON DELETE CASCADE (eliminar pedido elimina items)

**Representación Visual**:

```
pedidos (1) ||--o{ (N) pedidos_prendas
```

---

### prendas → pedidos_prendas (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una prenda puede estar en 0 o muchos items de pedidos

- **Clave Foránea**: `pedidos_prendas.prenda_id` → `prendas.id`
- **Restricción**: Un item debe referenciar exactamente una prenda
- **Integridad Referencial**: ON DELETE RESTRICT

**Representación Visual**:

```
prendas (1) ||--o{ (N) pedidos_prendas
```

---

### categorias → prendas (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una categoría puede contener 0 o muchas prendas

- **Clave Foránea**: `prendas.categoria_id` → `categorias.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### disenos → prendas (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un diseño puede usarse en 0 o muchas prendas

- **Clave Foránea**: `prendas.diseno_id` → `disenos.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### telas → prendas (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una tela puede usarse en 0 o muchas prendas

- **Clave Foránea**: `prendas.tela_id` → `telas.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### colecciones → prendas (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una colección puede contener 0 o muchas prendas

- **Clave Foránea**: `prendas.coleccion_id` → `colecciones.id`
- **Integridad Referencial**: ON DELETE SET NULL

---

### años → colecciones (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un año puede tener 0 o muchas colecciones

- **Clave Foránea**: `colecciones.año_id` → `años.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### temporadas → colecciones (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una temporada puede tener 0 o muchas colecciones

- **Clave Foránea**: `colecciones.temporada_id` → `temporadas.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### telas → telas_temporadas (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una tela puede estar disponible en 0 o muchas temporadas/años

- **Clave Foránea**: `telas_temporadas.tela_id` → `telas.id`
- **Integridad Referencial**: ON DELETE CASCADE

---

### temporadas → telas_temporadas (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una temporada puede tener 0 o muchas telas asociadas

- **Clave Foránea**: `telas_temporadas.temporada_id` → `temporadas.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### años → telas_temporadas (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un año puede tener 0 o muchas telas asociadas

- **Clave Foránea**: `telas_temporadas.año_id` → `años.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### prendas → movimientos_inventario (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una prenda puede tener 0 o muchos movimientos

- **Clave Foránea**: `movimientos_inventario.prenda_id` → `prendas.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### pedidos → movimientos_inventario (0:1) ⭐ NUEVA

**Tipo**: Opcional (Uno a Muchos)  
**Cardinalidad**: Un pedido puede generar 0 o muchos movimientos (opcional)

- **Clave Foránea**: `movimientos_inventario.pedido_id` → `pedidos.id`
- **Restricción**: Opcional (NULLABLE) - ajustes manuales no tienen pedido
- **Integridad Referencial**: ON DELETE SET NULL

**Representación Visual**:

```
pedidos (0) o--o{ (N) movimientos_inventario
```

---

## Restricciones de Integridad

### CHECK Constraints

```sql
-- Estados válidos
CHECK (estado IN ('pendiente', 'completado', 'cancelado')) -- en pedidos
CHECK (tipo IN ('entrada', 'salida', 'ajuste')) -- en movimientos_inventario

-- Valores no negativos
CHECK (precio_chamana >= 0) -- en prendas
CHECK (subtotal >= 0) -- en pedidos y pedidos_prendas
CHECK (descuento >= 0) -- en pedidos
CHECK (total >= 0) -- en pedidos
CHECK (cantidad > 0) -- en pedidos_prendas
CHECK (precio_unitario >= 0) -- en pedidos_prendas
CHECK (stock_inicial >= 0) -- en prendas
CHECK (stock_vendido >= 0) -- en prendas
CHECK (stock_anterior >= 0) -- en movimientos_inventario
CHECK (stock_nuevo >= 0) -- en movimientos_inventario
CHECK (stock_metros >= 0) -- en telas_temporadas
CHECK (costo_por_metro >= 0) -- en telas y telas_temporadas
```

### UNIQUE Constraints

```sql
-- Email único por cliente
UNIQUE (email) -- en tabla clientes

-- Nombre único por categoría
UNIQUE (nombre) -- en tabla categorias

-- Nombre único por diseño
UNIQUE (nombre) -- en tabla disenos

-- Nombre único por tela
UNIQUE (nombre) -- en tabla telas

-- Año único
UNIQUE (año) -- en tabla años

-- Nombre único por temporada
UNIQUE (nombre) -- en tabla temporadas

-- No duplicar prendas en mismo pedido
UNIQUE (pedido_id, prenda_id) -- en tabla pedidos_prendas

-- No duplicar asignaciones tela-temporada-año
UNIQUE (tela_id, temporada_id, año_id) -- en tabla telas_temporadas
```

### DEFAULT Values

```sql
-- Valores por defecto
fecha_registro: CURRENT_TIMESTAMP
fecha_pedido: CURRENT_TIMESTAMP
fecha_creacion: CURRENT_TIMESTAMP
fecha: CURRENT_TIMESTAMP
activo/activa: TRUE
estado: 'pendiente'
descuento: 0
stock_inicial: 0
stock_vendido: 0
```

### FOREIGN KEY Constraints

```sql
-- Relación clientes → pedidos
FOREIGN KEY (cliente_id) 
  REFERENCES clientes(id)
  ON DELETE RESTRICT

-- Relación pedidos → pedidos_prendas
FOREIGN KEY (pedido_id) 
  REFERENCES pedidos(id)
  ON DELETE CASCADE

-- Relación prendas → pedidos_prendas
FOREIGN KEY (prenda_id) 
  REFERENCES prendas(id)
  ON DELETE RESTRICT

-- Relación categorias → prendas
FOREIGN KEY (categoria_id) 
  REFERENCES categorias(id)
  ON DELETE RESTRICT

-- Relación disenos → prendas
FOREIGN KEY (diseno_id) 
  REFERENCES disenos(id)
  ON DELETE RESTRICT

-- Relación telas → prendas
FOREIGN KEY (tela_id) 
  REFERENCES telas(id)
  ON DELETE RESTRICT

-- Relación colecciones → prendas
FOREIGN KEY (coleccion_id) 
  REFERENCES colecciones(id)
  ON DELETE SET NULL

-- Relación años → colecciones
FOREIGN KEY (año_id) 
  REFERENCES años(id)
  ON DELETE RESTRICT

-- Relación temporadas → colecciones
FOREIGN KEY (temporada_id) 
  REFERENCES temporadas(id)
  ON DELETE RESTRICT

-- Relación telas → telas_temporadas
FOREIGN KEY (tela_id) 
  REFERENCES telas(id)
  ON DELETE CASCADE

-- Relación temporadas → telas_temporadas
FOREIGN KEY (temporada_id) 
  REFERENCES temporadas(id)
  ON DELETE RESTRICT

-- Relación años → telas_temporadas
FOREIGN KEY (año_id) 
  REFERENCES años(id)
  ON DELETE RESTRICT

-- Relación prendas → movimientos_inventario
FOREIGN KEY (prenda_id) 
  REFERENCES prendas(id)
  ON DELETE RESTRICT

-- Relación pedidos → movimientos_inventario (opcional)
FOREIGN KEY (pedido_id) 
  REFERENCES pedidos(id)
  ON DELETE SET NULL
```

---

## Índices Adicionales

```sql
-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_activo ON clientes(activo);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_completado ON pedidos(fecha_completado);
CREATE INDEX idx_pedidos_prendas_pedido ON pedidos_prendas(pedido_id);
CREATE INDEX idx_pedidos_prendas_prenda ON pedidos_prendas(prenda_id);
CREATE INDEX idx_prendas_categoria ON prendas(categoria_id);
CREATE INDEX idx_prendas_diseno ON prendas(diseno_id);
CREATE INDEX idx_prendas_tela ON prendas(tela_id);
CREATE INDEX idx_prendas_coleccion ON prendas(coleccion_id);
CREATE INDEX idx_prendas_activa ON prendas(activa);
CREATE INDEX idx_prendas_stock ON prendas(stock_disponible);
CREATE INDEX idx_colecciones_año ON colecciones(año_id);
CREATE INDEX idx_colecciones_temporada ON colecciones(temporada_id);
CREATE INDEX idx_telas_temporadas_tela ON telas_temporadas(tela_id);
CREATE INDEX idx_telas_temporadas_temporada ON telas_temporadas(temporada_id);
CREATE INDEX idx_telas_temporadas_año ON telas_temporadas(año_id);
CREATE INDEX idx_movimientos_prenda ON movimientos_inventario(prenda_id);
CREATE INDEX idx_movimientos_pedido ON movimientos_inventario(pedido_id);
CREATE INDEX idx_movimientos_tipo ON movimientos_inventario(tipo);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
```

---

## Estadísticas del Modelo

| Tabla                  | Columnas | Índices | Relaciones        | Estado             |
| ---------------------- | -------- | ------- | ----------------- | ------------------ |
| `clientes`             | 10       | 3       | 1 (salida)        | 🔄 Modificada (2NF) |
| `pedidos`              | 10       | 5       | 3 (1 entrada, 2 salida) | ⭐ Nueva (2NF) |
| `pedidos_prendas`      | 6        | 3       | 2 (entrada)       | ⭐ Nueva (2NF)     |
| `categorias`           | 3        | 2       | 1 (salida)        | ✅ Sin cambios     |
| `disenos`              | 4        | 2       | 1 (salida)        | 🔄 Modificada (2NF) |
| `telas`                | 5        | 3       | 2 (1 salida directa, 1 salida indirecta) | 🔄 Modificada (2NF) |
| `años`                 | 2        | 2       | 2 (salida)        | ✅ Sin cambios     |
| `temporadas`           | 2        | 2       | 2 (salida)        | ✅ Sin cambios     |
| `colecciones`          | 8        | 4       | 3 (2 entrada, 1 salida) | 🔄 Modificada (2NF) |
| `telas_temporadas`     | 9        | 6       | 3 (entrada)       | ⭐ Nueva (2NF)     |
| `prendas`              | 15       | 8       | 5 (4 entrada, 1 salida) | 🔄 Modificada (2NF) |
| `movimientos_inventario` | 10    | 5       | 2 (entrada)       | ⭐ Nueva (2NF)     |

**Total**: 12 tablas, 88 columnas, 47 índices, 14 relaciones

---

## Normalización 2NF Aplicada

### Antes (Fase 1 - 1NF)

```
pedidos {
  cliente_id,
  prenda_id,  -- ❌ Dependencia parcial
  cantidad,
  precio_unitario,
  subtotal
}
```

**Problemas**:

- ❌ Dependencias parciales: `cantidad` y `precio_unitario` dependen de `(cliente_id, prenda_id)`, no solo de `cliente_id`
- ❌ Redundancia: Múltiples prendas en un pedido requieren múltiples filas con datos del pedido repetidos

### Después (Fase 2 - 2NF)

```
pedidos {
  id,
  cliente_id,
  fecha_pedido,
  estado,
  subtotal,
  descuento,
  total
}

pedidos_prendas {
  id,
  pedido_id,      -- ✅ Dependencia completa
  prenda_id,      -- ✅ Dependencia completa
  cantidad,       -- ✅ Depende de (pedido_id, prenda_id)
  precio_unitario, -- ✅ Depende de (pedido_id, prenda_id)
  subtotal        -- ✅ Depende de (pedido_id, prenda_id)
}
```

**Beneficios**:

- ✅ Eliminación de dependencias parciales
- ✅ Reducción de redundancia (datos del pedido almacenados una vez)
- ✅ Facilita consultas (items agrupados por pedido)
- ✅ Mejora integridad (foreign keys garantizan consistencia)

### Transformación de Datos

**Ejemplo de migración**:

```sql
-- Fase 1 (hipotético - no implementado)
-- No existía tabla pedidos

-- Fase 2 (normalizado)
INSERT INTO pedidos (cliente_id, fecha_pedido, estado, subtotal, total) 
VALUES (1, NOW(), 'pendiente', 50000, 50000);

INSERT INTO pedidos_prendas (pedido_id, prenda_id, cantidad, precio_unitario, subtotal) 
VALUES 
  (1, 5, 2, 25000, 50000),
  (1, 8, 1, 30000, 30000);
```

---

## Características Avanzadas

### 1. Columna Generada (PostgreSQL 12+)

```sql
stock_disponible INTEGER GENERATED ALWAYS AS (stock_inicial - stock_vendido) STORED
```

- **Ventaja**: Cálculo automático, sin posibilidad de desincronización
- **Performance**: Indexable como columna normal
- **Consistencia**: Garantizada por el motor de base de datos

### 2. CHECK Constraints para Integridad

```sql
CHECK (estado IN ('pendiente', 'completado', 'cancelado'))
CHECK (tipo IN ('entrada', 'salida', 'ajuste'))
CHECK (cantidad > 0)
CHECK (subtotal >= 0)
```

- **Ventaja**: Validación a nivel de base de datos
- **Seguridad**: Previene datos inválidos incluso si la aplicación tiene bugs

### 3. ON DELETE Policies

- **RESTRICT**: Previene eliminación si hay referencias (protege integridad)
- **CASCADE**: Elimina registros dependientes (útil para datos transaccionales)
- **SET NULL**: Limpia referencia sin eliminar (permite datos huérfanos controlados)

### 4. Trazabilidad Completa

- **`movimientos_inventario`**: Registra todos los cambios de stock
- **`fecha_ultima_venta`**: Tracking de ventas por prenda
- **`fecha_completado` / `fecha_cancelado`**: Tracking de estados de pedidos

---

## Notas de Diseño

### ✅ Normalización Completa a 2NF

Este modelo está **completamente normalizado a 2NF**:

1. **Eliminación de Dependencias Parciales**:
   - `pedidos_prendas` separa items del pedido
   - `telas_temporadas` separa disponibilidad estacional

2. **Gestión de Pedidos**:
   - Tabla `pedidos` para información del pedido
   - Tabla `pedidos_prendas` para items individuales
   - Relación N:M entre pedidos y prendas

3. **Gestión de Inventario**:
   - Columna generada `stock_disponible` para consistencia
   - Tabla `movimientos_inventario` para auditoría completa
   - Tracking de stock inicial vs vendido

4. **Gestión de Telas Temporales**:
   - Tabla `telas_temporadas` para disponibilidad estacional
   - Permite diferentes costos por temporada/año
   - Tracking de stock de telas por temporada

### Forma Normal Actual

- **Estado**: ✅ 2NF (completa)
- **Características**: Sin dependencias parciales, sin redundancia funcional
- **Próximo objetivo**: 3NF (eliminar dependencias transitivas)

---

**Base de Datos**: `chamana_db_fase2`  
**SGBD**: PostgreSQL 12+  
**Schema**: `public`  
**Forma Normal**: ✅ 2NF (completa)  
**Estado**: ✅ Implementado - Gestión completa de pedidos e inventario

