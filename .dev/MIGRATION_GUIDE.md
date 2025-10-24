# Guía de Migración Entre Fases - Proyecto de Base de Datos

**Proyecto**: Sistema de Gestión de Productos  
**Estudiante**: Gabriel  
**Curso**: Base de Datos  
**Año**: 2025

## Descripción General

Esta guía proporciona instrucciones detalladas para migrar entre las diferentes fases del proyecto, asegurando una transición suave y manteniendo la integridad de los datos.

## Principios de Migración

### 1. Preservación de Datos

- Los datos existentes deben preservarse durante la migración
- Se crean backups automáticos antes de cada migración
- Se implementan rollbacks para casos de error

### 2. Migración Incremental

- Cada fase se construye sobre la anterior
- Los cambios son acumulativos y progresivos
- Se mantiene compatibilidad hacia atrás cuando es posible

### 3. Documentación Completa

- Cada migración está documentada paso a paso
- Se registran todos los cambios realizados
- Se mantiene un log de migraciones

## Migración de Fase 0 a Fase 1 (Normalización)

### Preparación

1. **Backup de la Base de Datos**

   ```bash
   pg_dump -h localhost -U postgres -d proyecto_db_basico > backup_fase0.sql
   ```

2. **Verificación del Estado Actual**

   ```sql
   -- Verificar estructura actual
   \d usuarios
   \d categorias
   \d productos

   -- Verificar datos
   SELECT COUNT(*) FROM usuarios;
   SELECT COUNT(*) FROM categorias;
   SELECT COUNT(*) FROM productos;
   ```

### Proceso de Migración

#### Paso 1: Análisis de Normalización

```sql
-- Identificar dependencias funcionales
-- Analizar redundancias en el esquema actual
-- Documentar violaciones de normalización
```

#### Paso 2: Aplicar Primera Forma Normal (1NF)

```sql
-- Eliminar grupos repetitivos
-- Asegurar atomicidad de valores
-- Crear tablas separadas para datos repetitivos
```

#### Paso 3: Aplicar Segunda Forma Normal (2NF)

```sql
-- Eliminar dependencias parciales
-- Mover atributos no clave a tablas apropiadas
-- Crear claves compuestas donde sea necesario
```

#### Paso 4: Aplicar Tercera Forma Normal (3NF)

```sql
-- Eliminar dependencias transitivas
-- Separar atributos que dependen de otros atributos no clave
-- Crear nuevas tablas para dependencias transitivas
```

#### Paso 5: Actualizar Aplicación Web

```javascript
// Actualizar modelos de datos
// Modificar consultas SQL
// Actualizar interfaz de usuario
// Ajustar validaciones
```

### Scripts de Migración

#### Script UP (Fase 0 → Fase 1)

```sql
-- 1_fase1_normalizacion_up.sql
BEGIN;

-- Crear nuevas tablas normalizadas
CREATE TABLE usuarios_normalizados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrar datos existentes
INSERT INTO usuarios_normalizados (nombre, apellido, email, fecha_registro)
SELECT
    SPLIT_PART(nombre, ' ', 1) as nombre,
    SPLIT_PART(nombre, ' ', 2) as apellido,
    email,
    fecha_registro
FROM usuarios;

-- Crear índices
CREATE INDEX idx_usuarios_normalizados_email ON usuarios_normalizados(email);
CREATE INDEX idx_usuarios_normalizados_nombre ON usuarios_normalizados(nombre, apellido);

COMMIT;
```

#### Script DOWN (Fase 1 → Fase 0)

```sql
-- 1_fase1_normalizacion_down.sql
BEGIN;

-- Restaurar estructura original
DROP TABLE IF EXISTS usuarios_normalizados CASCADE;

-- Restaurar datos desde backup si es necesario
-- (Implementar según sea necesario)

COMMIT;
```

### Verificación Post-Migración

```sql
-- Verificar integridad de datos
SELECT COUNT(*) FROM usuarios_normalizados;
SELECT COUNT(*) FROM categorias;
SELECT COUNT(*) FROM productos;

-- Verificar relaciones
SELECT * FROM usuarios_normalizados LIMIT 5;
SELECT * FROM categorias LIMIT 5;
SELECT * FROM productos LIMIT 5;

-- Verificar rendimiento
EXPLAIN ANALYZE SELECT * FROM usuarios_normalizados WHERE email = 'test@example.com';
```

## Migración de Fase 1 a Fase 2 (Relaciones)

### Preparación

1. **Backup de Fase 1**

   ```bash
   pg_dump -h localhost -U postgres -d proyecto_db_basico > backup_fase1.sql
   ```

2. **Análisis de Relaciones**
   - Identificar nuevas relaciones necesarias
   - Diseñar claves foráneas
   - Planificar restricciones de integridad

### Proceso de Migración

