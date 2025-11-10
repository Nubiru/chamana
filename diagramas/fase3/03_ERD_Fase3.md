# ERD - Entity-Relationship Diagram (Físico/Técnico)

## Fase 3: Tercera Forma Normal (3NF)

**CHAMANA E-commerce - Modelo Físico PostgreSQL con Vistas, Procedimientos y Triggers**

---

## Diagrama Entidad-Relación

```mermaid
erDiagram
    clientes ||--o{ pedidos : "realiza (1:N)"
    clientes ||--o{ direcciones : "tiene (1:N)"
    pedidos ||--o{ pedidos_prendas : "contiene (1:N)"
    pedidos }o--|| estados_pedido : "tiene_estado (N:1)"
    pedidos }o--o| metodos_pago : "pagado_con (N:1)"
    pedidos }o--o| direcciones : "envio_a (N:1)"
    pedidos ||--o{ historial_estados_pedido : "registra_cambios (1:N)"
    estados_pedido ||--o{ historial_estados_pedido : "estado_anterior (1:N)"
    estados_pedido ||--o{ historial_estados_pedido : "estado_nuevo (1:N)"
    prendas ||--o{ pedidos_prendas : "incluida_en (1:N)"
    prendas }o--|| tipos_prenda : "es_de_tipo (N:1)"
    prendas }o--|| categorias : "pertenece_a (N:1)"
    prendas }o--|| disenos : "usa_diseno (N:1)"
    prendas }o--|| telas : "usa_tela (N:1)"
    prendas }o--o| colecciones : "pertenece_a (N:1)"
    prendas ||--o{ movimientos_inventario : "tiene_movimientos (1:N)"
    categorias ||--o{ prendas : "clasifica (1:N)"
    disenos }o--o| colecciones : "pertenece_a (N:1)"
    telas ||--o{ prendas : "material (1:N)"
    telas ||--o{ telas_proveedores : "suministrada_por (1:N)"
    telas ||--o{ telas_temporadas : "disponible_en (1:N)"
    proveedores ||--o{ telas_proveedores : "suministra (1:N)"
    años ||--o{ colecciones : "tiene (1:N)"
    años ||--o{ telas_temporadas : "tiene (1:N)"
    temporadas ||--o{ colecciones : "tiene (1:N)"
    temporadas ||--o{ telas_temporadas : "tiene (1:N)"
    pedidos o--o{ movimientos_inventario : "genera (0:N)"

    clientes {
        serial id PK "Clave primaria autoincremental"
        varchar_100 nombre "NOT NULL"
        varchar_100 apellido "NOT NULL"
        varchar_150 email UK "UNIQUE, NOT NULL"
        varchar_20 telefono "Opcional"
        timestamp fecha_registro "DEFAULT CURRENT_TIMESTAMP"
        boolean activo "DEFAULT TRUE"
    }

    direcciones {
        serial id PK "Clave primaria autoincremental"
        integer cliente_id FK "REFERENCES clientes(id)"
        varchar_20 tipo "NOT NULL - 'envio', 'facturacion', 'otro'"
        text direccion "NOT NULL"
        varchar_100 ciudad "NOT NULL"
        varchar_100 estado "Opcional"
        varchar_10 codigo_postal "Opcional"
        varchar_50 pais "DEFAULT 'México'"
        boolean predeterminada "DEFAULT FALSE"
        boolean activa "DEFAULT TRUE"
        timestamp fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
    }

    pedidos {
        serial id PK "Clave primaria autoincremental"
        integer cliente_id FK "REFERENCES clientes(id), NOT NULL"
        integer estado_id FK "REFERENCES estados_pedido(id), NOT NULL"
        integer metodo_pago_id FK "REFERENCES metodos_pago(id), NULLABLE"
        integer direccion_envio_id FK "REFERENCES direcciones(id), NULLABLE"
        timestamp fecha_pedido "DEFAULT CURRENT_TIMESTAMP, NOT NULL"
        numeric_10_2 subtotal "NOT NULL, CHECK >= 0"
        numeric_10_2 descuento "DEFAULT 0, CHECK >= 0"
        numeric_10_2 total "NOT NULL, CHECK >= 0"
        text notas "Opcional"
        timestamp fecha_completado "Opcional"
        timestamp fecha_cancelado "Opcional"
    }

    estados_pedido {
        serial id PK "Clave primaria autoincremental"
        varchar_20 codigo UK "UNIQUE, NOT NULL"
        varchar_50 nombre "NOT NULL"
        text descripcion "Opcional"
        boolean es_inicial "DEFAULT FALSE"
        boolean es_final "DEFAULT FALSE"
        boolean permite_edicion "DEFAULT TRUE"
        boolean permite_cancelacion "DEFAULT FALSE"
        varchar_7 color_hex "Opcional - Color para UI"
        integer orden_workflow "NOT NULL - Orden en flujo"
    }

    metodos_pago {
        serial id PK "Clave primaria autoincremental"
        varchar_20 codigo UK "UNIQUE, NOT NULL"
        varchar_50 nombre "NOT NULL"
        boolean requiere_referencia "DEFAULT FALSE"
        numeric_5_2 comision_porcentaje "DEFAULT 0, CHECK >= 0 AND <= 100"
        integer dias_procesamiento "DEFAULT 0, CHECK >= 0"
        boolean activo "DEFAULT TRUE"
        text descripcion "Opcional"
    }

    historial_estados_pedido {
        serial id PK "Clave primaria autoincremental"
        integer pedido_id FK "REFERENCES pedidos(id), NOT NULL"
        integer estado_anterior_id FK "REFERENCES estados_pedido(id), NULLABLE"
        integer estado_nuevo_id FK "REFERENCES estados_pedido(id), NOT NULL"
        timestamp fecha_cambio "DEFAULT CURRENT_TIMESTAMP, NOT NULL"
        varchar_100 usuario_cambio "Opcional"
        text notas "Opcional"
        boolean automatico "DEFAULT FALSE - Indica si fue cambio automático"
    }

    pedidos_prendas {
        serial id PK "Clave primaria autoincremental"
        integer pedido_id FK "REFERENCES pedidos(id), NOT NULL"
        integer prenda_id FK "REFERENCES prendas(id), NOT NULL"
        integer cantidad "NOT NULL, CHECK > 0"
        numeric_10_2 precio_unitario "NOT NULL, CHECK >= 0"
        numeric_10_2 subtotal "NOT NULL, CHECK >= 0"
    }

    categorias {
        serial id PK "Clave primaria autoincremental"
        varchar_100 nombre UK "UNIQUE, NOT NULL"
        text descripcion "Opcional"
    }

    tipos_prenda {
        serial id PK "Clave primaria autoincremental"
        varchar_50 nombre UK "UNIQUE, NOT NULL"
        varchar_50 subcategoria "Opcional"
        text cuidados_lavado "Opcional"
        varchar_20 temperatura_lavado "Opcional"
        boolean puede_planchar "DEFAULT TRUE"
        boolean puede_secar_maquina "DEFAULT TRUE"
        varchar_20 temporada_recomendada "Opcional"
        varchar_100 ocasion_uso "Opcional"
        text descripcion "Opcional"
    }

    disenos {
        serial id PK "Clave primaria autoincremental"
        varchar_150 nombre UK "UNIQUE, NOT NULL"
        varchar_100 tipo "Opcional"
        varchar_200 detalle "Opcional"
        text descripcion "Opcional"
        integer coleccion_id FK "REFERENCES colecciones(id), NULLABLE"
        timestamp fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
    }

    telas {
        serial id PK "Clave primaria autoincremental"
        varchar_50 nombre UK "UNIQUE, NOT NULL"
        varchar_50 tipo "NOT NULL"
        text descripcion "Opcional"
        numeric_10_2 costo_por_metro "CHECK >= 0"
    }

    proveedores {
        serial id PK "Clave primaria autoincremental"
        varchar_100 nombre "NOT NULL"
        varchar_13 rfc UK "UNIQUE, Opcional"
        varchar_20 telefono "Opcional"
        varchar_100 email "Opcional"
        text direccion "Opcional"
        varchar_100 ciudad "Opcional"
        varchar_50 pais "DEFAULT 'México'"
        integer dias_entrega_promedio "DEFAULT 7, CHECK >= 0"
        numeric_3_2 calificacion "CHECK >= 0 AND <= 5"
        boolean activo "DEFAULT TRUE"
        timestamp fecha_registro "DEFAULT CURRENT_TIMESTAMP"
        text notas "Opcional"
    }

    telas_proveedores {
        serial id PK "Clave primaria autoincremental"
        integer tela_id FK "REFERENCES telas(id), NOT NULL"
        integer proveedor_id FK "REFERENCES proveedores(id), NOT NULL"
        numeric_10_2 precio_metro "NOT NULL, CHECK >= 0"
        integer tiempo_entrega_dias "DEFAULT 7, CHECK >= 0"
        numeric_10_2 cantidad_minima "DEFAULT 0, CHECK >= 0"
        varchar_3 moneda "DEFAULT 'MXN'"
        timestamp fecha_ultimo_precio "DEFAULT CURRENT_TIMESTAMP"
        boolean activa "DEFAULT TRUE"
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
        integer año_id FK "REFERENCES años(id), NOT NULL"
        integer temporada_id FK "REFERENCES temporadas(id), NOT NULL"
        varchar_200 nombre "NOT NULL"
        text descripcion "Opcional"
        date fecha_inicio "Opcional"
        date fecha_fin "Opcional"
        boolean activo "DEFAULT TRUE"
    }

    telas_temporadas {
        serial id PK "Clave primaria autoincremental"
        integer tela_id FK "REFERENCES telas(id), NOT NULL"
        integer temporada_id FK "REFERENCES temporadas(id), NOT NULL"
        integer año_id FK "REFERENCES años(id), NOT NULL"
        boolean activo "DEFAULT TRUE"
        numeric_10_2 stock_metros "CHECK >= 0"
        numeric_10_2 costo_por_metro "CHECK >= 0"
        date fecha_inicio "Opcional"
        date fecha_fin "Opcional"
    }

    prendas {
        serial id PK "Clave primaria autoincremental"
        varchar_200 nombre "NOT NULL"
        integer tipo_prenda_id FK "REFERENCES tipos_prenda(id), NOT NULL"
        numeric_10_2 precio_chamana "NOT NULL, CHECK >= 0"
        integer categoria_id FK "REFERENCES categorias(id), NOT NULL"
        integer diseno_id FK "REFERENCES disenos(id), NOT NULL"
        integer tela_id FK "REFERENCES telas(id), NOT NULL"
        integer coleccion_id FK "REFERENCES colecciones(id), NULLABLE"
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
        integer prenda_id FK "REFERENCES prendas(id), NOT NULL"
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

### Tabla: `clientes` (Modificada para Fase 3)

**Schema**: `public`  
**Propósito**: Información básica de clientes (direcciones separadas para 3NF)

| Columna          | Tipo           | Restricciones             | Descripción                    |
| ---------------- | -------------- | ------------------------- | ------------------------------ |
| `id`             | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental |
| `nombre`         | `VARCHAR(100)`  | NOT NULL                  | Nombre del cliente             |
| `apellido`       | `VARCHAR(100)`  | NOT NULL                  | Apellido del cliente           |
| `email`          | `VARCHAR(150)`  | UNIQUE, NOT NULL          | Email único del cliente        |
| `telefono`       | `VARCHAR(20)`   | Opcional                  | Teléfono de contacto           |
| `fecha_registro` | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP | Fecha de registro               |
| `activo`         | `BOOLEAN`       | DEFAULT TRUE              | Estado activo/inactivo         |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `activo` (para consultas de clientes activos)

**Cambios desde Fase 2**:

- ➖ Removido: `direccion`, `ciudad`, `codigo_postal` (movidos a tabla `direcciones` para 3NF)
- ✅ **3NF**: Direcciones ahora en tabla separada, eliminando dependencias transitivas

---

### Tabla: `direcciones` ⭐ NUEVA (Fase 3 - 3NF)

**Schema**: `public`  
**Propósito**: Direcciones de clientes (normalizadas para 3NF)

| Columna          | Tipo           | Restricciones             | Descripción                              |
| ---------------- | -------------- | ------------------------- | ---------------------------------------- |
| `id`             | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental           |
| `cliente_id`     | `INTEGER`      | FOREIGN KEY, NOT NULL     | Referencia a clientes(id)                |
| `tipo`           | `VARCHAR(20)`   | NOT NULL                  | Tipo: 'envio', 'facturacion', 'otro'     |
| `direccion`      | `TEXT`         | NOT NULL                  | Dirección completa                       |
| `ciudad`         | `VARCHAR(100)`  | NOT NULL                  | Ciudad                                   |
| `estado`         | `VARCHAR(100)`  | Opcional                  | Estado/Provincia                         |
| `codigo_postal`  | `VARCHAR(10)`   | Opcional                  | Código postal                          |
| `pais`           | `VARCHAR(50)`   | DEFAULT 'México'          | País                                     |
| `predeterminada` | `BOOLEAN`       | DEFAULT FALSE             | Dirección predeterminada del cliente     |
| `activa`         | `BOOLEAN`       | DEFAULT TRUE              | Estado activo/inactivo                   |
| `fecha_creacion` | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP | Fecha de creación                        |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `cliente_id` → `clientes(id)` ON DELETE CASCADE
- INDEX: `cliente_id` (para consultas por cliente)
- INDEX: `predeterminada` (para encontrar dirección predeterminada)
- INDEX: `activa` (para filtrar direcciones activas)

**Justificación 3NF**: Elimina dependencia transitiva. Las direcciones no dependen funcionalmente solo de `cliente_id`, sino que son entidades independientes que pueden tener múltiples valores por cliente.

---

### Tabla: `pedidos` (Modificada para Fase 3)

**Schema**: `public`  
**Propósito**: Órdenes de compra con estados normalizados

| Columna            | Tipo            | Restricciones             | Descripción                              |
| ------------------ | --------------- | ------------------------- | ---------------------------------------- |
| `id`               | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `cliente_id`       | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a clientes(id)                |
| `estado_id`        | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a estados_pedido(id)          |
| `metodo_pago_id`   | `INTEGER`       | FOREIGN KEY, NULLABLE     | Referencia a metodos_pago(id)            |
| `direccion_envio_id`| `INTEGER`      | FOREIGN KEY, NULLABLE     | Referencia a direcciones(id)             |
| `fecha_pedido`     | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Fecha de creación del pedido    |
| `subtotal`         | `NUMERIC(10,2)`  | NOT NULL, CHECK >= 0      | Subtotal antes de descuentos             |
| `descuento`        | `NUMERIC(10,2)`  | DEFAULT 0, CHECK >= 0     | Descuento aplicado                       |
| `total`            | `NUMERIC(10,2)`  | NOT NULL, CHECK >= 0      | Total final del pedido                   |
| `notas`            | `TEXT`          | Opcional                  | Notas adicionales del pedido            |
| `fecha_completado` | `TIMESTAMP`     | Opcional                  | Fecha de completado                      |
| `fecha_cancelado`  | `TIMESTAMP`     | Opcional                  | Fecha de cancelación                     |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `cliente_id` → `clientes(id)` ON DELETE RESTRICT
- FOREIGN KEY: `estado_id` → `estados_pedido(id)` ON DELETE RESTRICT
- FOREIGN KEY: `metodo_pago_id` → `metodos_pago(id)` ON DELETE SET NULL
- FOREIGN KEY: `direccion_envio_id` → `direcciones(id)` ON DELETE SET NULL
- INDEX: `cliente_id` (para búsquedas por cliente)
- INDEX: `estado_id` (para filtros por estado)
- INDEX: `fecha_pedido` (para ordenamiento temporal)
- INDEX: `fecha_completado` (para reportes)

**Cambios desde Fase 2**:

- ➕ Agregado: `estado_id` (FK) - Reemplaza campo `estado` VARCHAR para 3NF
- ➕ Agregado: `metodo_pago_id` (FK) - Normaliza métodos de pago
- ➕ Agregado: `direccion_envio_id` (FK) - Referencia a direcciones normalizadas
- ➖ Removido: `estado` VARCHAR(20) (ahora en tabla `estados_pedido`)

**Justificación 3NF**: El estado del pedido ahora está normalizado, eliminando dependencias transitivas y permitiendo gestión centralizada de estados.

---

### Tabla: `estados_pedido` ⭐ NUEVA (Fase 3 - 3NF)

**Schema**: `public`  
**Propósito**: Estados de pedido normalizados con workflow

| Columna              | Tipo           | Restricciones    | Descripción                              |
| -------------------- | -------------- | ---------------- | ---------------------------------------- |
| `id`                 | `SERIAL`       | PRIMARY KEY      | Clave primaria autoincremental           |
| `codigo`             | `VARCHAR(20)`   | UNIQUE, NOT NULL | Código único del estado (ej: 'pendiente') |
| `nombre`             | `VARCHAR(50)`   | NOT NULL         | Nombre del estado                        |
| `descripcion`        | `TEXT`         | Opcional         | Descripción del estado                    |
| `es_inicial`         | `BOOLEAN`       | DEFAULT FALSE    | Indica si es estado inicial              |
| `es_final`           | `BOOLEAN`       | DEFAULT FALSE    | Indica si es estado final                |
| `permite_edicion`    | `BOOLEAN`       | DEFAULT TRUE     | Permite editar pedido en este estado     |
| `permite_cancelacion`| `BOOLEAN`       | DEFAULT FALSE    | Permite cancelar pedido en este estado   |
| `color_hex`          | `VARCHAR(7)`   | Opcional         | Color para UI (ej: '#FF5733')            |
| `orden_workflow`     | `INTEGER`      | NOT NULL         | Orden en el flujo de trabajo             |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `codigo`
- INDEX: `orden_workflow` (para ordenamiento del flujo)
- INDEX: `es_inicial` (para encontrar estado inicial)
- INDEX: `es_final` (para encontrar estados finales)

**Valores de ejemplo**:
- `pendiente` (es_inicial: true, orden: 1)
- `confirmado` (orden: 2)
- `en_preparacion` (orden: 3)
- `enviado` (orden: 4)
- `completado` (es_final: true, orden: 5)
- `cancelado` (es_final: true, permite_cancelacion: true, orden: 99)

**Justificación 3NF**: Centraliza la gestión de estados, eliminando redundancia y permitiendo configuración flexible del workflow.

---

### Tabla: `metodos_pago` ⭐ NUEVA (Fase 3 - 3NF)

**Schema**: `public`  
**Propósito**: Métodos de pago normalizados

| Columna              | Tipo            | Restricciones             | Descripción                              |
| -------------------- | --------------- | ------------------------- | ---------------------------------------- |
| `id`                 | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `codigo`             | `VARCHAR(20)`    | UNIQUE, NOT NULL          | Código único (ej: 'efectivo', 'transferencia') |
| `nombre`             | `VARCHAR(50)`    | NOT NULL                  | Nombre del método de pago                |
| `requiere_referencia`| `BOOLEAN`        | DEFAULT FALSE             | Requiere número de referencia            |
| `comision_porcentaje`| `NUMERIC(5,2)`   | DEFAULT 0, CHECK 0-100    | Porcentaje de comisión                   |
| `dias_procesamiento` | `INTEGER`        | DEFAULT 0, CHECK >= 0    | Días para procesar el pago               |
| `activo`             | `BOOLEAN`        | DEFAULT TRUE              | Estado activo/inactivo                   |
| `descripcion`        | `TEXT`          | Opcional                  | Descripción del método                    |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `codigo`
- INDEX: `activo` (para filtrar métodos activos)

**Valores de ejemplo**:
- `efectivo` (comision: 0, dias: 0)
- `transferencia` (requiere_referencia: true, comision: 0, dias: 1)
- `tarjeta_credito` (comision: 3.5, dias: 2)
- `paypal` (comision: 4.0, dias: 3)

**Justificación 3NF**: Normaliza información de métodos de pago, eliminando redundancia y permitiendo configuración centralizada.

---

### Tabla: `historial_estados_pedido` ⭐ NUEVA (Fase 3)

**Schema**: `public`  
**Propósito**: Auditoría completa de cambios de estado en pedidos

| Columna            | Tipo           | Restricciones             | Descripción                              |
| ------------------ | -------------- | ------------------------- | ---------------------------------------- |
| `id`               | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental           |
| `pedido_id`        | `INTEGER`      | FOREIGN KEY, NOT NULL     | Referencia a pedidos(id)                 |
| `estado_anterior_id`| `INTEGER`     | FOREIGN KEY, NULLABLE     | Referencia a estados_pedido(id)          |
| `estado_nuevo_id`  | `INTEGER`      | FOREIGN KEY, NOT NULL     | Referencia a estados_pedido(id)          |
| `fecha_cambio`     | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Fecha del cambio de estado    |
| `usuario_cambio`   | `VARCHAR(100)` | Opcional                  | Usuario que realizó el cambio            |
| `notas`            | `TEXT`         | Opcional                  | Notas sobre el cambio                    |
| `automatico`       | `BOOLEAN`       | DEFAULT FALSE             | Indica si fue cambio automático          |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `pedido_id` → `pedidos(id)` ON DELETE CASCADE
- FOREIGN KEY: `estado_anterior_id` → `estados_pedido(id)` ON DELETE SET NULL
- FOREIGN KEY: `estado_nuevo_id` → `estados_pedido(id)` ON DELETE RESTRICT
- INDEX: `pedido_id` (para consultas por pedido)
- INDEX: `fecha_cambio` (para ordenamiento temporal)
- INDEX: `estado_nuevo_id` (para análisis de transiciones)

**Justificación**: Proporciona trazabilidad completa de todos los cambios de estado, esencial para auditoría y análisis de procesos.

---

### Tabla: `pedidos_prendas`

**Schema**: `public`  
**Propósito**: Líneas de pedido (sin cambios desde Fase 2)

| Columna          | Tipo            | Restricciones    | Descripción                              |
| ---------------- | --------------- | ---------------- | ---------------------------------------- |
| `id`             | `SERIAL`        | PRIMARY KEY      | Clave primaria autoincremental           |
| `pedido_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a pedidos(id)                |
| `prenda_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a prendas(id)                |
| `cantidad`       | `INTEGER`       | NOT NULL, CHECK > 0 | Cantidad de prendas en el pedido        |
| `precio_unitario`| `NUMERIC(10,2)` | NOT NULL, CHECK >= 0 | Precio unitario al momento del pedido  |
| `subtotal`       | `NUMERIC(10,2)` | NOT NULL, CHECK >= 0 | Subtotal = cantidad × precio_unitario   |

**Índices**: (sin cambios desde Fase 2)

---

### Tabla: `categorias`

**Schema**: `public`  
**Propósito**: Clasificar prendas por tipo (sin cambios)

| Columna       | Tipo          | Restricciones    | Descripción                    |
| ------------- | ------------- | ---------------- | ------------------------------ |
| `id`          | `SERIAL`      | PRIMARY KEY      | Clave primaria autoincremental |
| `nombre`      | `VARCHAR(100)` | UNIQUE, NOT NULL | Nombre de la categoría         |
| `descripcion` | `TEXT`        | Opcional         | Descripción detallada          |

---

### Tabla: `tipos_prenda` ⭐ NUEVA (Fase 3 - 3NF)

**Schema**: `public`  
**Propósito**: Tipos de prenda con información detallada de cuidado

| Columna                | Tipo           | Restricciones    | Descripción                              |
| ---------------------- | -------------- | ---------------- | ---------------------------------------- |
| `id`                   | `SERIAL`       | PRIMARY KEY      | Clave primaria autoincremental           |
| `nombre`               | `VARCHAR(50)`   | UNIQUE, NOT NULL | Nombre del tipo (ej: 'Buzo', 'Remera')    |
| `subcategoria`        | `VARCHAR(50)`   | Opcional         | Subcategoría (ej: 'Buzo con capucha')     |
| `cuidados_lavado`      | `TEXT`         | Opcional         | Instrucciones de lavado                  |
| `temperatura_lavado`   | `VARCHAR(20)`  | Opcional         | Temperatura recomendada                  |
| `puede_planchar`       | `BOOLEAN`       | DEFAULT TRUE     | Permite planchado                        |
| `puede_secar_maquina` | `BOOLEAN`       | DEFAULT TRUE     | Permite secadora                         |
| `temporada_recomendada`| `VARCHAR(20)`  | Opcional         | Temporada recomendada                   |
| `ocasion_uso`         | `VARCHAR(100)`  | Opcional         | Ocasiones de uso                         |
| `descripcion`         | `TEXT`         | Opcional         | Descripción general                      |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `nombre`
- INDEX: `temporada_recomendada` (para búsquedas por temporada)

**Justificación 3NF**: Extrae información detallada de tipos de prenda que estaba embebida o duplicada, eliminando dependencias transitivas.

---

### Tabla: `disenos` (Modificada para Fase 3)

**Schema**: `public`  
**Propósito**: Diseños de prendas con relación a colecciones

| Columna         | Tipo           | Restricciones             | Descripción                    |
| --------------- | -------------- | ------------------------- | ------------------------------ |
| `id`            | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental |
| `nombre`        | `VARCHAR(150)`  | UNIQUE, NOT NULL          | Nombre del diseño              |
| `tipo`          | `VARCHAR(100)`  | Opcional                  | Tipo de diseño                 |
| `detalle`       | `VARCHAR(200)`  | Opcional                  | Detalle del diseño             |
| `descripcion`   | `TEXT`         | Opcional                  | Descripción del diseño         |
| `coleccion_id`  | `INTEGER`      | FOREIGN KEY, NULLABLE    | Referencia a colecciones(id)   |
| `fecha_creacion`| `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP | Fecha de creación              |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `nombre`
- FOREIGN KEY: `coleccion_id` → `colecciones(id)` ON DELETE SET NULL

