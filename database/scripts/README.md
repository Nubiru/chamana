# Fase 4: Scripts de Optimización de Base de Datos

**Estado**: Listo para Ejecutar  
**Creado**: 7 de Noviembre, 2025  
**Fase**: 4.1 - Optimización de Base de Datos  
**Ubicación**: Los scripts están en `3.vistas-y-procedimientos/database/scripts/`

---

## Resumen

Este documento describe los scripts de optimización de base de datos de Fase 4. Estos scripts mejoran el rendimiento de las consultas mediante:

1. **Agregar índices** en columnas consultadas frecuentemente
2. **Optimizar vistas** con mejores estrategias de JOIN
3. **Crear vistas materializadas** para reportes pesados

**Mejora de Rendimiento Esperada**: 50%+ más rápido en consultas

**Nota**: Los scripts reales están ubicados en `3.vistas-y-procedimientos/database/scripts/` porque operan sobre la base de datos de Fase 3.

---

## Scripts

### 11_add_indexes.js

Crea 23 índices en columnas consultadas frecuentemente:

- **Índices de Clave Foránea** (11): Para operaciones JOIN
- **Índices de Filtro** (5): Para cláusulas WHERE
- **Índices Compuestos** (3): Para consultas multi-columna
- **Índices Parciales** (3): Para consultas filtradas
- **Índices de Búsqueda de Texto** (1): Para búsqueda de texto completo

**Tiempo de Ejecución**: ~30 segundos  
**Impacto**: Alto - mejora el rendimiento de todas las consultas

### 12_optimize_views.js

Crea versiones optimizadas de las vistas existentes:

- `vista_ventas_mensuales_optimizada`
- `vista_inventario_critico_optimizada`
- `vista_top_productos_optimizada`
- `vista_analisis_clientes_optimizada`
- `vista_rotacion_inventario_optimizada`

**Mejoras**:
- INNER JOIN en lugar de JOIN
- Filtros WHERE aplicados previamente
- Cláusulas HAVING para agregaciones
- Mejores estrategias ORDER BY

**Tiempo de Ejecución**: ~10 segundos  
**Impacto**: Medio - mejora el rendimiento de consultas de vistas

### 13_materialized_views.js

Crea 4 vistas materializadas para reportes pesados:

- `mv_ventas_mensuales_resumen` - Actualización diaria
- `mv_top_productos_resumen` - Actualización diaria
- `mv_segmentacion_clientes_resumen` - Actualización semanal
- `mv_inventario_critico_resumen` - Actualización por hora

**Tiempo de Ejecución**: ~1-2 minutos (depende del volumen de datos)  
**Impacto**: Muy Alto - consultas instantáneas en datos pre-calculados

---

## Orden de Ejecución

**Importante**: Ejecutar los scripts en este orden exacto:

```bash
# 1. Agregar índices primero (fundamento para optimización)
node 11_add_indexes.js

# 2. Optimizar vistas (usa índices del paso 1)
node 12_optimize_views.js

# 3. Crear vistas materializadas (usa consultas optimizadas)
node 13_materialized_views.js
```

---

## Prerrequisitos

1. **Fase 3 Completa**: La base de datos debe tener todas las tablas, vistas y datos
2. **Base de Datos Ejecutándose**: PostgreSQL debe estar corriendo
3. **Conexión**: Las credenciales de base de datos en `00_db.js` deben ser correctas
4. **Permisos**: El usuario debe tener permisos CREATE INDEX y CREATE MATERIALIZED VIEW

---

## Inicio Rápido

```bash
# Navegar al directorio de scripts (donde están los scripts)
cd 3.vistas-y-procedimientos/database/scripts

# Ejecutar todos los scripts de optimización en orden
node 11_add_indexes.js
node 12_optimize_views.js
node 13_materialized_views.js
```

**Importante**: Los scripts deben ejecutarse desde el directorio `3.vistas-y-procedimientos/database/scripts/`.

---

## Verificación

### Verificar Índices Creados

```sql
-- Listar todos los índices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Verificar Vistas Optimizadas

```sql
-- Listar todas las vistas (originales + optimizadas)
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type IN ('VIEW', 'BASE TABLE')
ORDER BY table_name;
```

### Verificar Vistas Materializadas

```sql
-- Listar vistas materializadas
SELECT 
    schemaname,
    matviewname,
    hasindexes,
    ispopulated
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;
```

### Comparación de Rendimiento

```sql
-- Comparar vista original vs optimizada
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales;
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales_optimizada;

