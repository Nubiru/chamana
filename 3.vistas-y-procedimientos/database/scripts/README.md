# Phase 3 Database Migration Scripts - CHAMANA

**Project**: CHAMANA - E-commerce de Ropa Femenina  
**Phase**: 3. vistas-y-procedimientos (Tercera Forma Normal - 3NF + Views + Procedures + Triggers)  
**Database**: chamana_db_fase3  
**Date**: November 2025

---

## 📋 Overview

This directory contains migration scripts to create and populate the Phase 3 database following Third Normal Form (3NF) principles, plus advanced SQL features:

- **7 new tables** (3NF normalization)
- **5 Business Intelligence views**
- **3 stored procedures**
- **3 automatic triggers**
- **6 JOIN type demonstrations**

**Migration Path**: `chamana_db_fase2` → `chamana_db_fase3`

---

## 🗂️ Script Files

| Script                               | Purpose                                    | Duration | Transactional |
| ------------------------------------ | ------------------------------------------ | -------- | ------------- |
| `00_db.js`                           | Database configuration module             | -        | N/A           |
| `01_crear_database.js`               | Create chamana_db_fase3                    | <5s      | No            |
| `02_crear_tablas.js`                 | Create 19 tables (12 from Phase 2 + 7 new) | <15s     | Yes           |
| `03_insertar_datos_iniciales.js`    | Insert initial data for 3NF tables        | <5s      | Yes           |
| `04_migrar_datos_fase2.js`           | Migrate all data from Phase 2             | <30s     | Yes           |
| `05_crear_vistas.js`                 | Create 5 BI views                          | <5s      | Yes           |
| `06_crear_procedimientos.js`         | Create 3 stored procedures                 | <5s      | Yes           |
| `07_crear_triggers.js`               | Create 3 automatic triggers                | <5s      | Yes           |
| `08_demo_joins.sql`                  | Demonstrate 6 JOIN types                  | <10s     | No            |
| `09_verificar.js`                    | Verify implementation                      | <10s     | No            |

---

## 🚀 Quick Start

### Prerequisites

```bash
# 1. PostgreSQL 15+ running
pg_isready

# 2. Phase 2 database exists
psql -U postgres -l | grep chamana_db_fase2

# 3. Node.js 18+ installed
node --version

# 4. Install dependencies
cd 3.vistas-y-procedimientos/database/scripts
npm install
```

### Execute Migration

```bash
# Option A: Run all scripts at once
npm run all

# Option B: Run step by step (recommended for learning)
node 01_crear_database.js
node 02_crear_tablas.js
node 03_insertar_datos_iniciales.js
node 04_migrar_datos_fase2.js
node 05_crear_vistas.js
node 06_crear_procedimientos.js
node 07_crear_triggers.js
node 09_verificar.js

# Option C: Run migration only (no verification)
npm run migrate

# Option D: Run JOIN demonstrations
npm run joins
```

---

## 📊 What Gets Created

### Tables (19 total)

**Base Tables** (from Phase 2 - 12 tables):
1. `clientes` - Customer information
2. `categorias` - Product categories
3. `disenos` - Design names
4. `telas` - Fabric types
5. `años` - Years (2015-2025)
6. `temporadas` - Seasons (Verano, Invierno)
7. `colecciones` - Seasonal collections
8. `prendas` - Products (with stock management)
9. `pedidos` - Customer orders
10. `pedidos_prendas` - Order line items
11. `telas_temporadas` - Seasonal fabrics
12. `movimientos_inventario` - Inventory movements

**New Tables** (Phase 3 - 3NF - 7 tables):
13. `direcciones` - Customer addresses (normalized)
14. `tipos_prenda` - Garment types catalog
15. `estados_pedido` - Order state machine
16. `historial_estados_pedido` - Order state change audit
17. `proveedores` - Suppliers
18. `telas_proveedores` - Fabric-supplier relationships
19. `metodos_pago` - Payment methods

### Views (5 total)

1. `vista_ventas_mensuales` - Monthly sales analysis
2. `vista_inventario_critico` - Critical inventory alerts
3. `vista_top_productos` - Top selling products
4. `vista_analisis_clientes` - Customer segmentation
5. `vista_rotacion_inventario` - Inventory turnover analysis