**Cambios desde Fase 2**:

- ➕ Agregado: `tipo` (categorización de diseños)
- ➕ Agregado: `detalle` (información adicional)
- ➕ Agregado: `coleccion_id` (relación con colecciones)

---

### Tabla: `telas`

**Schema**: `public`  
**Propósito**: Tipos de tela (sin cambios significativos)

| Columna          | Tipo            | Restricciones    | Descripción                    |
| ---------------- | --------------- | ---------------- | ------------------------------ |
| `id`             | `SERIAL`        | PRIMARY KEY      | Clave primaria autoincremental |
| `nombre`         | `VARCHAR(50)`   | UNIQUE, NOT NULL | Nombre de la tela              |
| `tipo`           | `VARCHAR(50)`    | NOT NULL         | Tipo de tela                   |
| `descripcion`    | `TEXT`          | Opcional         | Descripción de la tela         |
| `costo_por_metro`| `NUMERIC(10,2)`  | CHECK >= 0       | Costo por metro de tela        |

---

### Tabla: `proveedores` ⭐ NUEVA (Fase 3 - 3NF)

**Schema**: `public`  
**Propósito**: Proveedores de telas y materiales

| Columna                | Tipo           | Restricciones             | Descripción                              |
| ---------------------- | -------------- | ------------------------- | ---------------------------------------- |
| `id`                   | `SERIAL`       | PRIMARY KEY               | Clave primaria autoincremental           |
| `nombre`               | `VARCHAR(100)`  | NOT NULL                  | Nombre del proveedor                     |
| `rfc`                  | `VARCHAR(13)`   | UNIQUE, Opcional          | RFC único del proveedor                  |
| `telefono`             | `VARCHAR(20)`   | Opcional                  | Teléfono de contacto                     |
| `email`                | `VARCHAR(100)`  | Opcional                  | Email de contacto                        |
| `direccion`            | `TEXT`         | Opcional                  | Dirección del proveedor                  |
| `ciudad`               | `VARCHAR(100)`  | Opcional                  | Ciudad                                   |
| `pais`                 | `VARCHAR(50)`   | DEFAULT 'México'          | País                                     |
| `dias_entrega_promedio`| `INTEGER`       | DEFAULT 7, CHECK >= 0     | Días promedio de entrega                |
| `calificacion`         | `NUMERIC(3,2)`  | CHECK >= 0 AND <= 5       | Calificación del proveedor (0-5)        |
| `activo`               | `BOOLEAN`       | DEFAULT TRUE              | Estado activo/inactivo                   |
| `fecha_registro`       | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP | Fecha de registro                        |
| `notas`                | `TEXT`         | Opcional                  | Notas adicionales                       |