-- Comparar vista vs vista materializada
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales;
EXPLAIN ANALYZE SELECT * FROM mv_ventas_mensuales_resumen;
```

---

## Actualizar Vistas Materializadas

Las vistas materializadas necesitan actualización periódica para mantenerse actualizadas:

### Actualización Manual

```sql
-- Actualizar vista individual
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;

-- Actualizar todas las vistas materializadas
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_productos_resumen;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_segmentacion_clientes_resumen;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen;
```

### Actualización Automatizada (Recomendado)

#### Opción 1: Extensión pg_cron

```sql
-- Instalar pg_cron (si está disponible)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar actualización diaria a las 2 AM
SELECT cron.schedule(
    'refresh-ventas-mensuales',
    '0 2 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;'
);

-- Programar actualización por hora para inventario
SELECT cron.schedule(
    'refresh-inventario-critico',
    '0 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen;'
);
```

#### Opción 2: Cron Job (Linux/Mac)

```bash
# Agregar a crontab (crontab -e)
# Actualizar diariamente a las 2 AM
0 2 * * * psql -U postgres -d chamana_db_fase3 -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;"

# Actualizar por hora
0 * * * * psql -U postgres -d chamana_db_fase3 -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen;"
```

#### Opción 3: Script Node.js

Crear un script de actualización y ejecutarlo mediante cron o programador de tareas.

---

## Métricas de Rendimiento

### Antes de la Optimización

- Tiempo promedio de consulta: ~200-500ms
- Ejecución de vista: ~100-300ms
- Reportes complejos: ~500-1000ms

### Después de la Optimización (Esperado)

- Tiempo promedio de consulta: ~50-150ms (mejora del 60-70%)
- Ejecución de vista: ~30-100ms (mejora del 70%)
- Consultas de vista materializada: ~5-20ms (mejora del 95%)

---

## Solución de Problemas

### Error: "index already exists"

**Solución**: Los scripts usan `IF NOT EXISTS`, así que esto no debería pasar. Si ocurre, eliminar el índice primero:

```sql
DROP INDEX IF EXISTS idx_pedidos_cliente_id;
```

### Error: "materialized view already exists"

**Solución**: Eliminar y recrear:

```sql
DROP MATERIALIZED VIEW IF EXISTS mv_ventas_mensuales_resumen;
```

### Error: "REFRESH MATERIALIZED VIEW CONCURRENTLY requires unique index"

**Solución**: Los scripts crean índices únicos automáticamente. Si el error persiste, verificar:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'mv_ventas_mensuales_resumen';
```

### Actualización Lenta de Vista Materializada

**Solución**: 
- Actualizar durante horas de bajo tráfico
- Usar `CONCURRENTLY` para evitar bloqueos
- Considerar actualizar con menos frecuencia para vistas no críticas

---

## Reversión

Si necesitas eliminar las optimizaciones:

```sql
-- Eliminar todos los índices (¡ten cuidado!)
SELECT 'DROP INDEX IF EXISTS ' || indexname || ';'
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- Eliminar vistas optimizadas
DROP VIEW IF EXISTS vista_ventas_mensuales_optimizada;
DROP VIEW IF EXISTS vista_inventario_critico_optimizada;
DROP VIEW IF EXISTS vista_top_productos_optimizada;
DROP VIEW IF EXISTS vista_analisis_clientes_optimizada;
DROP VIEW IF EXISTS vista_rotacion_inventario_optimizada;

-- Eliminar vistas materializadas
DROP MATERIALIZED VIEW IF EXISTS mv_ventas_mensuales_resumen;
DROP MATERIALIZED VIEW IF EXISTS mv_top_productos_resumen;
DROP MATERIALIZED VIEW IF EXISTS mv_segmentacion_clientes_resumen;
DROP MATERIALIZED VIEW IF EXISTS mv_inventario_critico_resumen;
```

---

## Próximos Pasos

Después de completar la optimización de base de datos:

1. ✅ **Fase 4.1 Completa**: Optimización de Base de Datos
2. ⏭️ **Siguiente**: Fase 4.2 - Autenticación y Autorización
3. ⏭️ **Luego**: Fase 4.3 - Reportes y Visualización Mejorados

---

## Referencias

- [Documentación de Índices PostgreSQL](https://www.postgresql.org/docs/current/indexes.html)
- [Guía de Vistas Materializadas](https://www.postgresql.org/docs/current/sql-creatematerializedview.html)
- [Ajuste de Rendimiento de Consultas](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Creado**: 7 de Noviembre, 2025  
**Fase**: 4.1 - Optimización de Base de Datos  
**Estado**: Listo para Ejecutar