#### Paso 1: Crear Nuevas Tablas de Relación

```sql
-- Tabla de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios_normalizados(id),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'pendiente'
);

-- Tabla de detalles de pedidos
CREATE TABLE detalles_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);
```

#### Paso 2: Implementar Restricciones Avanzadas

```sql
-- Restricciones de integridad
ALTER TABLE pedidos ADD CONSTRAINT chk_total_positivo CHECK (total >= 0);
ALTER TABLE detalles_pedidos ADD CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0);
ALTER TABLE detalles_pedidos ADD CONSTRAINT chk_precio_positivo CHECK (precio_unitario >= 0);
```

#### Paso 3: Crear Índices para Relaciones

```sql
-- Índices para optimizar joins
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_detalles_pedido ON detalles_pedidos(pedido_id);
CREATE INDEX idx_detalles_producto ON detalles_pedidos(producto_id);
```

## Migración de Fase 2 a Fase 3 (Vistas y Procedimientos)

### Preparación

1. **Backup de Fase 2**

   ```bash
   pg_dump -h localhost -U postgres -d proyecto_db_basico > backup_fase2.sql
   ```

2. **Análisis de Vistas Necesarias**
   - Identificar consultas complejas frecuentes
   - Diseñar vistas para simplificar acceso
   - Planificar procedimientos almacenados

### Proceso de Migración

#### Paso 1: Crear Vistas Complejas

```sql
-- Vista de resumen de pedidos por usuario
CREATE VIEW vista_pedidos_usuario AS
SELECT
    u.id as usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    COUNT(p.id) as total_pedidos,
    SUM(p.total) as total_gastado,
    AVG(p.total) as promedio_pedido,
    MAX(p.fecha_pedido) as ultimo_pedido
FROM usuarios_normalizados u
LEFT JOIN pedidos p ON u.id = p.usuario_id
GROUP BY u.id, u.nombre, u.apellido, u.email;

-- Vista de productos más vendidos
CREATE VIEW vista_productos_vendidos AS
SELECT
    pr.id,
    pr.nombre,
    pr.precio,
    c.nombre as categoria,
    SUM(dp.cantidad) as total_vendido,
    SUM(dp.cantidad * dp.precio_unitario) as ingresos_totales
FROM productos pr
JOIN categorias c ON pr.categoria_id = c.id
LEFT JOIN detalles_pedidos dp ON pr.id = dp.producto_id
GROUP BY pr.id, pr.nombre, pr.precio, c.nombre
ORDER BY total_vendido DESC;
```

#### Paso 2: Crear Procedimientos Almacenados

```sql
-- Procedimiento para crear pedido
CREATE OR REPLACE FUNCTION crear_pedido(
    p_usuario_id INTEGER,
    p_productos JSONB
) RETURNS INTEGER AS $$
DECLARE
    pedido_id INTEGER;
    producto_item JSONB;
    total_pedido DECIMAL(10,2) := 0;
BEGIN
    -- Crear pedido
    INSERT INTO pedidos (usuario_id, total)
    VALUES (p_usuario_id, 0)
    RETURNING id INTO pedido_id;

    -- Procesar productos
    FOR producto_item IN SELECT * FROM jsonb_array_elements(p_productos)
    LOOP
        INSERT INTO detalles_pedidos (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (
            pedido_id,
            (producto_item->>'producto_id')::INTEGER,
            (producto_item->>'cantidad')::INTEGER,
            (producto_item->>'precio')::DECIMAL
        );

        total_pedido := total_pedido + ((producto_item->>'cantidad')::INTEGER * (producto_item->>'precio')::DECIMAL);
    END LOOP;

    -- Actualizar total del pedido
    UPDATE pedidos SET total = total_pedido WHERE id = pedido_id;

    RETURN pedido_id;
END;
$$ LANGUAGE plpgsql;
```

## Migración de Fase 3 a Fase 4 (Optimización)

### Preparación

1. **Backup de Fase 3**

   ```bash
   pg_dump -h localhost -U postgres -d proyecto_db_basico > backup_fase3.sql
   ```

2. **Análisis de Rendimiento**
   - Identificar consultas lentas
   - Analizar uso de índices
   - Planificar optimizaciones

### Proceso de Migración

#### Paso 1: Optimizar Índices

```sql
-- Crear índices compuestos
CREATE INDEX idx_pedidos_usuario_fecha ON pedidos(usuario_id, fecha_pedido);
CREATE INDEX idx_productos_categoria_precio ON productos(categoria_id, precio);
CREATE INDEX idx_detalles_pedido_producto ON detalles_pedidos(pedido_id, producto_id);

-- Crear índices parciales
CREATE INDEX idx_pedidos_activos ON pedidos(usuario_id) WHERE estado != 'cancelado';
CREATE INDEX idx_productos_stock_bajo ON productos(id) WHERE stock < 10;
```