**Índices**:

- PRIMARY KEY: `id`
- UNIQUE: `rfc`
- INDEX: `activo` (para filtrar proveedores activos)
- INDEX: `calificacion` (para ordenamiento por calidad)

**Justificación 3NF**: Normaliza información de proveedores, permitiendo múltiples proveedores por tela y gestión centralizada.

---

### Tabla: `telas_proveedores` ⭐ NUEVA (Fase 3 - Junction Table)

**Schema**: `public`  
**Propósito**: Relación N:M entre telas y proveedores con precios específicos

| Columna              | Tipo            | Restricciones             | Descripción                              |
| -------------------- | --------------- | ------------------------- | ---------------------------------------- |
| `id`                 | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `tela_id`            | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a telas(id)                   |
| `proveedor_id`       | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a proveedores(id)             |
| `precio_metro`       | `NUMERIC(10,2)` | NOT NULL, CHECK >= 0      | Precio por metro de este proveedor       |
| `tiempo_entrega_dias`| `INTEGER`       | DEFAULT 7, CHECK >= 0     | Tiempo de entrega en días                |
| `cantidad_minima`    | `NUMERIC(10,2)` | DEFAULT 0, CHECK >= 0     | Cantidad mínima de compra                |
| `moneda`             | `VARCHAR(3)`    | DEFAULT 'MXN'             | Moneda del precio                        |
| `fecha_ultimo_precio`| `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP | Fecha del último precio actualizado      |
| `activa`             | `BOOLEAN`       | DEFAULT TRUE              | Relación activa/inactiva                 |

**Índices**:

- PRIMARY KEY: `id`
- FOREIGN KEY: `tela_id` → `telas(id)` ON DELETE CASCADE
- FOREIGN KEY: `proveedor_id` → `proveedores(id)` ON DELETE CASCADE
- UNIQUE: `(tela_id, proveedor_id)` (no duplicar relaciones)
- INDEX: `tela_id` (para consultas por tela)
- INDEX: `proveedor_id` (para consultas por proveedor)
- INDEX: `activa` (para filtrar relaciones activas)

**Justificación 3NF**: Permite que una tela tenga múltiples proveedores con precios diferentes, eliminando redundancia y dependencias transitivas.

---

### Tabla: `años`

**Schema**: `public`  
**Propósito**: Años disponibles (sin cambios)

| Columna | Tipo      | Restricciones    | Descripción                    |
| ------- | --------- | ---------------- | ------------------------------ |
| `id`     | `SERIAL`  | PRIMARY KEY      | Clave primaria autoincremental |
| `año`    | `INTEGER`  | UNIQUE, NOT NULL | Año (ej: 2022, 2023, 2024)     |

---

### Tabla: `temporadas`

**Schema**: `public`  
**Propósito**: Temporadas del año (sin cambios)

| Columna  | Tipo          | Restricciones    | Descripción                    |
| -------- | ------------- | ---------------- | ------------------------------ |
| `id`      | `SERIAL`      | PRIMARY KEY      | Clave primaria autoincremental |
| `nombre`  | `VARCHAR(50)`  | UNIQUE, NOT NULL | Nombre de la temporada         |

---

### Tabla: `colecciones`

**Schema**: `public`  
**Propósito**: Colecciones estacionales (sin cambios significativos)

| Columna        | Tipo           | Restricciones    | Descripción                    |
| -------------- | -------------- | ---------------- | ------------------------------ |
| `id`           | `SERIAL`       | PRIMARY KEY      | Clave primaria autoincremental |
| `año_id`       | `INTEGER`      | FOREIGN KEY      | Referencia a años(id)          |
| `temporada_id` | `INTEGER`      | FOREIGN KEY      | Referencia a temporadas(id)     |
| `nombre`       | `VARCHAR(200)`  | NOT NULL         | Nombre de la colección          |
| `descripcion`  | `TEXT`         | Opcional         | Descripción de la colección    |
| `fecha_inicio` | `DATE`         | Opcional         | Fecha de inicio                |
| `fecha_fin`    | `DATE`         | Opcional         | Fecha de fin                   |
| `activo`       | `BOOLEAN`      | DEFAULT TRUE     | Estado activo/inactivo         |

---

### Tabla: `telas_temporadas`

**Schema**: `public`  
**Propósito**: Disponibilidad de telas por temporada y año (sin cambios)

| Columna          | Tipo            | Restricciones    | Descripción                              |
| ---------------- | --------------- | ---------------- | ---------------------------------------- |
| `id`             | `SERIAL`        | PRIMARY KEY      | Clave primaria autoincremental            |
| `tela_id`        | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a telas(id)                  |
| `temporada_id`   | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a temporadas(id)              |
| `año_id`         | `INTEGER`        | FOREIGN KEY, NOT NULL | Referencia a años(id)                    |
| `activo`         | `BOOLEAN`       | DEFAULT TRUE     | Estado activo/inactivo                   |
| `stock_metros`   | `NUMERIC(10,2)`  | CHECK >= 0     | Stock disponible en metros                |
| `costo_por_metro`| `NUMERIC(10,2)` | CHECK >= 0     | Costo por metro en esta temporada/año    |
| `fecha_inicio`   | `DATE`         | Opcional         | Fecha de inicio de disponibilidad        |
| `fecha_fin`      | `DATE`         | Opcional         | Fecha de fin de disponibilidad           |

---

### Tabla: `prendas` (Modificada para Fase 3)

**Schema**: `public`  
**Propósito**: Catálogo de productos con tipos normalizados

| Columna            | Tipo            | Restricciones             | Descripción                              |
| ------------------ | --------------- | ------------------------- | ---------------------------------------- |
| `id`               | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `nombre`           | `VARCHAR(200)`  | NOT NULL                  | Nombre completo de la prenda             |
| `tipo_prenda_id`   | `INTEGER`       | FOREIGN KEY, NOT NULL     | Referencia a tipos_prenda(id)            |
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
- FOREIGN KEY: `tipo_prenda_id` → `tipos_prenda(id)` ON DELETE RESTRICT
- FOREIGN KEY: `categoria_id` → `categorias(id)`
- FOREIGN KEY: `diseno_id` → `disenos(id)`
- FOREIGN KEY: `tela_id` → `telas(id)`
- FOREIGN KEY: `coleccion_id` → `colecciones(id)` ON DELETE SET NULL
- INDEX: `activa` (para filtrar prendas activas)
- INDEX: `stock_disponible` (para consultas de inventario)

**Cambios desde Fase 2**:

- ➕ Agregado: `tipo_prenda_id` (FK) - Reemplaza campo `tipo` VARCHAR para 3NF
- ➖ Removido: `tipo` VARCHAR(100) (ahora en tabla `tipos_prenda`)

**Justificación 3NF**: El tipo de prenda ahora está normalizado, eliminando dependencias transitivas y permitiendo información detallada de cuidado.

---

### Tabla: `movimientos_inventario`

**Schema**: `public`  
**Propósito**: Auditoría de cambios en stock (sin cambios significativos)

| Columna          | Tipo            | Restricciones             | Descripción                              |
| ---------------- | --------------- | ------------------------- | ---------------------------------------- |
| `id`             | `SERIAL`        | PRIMARY KEY               | Clave primaria autoincremental           |
| `prenda_id`      | `INTEGER`       | FOREIGN KEY, NOT NULL | Referencia a prendas(id)                  |
| `tipo`           | `VARCHAR(20)`   | NOT NULL, CHECK           | Tipo: entrada, salida, ajuste             |
| `cantidad`       | `INTEGER`      | NOT NULL                  | Cantidad del movimiento                   |
| `stock_anterior` | `INTEGER`       | NOT NULL, CHECK >= 0      | Stock antes del movimiento                |
| `stock_nuevo`    | `INTEGER`       | NOT NULL, CHECK >= 0      | Stock después del movimiento             |
| `pedido_id`      | `INTEGER`       | FOREIGN KEY, NULLABLE     | Referencia a pedidos(id) - Opcional     |
| `motivo`         | `TEXT`          | Opcional                  | Motivo del movimiento                     |
| `fecha`          | `TIMESTAMP`     | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Fecha del movimiento          |
| `usuario`        | `VARCHAR(100)`  | Opcional                  | Usuario que realizó el movimiento        |

---

## Relaciones

### clientes → direcciones (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un cliente puede tener 0 o muchas direcciones

- **Clave Foránea**: `direcciones.cliente_id` → `clientes.id`
- **Integridad Referencial**: ON DELETE CASCADE

---

### clientes → pedidos (1:N)

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un cliente puede realizar 0 o muchos pedidos

- **Clave Foránea**: `pedidos.cliente_id` → `clientes.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### pedidos → estados_pedido (N:1) ⭐ NUEVA