### Stored Procedures (3 total)

1. `procesar_pedido(cliente_id, items_jsonb, descuento)` - Complete order processing
2. `reabastecer_inventario(prenda_id, cantidad, motivo)` - Restock inventory
3. `calcular_comision_vendedor(fecha_inicio, fecha_fin, porcentaje)` - Calculate commissions

### Triggers (3 total)

1. `trigger_track_order_state` - Tracks order state changes
2. `trigger_stock_alert` - Alerts on critical stock levels
3. `trigger_manage_default_address` - Manages default addresses

### JOIN Demonstrations (6 types)

1. **INNER JOIN** - Products sold last month
2. **LEFT JOIN** - All customers (with or without orders)
3. **RIGHT JOIN** - All categories (with or without products)
4. **FULL OUTER JOIN** - Complete fabric-season matrix
5. **CROSS JOIN** - Product planning combinations
6. **SELF JOIN** - Related products (same category)

---

## 🔍 Detailed Script Descriptions

### 01_crear_database.js

**Purpose**: Creates the Phase 3 database

**What it does**:
- Connects to `postgres` system database
- Terminates existing connections to `chamana_db_fase3` (if any)
- Drops `chamana_db_fase3` if it exists
- Creates fresh `chamana_db_fase3`

**Note**: Phase 2 database (`chamana_db_fase2`) remains untouched as backup.

---

### 02_crear_tablas.js

**Purpose**: Creates all 19 tables with 3NF schema

**What it does**:
- Creates 12 base tables (same structure as Phase 2)
- Creates 7 new tables for 3NF normalization:
  - `direcciones` - Eliminates transitive dependency from `clientes`
  - `tipos_prenda` - Eliminates transitive dependency from `prendas`
  - `estados_pedido` - Normalized state machine
  - `historial_estados_pedido` - Audit trail
  - `proveedores` - Supplier management
  - `telas_proveedores` - Fabric-supplier relationships
  - `metodos_pago` - Payment methods catalog
- Creates indexes for performance

---

### 03_insertar_datos_iniciales.js

**Purpose**: Inserts initial data for new 3NF tables

**What it does**:
- Inserts 5 garment types (`tipos_prenda`)
- Inserts 7 order states (`estados_pedido`)
- Inserts 3 sample suppliers (`proveedores`)
- Inserts 5 payment methods (`metodos_pago`)

---

### 04_migrar_datos_fase2.js

**Purpose**: Migrates all data from Phase 2 to Phase 3

**What it does**:
- Migrates all base tables (clientes, categorias, disenos, telas, etc.)
- Migrates prendas with stock data
- Migrates pedidos, pedidos_prendas, telas_temporadas, movimientos_inventario
- Migrates to new 3NF tables:
  - Creates `direcciones` from `clientes.direccion`
  - Creates initial `historial_estados_pedido` records
- Updates all sequences

---

### 05_crear_vistas.js

**Purpose**: Creates 5 Business Intelligence views

**Views created**:
1. `vista_ventas_mensuales` - Monthly sales grouped by month
2. `vista_inventario_critico` - Stock alerts with categorization
3. `vista_top_productos` - Top selling products by revenue
4. `vista_analisis_clientes` - Customer segmentation (VIP, Active, Inactive)
5. `vista_rotacion_inventario` - Inventory turnover analysis

---

### 06_crear_procedimientos.js

**Purpose**: Creates 3 stored procedures

**Procedures created**:
1. `procesar_pedido` - Validates stock, creates order, updates inventory
2. `reabastecer_inventario` - Restocks with audit trail
3. `calcular_comision_vendedor` - Calculates daily sales commissions

---

### 07_crear_triggers.js

**Purpose**: Creates 3 automatic triggers

**Triggers created**:
1. `trigger_track_order_state` - Automatically logs state changes in `historial_estados_pedido`
2. `trigger_stock_alert` - Generates alerts when stock reaches critical levels
3. `trigger_manage_default_address` - Ensures only one default address per type

---

### 08_demo_joins.sql

**Purpose**: Demonstrates 6 types of SQL JOINs