#### Paso 2: Optimizar Consultas

```sql
-- Revisar y optimizar consultas existentes
-- Implementar consultas más eficientes
-- Usar EXPLAIN ANALYZE para verificar mejoras
```

#### Paso 3: Configurar PostgreSQL

```sql
-- Ajustar parámetros de configuración
-- Optimizar memoria y cache
-- Configurar logging de consultas lentas
```

## Migración de Fase 4 a Fase 5 (Final)

### Preparación

1. **Backup de Fase 4**

   ```bash
   pg_dump -h localhost -U postgres -d proyecto_db_basico > backup_fase4.sql
   ```

2. **Integración Final**
   - Integrar todas las funcionalidades
   - Optimizar interfaz de usuario
   - Preparar documentación final

### Proceso de Migración

#### Paso 1: Integración Completa

```sql
-- Crear vistas finales
-- Implementar procedimientos finales
-- Optimizar rendimiento final
```

#### Paso 2: Interfaz Web Final

```javascript
// Integrar todas las funcionalidades
// Optimizar rendimiento del frontend
// Implementar características avanzadas
```

#### Paso 3: Documentación Final

```markdown
# Documentación Final del Proyecto

- Guía de usuario completa
- Documentación técnica
- Manual de administración
- Guía de desarrollo
```

## Herramientas de Migración

### Scripts Automatizados

```bash
#!/bin/bash
# migrate.sh - Script de migración automatizada

PHASE=$1
BACKUP_DIR="./backups"
MIGRATION_DIR="./migrations"

# Crear backup
pg_dump -h localhost -U postgres -d proyecto_db_basico > "$BACKUP_DIR/backup_fase$PHASE.sql"

# Ejecutar migración
psql -h localhost -U postgres -d proyecto_db_basico -f "$MIGRATION_DIR/${PHASE}_fase${PHASE}_up.sql"

# Verificar migración
psql -h localhost -U postgres -d proyecto_db_basico -c "SELECT 'Migration completed successfully' as status;"
```

### Verificación de Integridad

```sql
-- Verificar integridad de datos
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios_normalizados
UNION ALL
SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'detalles_pedidos', COUNT(*) FROM detalles_pedidos;

-- Verificar relaciones
SELECT
    COUNT(*) as pedidos_sin_usuario
FROM pedidos p
LEFT JOIN usuarios_normalizados u ON p.usuario_id = u.id
WHERE u.id IS NULL;

-- Verificar rendimiento
EXPLAIN ANALYZE SELECT * FROM vista_pedidos_usuario LIMIT 10;
```

## Rollback Procedures

### Rollback General

```bash
#!/bin/bash
# rollback.sh - Script de rollback

PHASE=$1
BACKUP_FILE="./backups/backup_fase$PHASE.sql"

# Restaurar desde backup
psql -h localhost -U postgres -d proyecto_db_basico -f "$BACKUP_FILE"

echo "Rollback to phase $PHASE completed"
```

### Rollback Específico por Fase

```sql
-- Rollback específico para cada fase
-- Implementar según sea necesario
```

## Monitoreo y Logging

### Log de Migraciones

```sql
-- Tabla de log de migraciones
CREATE TABLE migration_log (
    id SERIAL PRIMARY KEY,
    phase_from INTEGER NOT NULL,
    phase_to INTEGER NOT NULL,
    migration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    notes TEXT
);

-- Registrar migración
INSERT INTO migration_log (phase_from, phase_to, status, notes)
VALUES (0, 1, 'completed', 'Normalization migration completed successfully');
```

### Monitoreo de Rendimiento

```sql
-- Consultas de monitoreo
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;
```

## Mejores Prácticas

### Antes de la Migración

1. Siempre crear backup completo
2. Probar migración en entorno de desarrollo
3. Documentar todos los cambios
4. Verificar dependencias

### Durante la Migración

1. Ejecutar en transacciones
2. Monitorear logs de error
3. Verificar integridad de datos
4. Probar funcionalidades críticas

### Después de la Migración

1. Verificar integridad completa
2. Probar rendimiento
3. Actualizar documentación
4. Notificar cambios a usuarios

## Troubleshooting

### Problemas Comunes

1. **Error de integridad referencial**

   - Verificar claves foráneas
   - Revisar datos huérfanos
   - Ajustar restricciones

2. **Pérdida de datos**

   - Restaurar desde backup
   - Verificar scripts de migración
   - Revisar logs de transacciones

3. **Problemas de rendimiento**
   - Analizar consultas lentas
   - Revisar índices
   - Optimizar configuración

### Contacto de Soporte

**Estudiante**: Gabriel  
**Email**: gabriel@universidad.edu  
**Proyecto**: Sistema de Gestión de Productos

---

**Última Actualización**: 15 de Octubre, 2025  
**Versión del Documento**: 1.0.0