**Tipo**: Muchos a Uno  
**Cardinalidad**: Muchos pedidos tienen un estado

- **Clave Foránea**: `pedidos.estado_id` → `estados_pedido.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### pedidos → metodos_pago (N:1) ⭐ NUEVA

**Tipo**: Muchos a Uno (opcional)  
**Cardinalidad**: Muchos pedidos pueden usar un método de pago

- **Clave Foránea**: `pedidos.metodo_pago_id` → `metodos_pago.id`
- **Integridad Referencial**: ON DELETE SET NULL

---

### pedidos → direcciones (N:1) ⭐ NUEVA

**Tipo**: Muchos a Uno (opcional)  
**Cardinalidad**: Muchos pedidos pueden enviarse a una dirección

- **Clave Foránea**: `pedidos.direccion_envio_id` → `direcciones.id`
- **Integridad Referencial**: ON DELETE SET NULL

---

### pedidos → historial_estados_pedido (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un pedido puede tener 0 o muchos cambios de estado

- **Clave Foránea**: `historial_estados_pedido.pedido_id` → `pedidos.id`
- **Integridad Referencial**: ON DELETE CASCADE

---

### estados_pedido → historial_estados_pedido (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos (doble relación)  
**Cardinalidad**: Un estado puede ser estado anterior o nuevo en muchos registros

- **Clave Foránea**: `historial_estados_pedido.estado_anterior_id` → `estados_pedido.id`
- **Clave Foránea**: `historial_estados_pedido.estado_nuevo_id` → `estados_pedido.id`
- **Integridad Referencial**: ON DELETE SET NULL (anterior), ON DELETE RESTRICT (nuevo)

---

### prendas → tipos_prenda (N:1) ⭐ NUEVA

**Tipo**: Muchos a Uno  
**Cardinalidad**: Muchas prendas son de un tipo

- **Clave Foránea**: `prendas.tipo_prenda_id` → `tipos_prenda.id`
- **Integridad Referencial**: ON DELETE RESTRICT

---

### telas → telas_proveedores (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Una tela puede ser suministrada por 0 o muchos proveedores

- **Clave Foránea**: `telas_proveedores.tela_id` → `telas.id`
- **Integridad Referencial**: ON DELETE CASCADE

---

### proveedores → telas_proveedores (1:N) ⭐ NUEVA

**Tipo**: Uno a Muchos  
**Cardinalidad**: Un proveedor puede suministrar 0 o muchas telas

- **Clave Foránea**: `telas_proveedores.proveedor_id` → `proveedores.id`
- **Integridad Referencial**: ON DELETE CASCADE

---

### disenos → colecciones (N:1) ⭐ NUEVA

**Tipo**: Muchos a Uno (opcional)  
**Cardinalidad**: Muchos diseños pueden pertenecer a una colección

- **Clave Foránea**: `disenos.coleccion_id` → `colecciones.id`
- **Integridad Referencial**: ON DELETE SET NULL

---

## Restricciones de Integridad

### CHECK Constraints

```sql
-- Estados válidos
CHECK (tipo IN ('entrada', 'salida', 'ajuste')) -- en movimientos_inventario
CHECK (tipo IN ('envio', 'facturacion', 'otro')) -- en direcciones

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
CHECK (precio_metro >= 0) -- en telas_proveedores
CHECK (comision_porcentaje >= 0 AND comision_porcentaje <= 100) -- en metodos_pago
CHECK (calificacion >= 0 AND calificacion <= 5) -- en proveedores
CHECK (dias_procesamiento >= 0) -- en metodos_pago
CHECK (dias_entrega_promedio >= 0) -- en proveedores
CHECK (tiempo_entrega_dias >= 0) -- en telas_proveedores
CHECK (cantidad_minima >= 0) -- en telas_proveedores
```

### UNIQUE Constraints

```sql
-- Email único por cliente
UNIQUE (email) -- en tabla clientes

