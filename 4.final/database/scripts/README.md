# Phase 4: Database Optimization Scripts

**Status**: Ready to Execute  
**Created**: November 7, 2025  
**Phase**: 4.1 - Database Optimization  
**Location**: Scripts are in `3.vistas-y-procedimientos/database/scripts/`

---

## Overview

This document describes the Phase 4 database optimization scripts. These scripts improve query performance by:

1. **Adding indexes** on frequently queried columns
2. **Optimizing views** with better JOIN strategies
3. **Creating materialized views** for heavy reports

**Expected Performance Improvement**: 50%+ faster queries

**Note**: The actual scripts are located in `3.vistas-y-procedimientos/database/scripts/` because they operate on the Phase 3 database.

---

## Scripts

### 11_add_indexes.js

Creates 23 indexes on frequently queried columns:

- **Foreign Key Indexes** (11): For JOIN operations
- **Filter Indexes** (5): For WHERE clauses
- **Composite Indexes** (3): For multi-column queries
- **Partial Indexes** (3): For filtered queries
- **Text Search Indexes** (1): For full-text search

**Execution Time**: ~30 seconds  
**Impact**: High - improves all query performance

### 12_optimize_views.js

Creates optimized versions of existing views:

- `vista_ventas_mensuales_optimizada`
- `vista_inventario_critico_optimizada`
- `vista_top_productos_optimizada`
- `vista_analisis_clientes_optimizada`
- `vista_rotacion_inventario_optimizada`

**Improvements**:
- INNER JOIN instead of JOIN
- Pre-applied WHERE filters
- HAVING clauses for aggregations
- Better ORDER BY strategies

**Execution Time**: ~10 seconds  
**Impact**: Medium - improves view query performance

### 13_materialized_views.js

Creates 4 materialized views for heavy reports:

- `mv_ventas_mensuales_resumen` - Refresh daily
- `mv_top_productos_resumen` - Refresh daily
- `mv_segmentacion_clientes_resumen` - Refresh weekly
- `mv_inventario_critico_resumen` - Refresh hourly

**Execution Time**: ~1-2 minutes (depends on data volume)  
**Impact**: Very High - instant queries on pre-computed data

---

## Execution Order

**Important**: Execute scripts in this exact order:

```bash
# 1. Add indexes first (foundation for optimization)
node 11_add_indexes.js

# 2. Optimize views (uses indexes from step 1)
node 12_optimize_views.js

# 3. Create materialized views (uses optimized queries)
node 13_materialized_views.js
```

---

## Prerequisites

1. **Phase 3 Complete**: Database must have all tables, views, and data
2. **Database Running**: PostgreSQL must be running
3. **Connection**: Database credentials in `00_db.js` must be correct
4. **Permissions**: User must have CREATE INDEX and CREATE MATERIALIZED VIEW permissions

---

## Quick Start

```bash
# Navigate to scripts directory (where scripts are located)
cd 3.vistas-y-procedimientos/database/scripts

# Run all optimization scripts in order
node 11_add_indexes.js
node 12_optimize_views.js
node 13_materialized_views.js
```

**Important**: Scripts must be run from `3.vistas-y-procedimientos/database/scripts/` directory.

---

## Verification

### Check Indexes Created

```sql
-- List all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check Optimized Views

```sql
-- List all views (original + optimized)
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type IN ('VIEW', 'BASE TABLE')
ORDER BY table_name;
```

### Check Materialized Views

```sql
-- List materialized views
SELECT 
    schemaname,
    matviewname,
    hasindexes,
    ispopulated
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;
```

### Performance Comparison

```sql
-- Compare original vs optimized view
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales;
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales_optimizada;

-- Compare view vs materialized view
EXPLAIN ANALYZE SELECT * FROM vista_ventas_mensuales;
EXPLAIN ANALYZE SELECT * FROM mv_ventas_mensuales_resumen;
```

---

## Refresh Materialized Views

Materialized views need periodic refresh to stay current:

### Manual Refresh

```sql
-- Refresh single view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;

-- Refresh all materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_productos_resumen;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_segmentacion_clientes_resumen;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen;
```

### Automated Refresh (Recommended)

#### Option 1: pg_cron Extension

```sql
-- Install pg_cron (if available)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh at 2 AM
SELECT cron.schedule(
    'refresh-ventas-mensuales',
    '0 2 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;'
);

-- Schedule hourly refresh for inventory
SELECT cron.schedule(
    'refresh-inventario-critico',
    '0 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen;'
);
```

#### Option 2: Cron Job (Linux/Mac)

```bash
# Add to crontab (crontab -e)
# Refresh daily at 2 AM
0 2 * * * psql -U postgres -d chamana_db_fase3 -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_mensuales_resumen;"

# Refresh hourly
0 * * * * psql -U postgres -d chamana_db_fase3 -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventario_critico_resumen;"
```

#### Option 3: Node.js Script

Create a refresh script and run it via cron or task scheduler.

---

## Performance Metrics

### Before Optimization

- Average query time: ~200-500ms
- View execution: ~100-300ms
- Complex reports: ~500-1000ms

### After Optimization (Expected)

- Average query time: ~50-150ms (60-70% improvement)
- View execution: ~30-100ms (70% improvement)
- Materialized view queries: ~5-20ms (95% improvement)

---

## Troubleshooting

### Error: "index already exists"

**Solution**: Scripts use `IF NOT EXISTS`, so this shouldn't happen. If it does, drop the index first:

```sql
DROP INDEX IF EXISTS idx_pedidos_cliente_id;
```

### Error: "materialized view already exists"

**Solution**: Drop and recreate:

```sql
DROP MATERIALIZED VIEW IF EXISTS mv_ventas_mensuales_resumen;
```

### Error: "REFRESH MATERIALIZED VIEW CONCURRENTLY requires unique index"

**Solution**: Scripts create unique indexes automatically. If error persists, check:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'mv_ventas_mensuales_resumen';
```

### Slow Materialized View Refresh

**Solution**: 
- Refresh during off-peak hours
- Use `CONCURRENTLY` to avoid locking
- Consider refreshing less frequently for non-critical views

---

## Rollback

If you need to remove optimizations:

```sql
-- Drop all indexes (be careful!)
SELECT 'DROP INDEX IF EXISTS ' || indexname || ';'
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- Drop optimized views
DROP VIEW IF EXISTS vista_ventas_mensuales_optimizada;
DROP VIEW IF EXISTS vista_inventario_critico_optimizada;
DROP VIEW IF EXISTS vista_top_productos_optimizada;
DROP VIEW IF EXISTS vista_analisis_clientes_optimizada;
DROP VIEW IF EXISTS vista_rotacion_inventario_optimizada;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_ventas_mensuales_resumen;
DROP MATERIALIZED VIEW IF EXISTS mv_top_productos_resumen;
DROP MATERIALIZED VIEW IF EXISTS mv_segmentacion_clientes_resumen;
DROP MATERIALIZED VIEW IF EXISTS mv_inventario_critico_resumen;
```

---

## Next Steps

After completing database optimization:

1. ✅ **Phase 4.1 Complete**: Database Optimization
2. ⏭️ **Next**: Phase 4.2 - Authentication & Authorization
3. ⏭️ **Then**: Phase 4.3 - Enhanced Reporting & Visualization

---

## References

- [PostgreSQL Indexes Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Materialized Views Guide](https://www.postgresql.org/docs/current/sql-creatematerializedview.html)
- [Query Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Created**: November 7, 2025  
**Phase**: 4.1 - Database Optimization  
**Status**: Ready to Execute