**JOIN types demonstrated**:
1. **INNER JOIN** - Products sold last month
2. **LEFT JOIN** - All customers (with or without orders)
3. **RIGHT JOIN** - All categories (with or without products)
4. **FULL OUTER JOIN** - Complete fabric-season matrix
5. **CROSS JOIN** - Product planning combinations
6. **SELF JOIN** - Related products comparison

**Usage**:
```bash
psql -U postgres -d chamana_db_fase3 -f 08_demo_joins.sql
```

---

### 09_verificar.js

**Purpose**: Verifies Phase 3 implementation

**What it checks**:
- All 19 tables exist
- All 5 views are created and functional
- All 3 procedures exist
- All 3 triggers are active
- Data migration successful
- Sample queries work

---

## 🎯 Key Features

### 3NF Normalization

- **Eliminates transitive dependencies**:
  - `clientes` → `direcciones` (address normalization)
  - `prendas` → `tipos_prenda` (garment type normalization)
  - `pedidos.estado` → `estados_pedido` (state machine normalization)

### Business Intelligence

- **5 comprehensive views** for reporting and analytics
- **Customer segmentation** (VIP, Active, Inactive, New)
- **Inventory alerts** with automatic categorization
- **Sales analysis** by month, product, customer

### Automation

- **3 triggers** for automatic data management
- **State change tracking** with full audit trail
- **Stock alerts** when inventory is low
- **Default address management** (one per type)

### Advanced SQL

- **6 JOIN types** demonstrated with real-world examples
- **Stored procedures** for complex business logic
- **JSONB support** in procedures for flexible data handling

---

## 📈 Success Metrics

After running `09_verificar.js`, you should see:

- ✅ 19/19 tables created
- ✅ 5/5 views functional
- ✅ 3/3 procedures available
- ✅ 3/3 triggers active
- ✅ Data migration successful

---

## 🔧 Troubleshooting

### Database Already Exists

```bash
# Manual cleanup
psql -U postgres -c "DROP DATABASE IF EXISTS chamana_db_fase3;"
```

### Migration Fails

1. Check Phase 2 database exists: `psql -U postgres -l | grep chamana_db_fase2`
2. Verify Phase 2 has data: `psql -U postgres -d chamana_db_fase2 -c "SELECT COUNT(*) FROM prendas;"`
3. Check PostgreSQL logs for detailed errors

### Views Don't Work

1. Verify all tables exist: `psql -U postgres -d chamana_db_fase3 -c "\dt"`
2. Check view definitions: `psql -U postgres -d chamana_db_fase3 -c "\dv"`
3. Test individual views: `SELECT * FROM vista_ventas_mensuales LIMIT 5;`

### Triggers Not Firing

1. Verify triggers exist: `psql -U postgres -d chamana_db_fase3 -c "SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';"`
2. Check trigger functions: `psql -U postgres -d chamana_db_fase3 -c "\df"`
3. Test manually: Update a pedido.estado and check historial_estados_pedido

---

## 📚 Next Steps

After Phase 3 is complete:

1. **Test stored procedures**:
   ```sql
   SELECT procesar_pedido(1, '[{"prenda_id": 1, "cantidad": 2}]'::JSONB, 0);
   SELECT reabastecer_inventario(1, 10, 'Reposición semanal');
   SELECT * FROM calcular_comision_vendedor('2024-01-01', '2024-01-31', 5.0);
   ```

2. **Query views**:
   ```sql
   SELECT * FROM vista_ventas_mensuales;
   SELECT * FROM vista_inventario_critico WHERE estado_stock = 'CRITICO';
   SELECT * FROM vista_top_productos LIMIT 10;
   ```

3. **Test triggers**:
   ```sql
   -- Update order state (should trigger historial)
   UPDATE pedidos SET estado = 'confirmado' WHERE id = 1;
   
   -- Check historial
   SELECT * FROM historial_estados_pedido WHERE pedido_id = 1;
   ```

4. **Run JOIN demonstrations**:
   ```bash
   npm run joins
   ```

---

## 📝 Notes

- All scripts use transactions for atomicity (all or nothing)
- Phase 2 database is never modified (safe backup)
- All sequences are properly updated after migration
- Views are automatically refreshed when underlying data changes
- Triggers fire automatically on INSERT/UPDATE operations

---

**Last Updated**: November 2025  
**Author**: Gabriel Osemberg + Claude  
**License**: MIT