-- Código único por estado
UNIQUE (codigo) -- en tabla estados_pedido

-- Código único por método de pago
UNIQUE (codigo) -- en tabla metodos_pago

-- RFC único por proveedor
UNIQUE (rfc) -- en tabla proveedores

-- Nombre único por categoría
UNIQUE (nombre) -- en tabla categorias

-- Nombre único por tipo de prenda
UNIQUE (nombre) -- en tabla tipos_prenda

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

-- No duplicar relaciones tela-proveedor
UNIQUE (tela_id, proveedor_id) -- en tabla telas_proveedores
```

### FOREIGN KEY Constraints

```sql
-- Relación clientes → direcciones
FOREIGN KEY (cliente_id) 
  REFERENCES clientes(id)
  ON DELETE CASCADE

-- Relación clientes → pedidos
FOREIGN KEY (cliente_id) 
  REFERENCES clientes(id)
  ON DELETE RESTRICT

-- Relación pedidos → estados_pedido
FOREIGN KEY (estado_id) 
  REFERENCES estados_pedido(id)
  ON DELETE RESTRICT

-- Relación pedidos → metodos_pago
FOREIGN KEY (metodo_pago_id) 
  REFERENCES metodos_pago(id)
  ON DELETE SET NULL

-- Relación pedidos → direcciones
FOREIGN KEY (direccion_envio_id) 
  REFERENCES direcciones(id)
  ON DELETE SET NULL

-- Relación pedidos → historial_estados_pedido
FOREIGN KEY (pedido_id) 
  REFERENCES pedidos(id)
  ON DELETE CASCADE

-- Relación estados_pedido → historial_estados_pedido (anterior)
FOREIGN KEY (estado_anterior_id) 
  REFERENCES estados_pedido(id)
  ON DELETE SET NULL

-- Relación estados_pedido → historial_estados_pedido (nuevo)
FOREIGN KEY (estado_nuevo_id) 
  REFERENCES estados_pedido(id)
  ON DELETE RESTRICT

-- Relación pedidos → pedidos_prendas
FOREIGN KEY (pedido_id) 
  REFERENCES pedidos(id)
  ON DELETE CASCADE

-- Relación prendas → pedidos_prendas
FOREIGN KEY (prenda_id) 
  REFERENCES prendas(id)
  ON DELETE RESTRICT

-- Relación prendas → tipos_prenda
FOREIGN KEY (tipo_prenda_id) 
  REFERENCES tipos_prenda(id)
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

-- Relación disenos → colecciones
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

-- Relación telas → telas_proveedores
FOREIGN KEY (tela_id) 
  REFERENCES telas(id)
  ON DELETE CASCADE

-- Relación proveedores → telas_proveedores
FOREIGN KEY (proveedor_id) 
  REFERENCES proveedores(id)
  ON DELETE CASCADE

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

## Estadísticas del Modelo

| Tabla                      | Columnas | Índices | Relaciones        | Estado             |
| -------------------------- | -------- | ------- | ----------------- | ------------------ |
| `clientes`                  | 7        | 3       | 2 (salida)        | 🔄 Modificada (3NF) |
| `direcciones`               | 11       | 4       | 2 (1 entrada, 1 salida indirecta) | ⭐ Nueva (3NF) |
| `pedidos`                   | 12       | 6       | 5 (1 entrada, 4 salida) | 🔄 Modificada (3NF) |
| `estados_pedido`            | 10       | 4       | 3 (salida)        | ⭐ Nueva (3NF)     |
| `metodos_pago`              | 8        | 2       | 1 (salida)        | ⭐ Nueva (3NF)     |
| `historial_estados_pedido`  | 8        | 4       | 3 (entrada)       | ⭐ Nueva (3NF)     |
| `pedidos_prendas`           | 6        | 3       | 2 (entrada)       | ✅ Sin cambios     |
| `categorias`                | 3        | 2       | 1 (salida)        | ✅ Sin cambios     |
| `tipos_prenda`              | 10       | 2       | 1 (salida)        | ⭐ Nueva (3NF)     |
| `disenos`                   | 7        | 3       | 2 (1 entrada, 1 salida) | 🔄 Modificada (3NF) |
| `telas`                     | 5        | 2       | 3 (salida)        | ✅ Sin cambios     |
| `proveedores`               | 13       | 3       | 1 (salida)        | ⭐ Nueva (3NF)     |
| `telas_proveedores`         | 9        | 5       | 2 (entrada)       | ⭐ Nueva (3NF)     |
| `años`                      | 2        | 2       | 2 (salida)        | ✅ Sin cambios     |
| `temporadas`                | 2        | 2       | 2 (salida)        | ✅ Sin cambios     |
| `colecciones`               | 8        | 4       | 3 (2 entrada, 1 salida) | ✅ Sin cambios |
| `telas_temporadas`          | 9        | 6       | 3 (entrada)       | ✅ Sin cambios     |
| `prendas`                   | 16       | 7       | 6 (5 entrada, 1 salida) | 🔄 Modificada (3NF) |
| `movimientos_inventario`    | 10       | 5       | 2 (entrada)       | ✅ Sin cambios     |

**Total**: 19 tablas, 157 columnas, 68 índices, 24 relaciones

---

## Normalización 3NF Aplicada

### Antes (Fase 2 - 2NF)

```
clientes {
  id,
  nombre,
  direccion,  -- ❌ Dependencia transitiva
  ciudad,     -- ❌ Dependencia transitiva
  codigo_postal -- ❌ Dependencia transitiva
}

pedidos {
  id,
  estado,  -- ❌ Dependencia transitiva (texto repetido)
  ...
}

prendas {
  id,
  tipo,  -- ❌ Dependencia transitiva (texto repetido)
  ...
}
```

**Problemas**:

- ❌ Dependencias transitivas: `direccion`, `ciudad`, `codigo_postal` dependen de `cliente_id`, pero también tienen relación entre sí
- ❌ Redundancia: Estados de pedido repetidos como texto
- ❌ Redundancia: Tipos de prenda repetidos como texto
- ❌ Falta de flexibilidad: Un cliente solo puede tener una dirección

### Después (Fase 3 - 3NF)

```
clientes {
  id,
  nombre,
  email
  -- ✅ Sin direcciones (normalizadas)
}

direcciones {
  id,
  cliente_id,  -- ✅ Dependencia directa
  direccion,   -- ✅ Dependencia directa
  ciudad,      -- ✅ Dependencia directa
  codigo_postal -- ✅ Dependencia directa
}

pedidos {
  id,
  estado_id,  -- ✅ Referencia a tabla normalizada
  ...
}

estados_pedido {
  id,
  codigo,
  nombre,
  es_inicial,
  es_final
  -- ✅ Información centralizada
}

prendas {
  id,
  tipo_prenda_id,  -- ✅ Referencia a tabla normalizada
  ...
}

tipos_prenda {
  id,
  nombre,
  cuidados_lavado,
  temperatura_lavado
  -- ✅ Información detallada centralizada
}
```

**Beneficios**:

- ✅ Eliminación de dependencias transitivas
- ✅ Múltiples direcciones por cliente
- ✅ Gestión centralizada de estados con workflow
- ✅ Información detallada de tipos de prenda
- ✅ Múltiples proveedores por tela con precios específicos
- ✅ Auditoría completa de cambios de estado

### Transformación de Datos

**Ejemplo de migración**:

```sql
-- Fase 2 (2NF)
INSERT INTO clientes (nombre, direccion, ciudad, codigo_postal) 
VALUES ('María', 'Calle 123', 'Ciudad de México', '01234');

INSERT INTO pedidos (cliente_id, estado, ...) 
VALUES (1, 'pendiente', ...);

-- Fase 3 (3NF)
INSERT INTO clientes (nombre) 
VALUES ('María');

INSERT INTO direcciones (cliente_id, tipo, direccion, ciudad, codigo_postal) 
VALUES (1, 'envio', 'Calle 123', 'Ciudad de México', '01234');

INSERT INTO estados_pedido (codigo, nombre, es_inicial) 
VALUES ('pendiente', 'Pendiente', true);

INSERT INTO pedidos (cliente_id, estado_id, ...) 
VALUES (1, 1, ...);
```

---

## Características Avanzadas de Fase 3

### 1. Vistas de Business Intelligence

```sql
-- Vista de ventas mensuales
CREATE VIEW vista_ventas_mensuales AS
SELECT 
  DATE_TRUNC('month', fecha_pedido) as mes,
  SUM(total) as total_ventas,
  COUNT(*) as cantidad_pedidos,
  AVG(total) as ticket_promedio
FROM pedidos
WHERE estado_id IN (SELECT id FROM estados_pedido WHERE es_final = true)
GROUP BY DATE_TRUNC('month', fecha_pedido);

-- Vista de inventario crítico
CREATE VIEW vista_inventario_critico AS
SELECT 
  p.id,
  p.nombre,
  p.stock_disponible,
  CASE 
    WHEN p.stock_disponible = 0 THEN 'AGOTADO'
    WHEN p.stock_disponible < 5 THEN 'BAJO'
    ELSE 'NORMAL'
  END as estado_stock
FROM prendas p
WHERE p.stock_disponible <= 5 AND p.activa = true;
```

### 2. Procedimientos Almacenados

```sql
-- Procesar pedido completo
CREATE OR REPLACE FUNCTION procesar_pedido(pedido_id INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Actualizar stock
  UPDATE prendas p
  SET stock_vendido = stock_vendido + pp.cantidad,
      fecha_ultima_venta = CURRENT_TIMESTAMP
  FROM pedidos_prendas pp
  WHERE pp.pedido_id = procesar_pedido.pedido_id
    AND pp.prenda_id = p.id;
  
  -- Registrar movimientos
  INSERT INTO movimientos_inventario (prenda_id, tipo, cantidad, ...)
  SELECT prenda_id, 'salida', cantidad, ...
  FROM pedidos_prendas
  WHERE pedido_id = procesar_pedido.pedido_id;
  
  -- Cambiar estado
  UPDATE pedidos
  SET estado_id = (SELECT id FROM estados_pedido WHERE codigo = 'completado')
  WHERE id = procesar_pedido.pedido_id;
END;
$$ LANGUAGE plpgsql;
```

### 3. Triggers Automáticos

```sql
-- Trigger para actualizar stock automáticamente
CREATE TRIGGER trigger_actualizar_stock_pedido
AFTER INSERT ON pedidos_prendas
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_prenda();

-- Trigger para registrar cambios de estado
CREATE TRIGGER trigger_registrar_historial_estado
AFTER UPDATE OF estado_id ON pedidos
FOR EACH ROW
WHEN (OLD.estado_id IS DISTINCT FROM NEW.estado_id)
EXECUTE FUNCTION registrar_cambio_estado();

-- Trigger para alertar stock crítico
CREATE TRIGGER trigger_alertar_stock_critico
AFTER UPDATE OF stock_disponible ON prendas
FOR EACH ROW
WHEN (NEW.stock_disponible <= 5 AND OLD.stock_disponible > 5)
EXECUTE FUNCTION alertar_stock_critico();
```

---

## Notas de Diseño

### ✅ Normalización Completa a 3NF

Este modelo está **completamente normalizado a 3NF**:

1. **Eliminación de Dependencias Transitivas**:
   - Direcciones separadas de clientes
   - Estados de pedido normalizados
   - Tipos de prenda centralizados
   - Métodos de pago estandarizados

2. **Gestión de Workflow**:
   - Tabla `estados_pedido` con configuración de flujo
   - Tabla `historial_estados_pedido` para auditoría completa
   - Soporte para transiciones automáticas

3. **Gestión de Proveedores**:
   - Tabla `proveedores` para información de proveedores
   - Tabla `telas_proveedores` para relación N:M con precios específicos
   - Permite comparación de precios entre proveedores

4. **Business Intelligence**:
   - Vistas optimizadas para reportes
   - Procedimientos almacenados para operaciones complejas
   - Triggers para automatización

5. **Escalabilidad**:
   - Múltiples direcciones por cliente
   - Múltiples proveedores por tela
   - Historial ilimitado de estados
   - Información detallada de tipos de prenda

### Forma Normal Actual

- **Estado**: ✅ 3NF (completa)
- **Características**: Sin dependencias transitivas, sin redundancia funcional, sin dependencias parciales
- **Próximo objetivo**: BCNF (Boyce-Codd Normal Form) si es necesario

---

**Base de Datos**: `chamana_db_fase3`  
**SGBD**: PostgreSQL 12+  
**Schema**: `public`  
**Forma Normal**: ✅ 3NF (completa)  
**Estado**: ✅ Implementado - Sistema completo con vistas, procedimientos y triggers

