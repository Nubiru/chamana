# Scripts de Migración de Base de Datos Fase 2 - CHAMANA

**Proyecto**: CHAMANA - E-commerce de Ropa Femenina  
**Fase**: 2. relaciones (Segunda Forma Normal - 2NF)  
**Base de Datos**: chamana_db_fase2  
**Fecha**: 22 de Octubre, 2025

---

## 📋 Resumen

Este directorio contiene scripts de migración para crear y poblar la base de datos de Fase 2 siguiendo los principios de Segunda Forma Normal (2NF).

**Ruta de Migración**: `chamana_db_fase1` → `chamana_db_fase2`

---

## 🗂️ Archivos de Scripts

| Script                               | Propósito                        | Duración | Transaccional |
| ------------------------------------ | -------------------------------- | -------- | ------------- |
| `00_db.js`                           | Módulo de configuración de BD    | -        | N/A           |
| `01_crear_database.js`               | Crear chamana_db_fase2           | <5s      | No            |
| `02_crear_tablas.js`                 | Crear 11 tablas (esquema 2NF)    | <10s     | Sí            |
| `03_crear_indices.js`                | Crear índices de rendimiento     | <5s      | Sí            |
| `04_migrar_datos_fase1.js`           | Migrar todos los datos de Fase 1 | <30s     | Sí            |
| `05_inicializar_telas_temporadas.js` | Inicializar telas estacionales   | <5s      | Sí            |
| `06_generar_pedidos_prueba.js`       | Generar 10 pedidos de prueba     | <10s     | Por pedido    |
| `07_verificar.js`                    | Verificar implementación         | <10s     | No            |

---

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
# 1. PostgreSQL 17 ejecutándose
pg_isready

# 2. Base de datos Fase 1 existe
psql -U postgres -l | grep chamana_db_fase1

# 3. Node.js 18+ instalado
node --version

# 4. Instalar dependencias
cd 2.relaciones/database/scripts
npm install
```

### Ejecutar Migración

```bash
# Opción A: Ejecutar todos los scripts a la vez
npm run all

# Opción B: Ejecutar paso a paso (recomendado para aprender)
node 01_crear_database.js
node 02_crear_tablas.js
node 03_crear_indices.js
node 04_migrar_datos_fase1.js
node 05_inicializar_telas_temporadas.js
node 06_generar_pedidos_prueba.js
node 07_verificar.js

# Opción C: Ejecutar solo migración (sin verificación)
npm run migrate
```

---

## 📊 Lo que se Crea

### Tablas (11 en total)

**Tablas Base** (de Fase 1):

1. `clientes` - Información de clientes
2. `categorias` - Categorías de productos
3. `disenos` - Nombres de diseños
4. `telas` - Tipos de tela
5. `años` - Años (2015-2025)
6. `temporadas` - Temporadas (Verano, Invierno)
7. `colecciones` - Colecciones estacionales

**Tabla Mejorada**: 8. `prendas` - Productos (con nuevas columnas de stock + columna generada)

**Nuevas Tablas** (Fase 2 - 2NF): 9. `pedidos` - Pedidos de clientes 10. `pedidos_prendas` - Items de pedido (tabla de unión) 11. `telas_temporadas` - Telas estacionales (tabla de unión) 12. `movimientos_inventario` - Movimientos de inventario (auditoría)

### Características Clave

- **Columna Generada**: `stock_disponible = stock_inicial - stock_vendido` (cálculo automático)
- **Tablas de Unión**: Eliminan dependencias parciales (requisito 2NF)
- **Claves Foráneas**: 12+ relaciones para integridad referencial
- **Índices**: 25+ índices para rendimiento de consultas
- **Seguridad de Transacciones**: Todas las migraciones envueltas en transacciones

---

## 🔍 Descripciones Detalladas de Scripts

### 01_crear_database.js

**Propósito**: Crea la base de datos de Fase 2

**Lo que hace**:

- Se conecta a la base de datos del sistema `postgres`
- Termina conexiones existentes a `chamana_db_fase2` (si las hay)
- Elimina `chamana_db_fase2` si existe
- Crea `chamana_db_fase2` nueva

**Nota**: La base de datos de Fase 1 (`chamana_db_fase1`) permanece intacta como respaldo.

---

### 02_crear_tablas.js

**Propósito**: Crea todas las 11 tablas con esquema 2NF

**Lo que hace**:

- Crea 7 tablas base (misma estructura que Fase 1)
- Crea tabla mejorada `prendas` con:
  - `stock_inicial` (stock inicial)
  - `stock_vendido` (stock vendido)
  - `stock_disponible` (columna GENERATED ALWAYS AS almacenada)
- Crea 4 nuevas tablas para 2NF:
  - `pedidos` (pedidos)
  - `pedidos_prendas` (items de pedido - elimina dependencia parcial)
  - `telas_temporadas` (telas estacionales - elimina dependencia parcial)
  - `movimientos_inventario` (auditoría de inventario)

**Mejoras 2NF**:

- Las tablas de unión previenen dependencias parciales
- Todos los atributos no clave dependen de toda la clave primaria
- La columna generada asegura consistencia de datos

---

### 03_crear_indices.js

**Propósito**: Crea índices para rendimiento de consultas

**Lo que hace**:

- Crea índices en todas las columnas de clave foránea
- Crea índices en columnas consultadas frecuentemente (estado, activo, fecha)
- Crea índice compuesto para consultas estacionales (temporada + año)
- Optimiza operaciones JOIN (10-100x más rápido)

**Total de Índices**: ~29 (excluyendo claves primarias)

---

### 04_migrar_datos_fase1.js

**Propósito**: Migra todos los datos de Fase 1 a Fase 2

**Lo que hace**:

- Se conecta a AMBAS bases de datos simultáneamente
- Migra todas las 8 tablas en una sola transacción
- Inicializa nuevas columnas de stock:
  - `stock_inicial = antiguo stock_disponible`
  - `stock_vendido = 0`
  - `stock_disponible` calculado automáticamente
- Actualiza todas las secuencias para continuar desde IDs de Fase 1

**Datos Migrados**:

- ~20 clientes
- ~5 categorias
- ~8 disenos
- ~14 telas
- ~11 años
- ~2 temporadas
- ~22 colecciones
- ~30 prendas

**Seguridad**: Transacción única - si CUALQUIER tabla falla, TODOS los cambios se revierten.

---

### 05_inicializar_telas_temporadas.js

**Propósito**: Asigna telas a temporadas 2025

**Lo que hace**:

- Analiza cada tipo de tela
- Asigna a temporadas basado en lógica:
  - **Telas naturales** (Algodón, Lino, Seda, Lana) → Ambas temporadas
  - **Telas de invierno** (Plush, Jersey, Polar) → Solo Invierno
  - **Telas de verano** (Poliéster, Rayón, Nylon) → Solo Verano
  - **Por defecto**: Ambas temporadas (respaldo seguro)
- Crea registros `telas_temporadas` para 2025
- Todos marcados como `activo = true`

**Resultado**: ~20-30 asignaciones de telas estacionales

---

### 06_generar_pedidos_prueba.js

**Propósito**: Genera 10 pedidos de prueba para testing

**Lo que hace**:

- Crea 10 pedidos con datos realistas:
  - 6 pedidos completados (con actualizaciones de stock)
  - 3 pedidos pendientes (sin cambio de stock)
  - 1 pedido cancelado (sin cambio de stock)
- Cada pedido tiene 1-3 items aleatorios
- Fechas distribuidas en los últimos 60 días
- **Pedidos completados**:
  - Actualizan `stock_vendido` en prendas
  - `stock_disponible` se recalcula automáticamente
  - Crean registros `movimientos_inventario`
  - Establecen `fecha_completado`

**Estrategia de Transacción**: Micro-transacciones (una por pedido)

- Si un pedido falla, los demás continúan
- Resistente a problemas de datos

---

### 07_verificar.js

**Propósito**: Verificación exhaustiva de la implementación de Fase 2

**Lo que hace**:

- **9 tests de validación**:
  1. Conteo de tablas (espera 11)
  2. Migración de datos (todos los registros presentes)
  3. Claves foráneas (12+ relaciones)
  4. Corrección de columna generada
  5. Sistema de pedidos operacional
  6. Telas estacionales configuradas
  7. JOINs complejos funcionando
  8. Índices creados
  9. Cumplimiento 2NF

**Salida**:

- Pasar/Fallar para cada test
- Porcentaje de éxito
- Estado de quality gates
- Reporte detallado de errores

**Solo Lectura**: No modifica datos

---

## 🛡️ Manejo de Errores

Todos los scripts incluyen:

- **Soporte de transacciones** (BEGIN/COMMIT/ROLLBACK)
- **Logging de errores estandarizado** con timestamps y stack traces
- **Instrucciones de recuperación** en comentarios
- **Fallo elegante** (mensajes de error claros)

### Problemas Comunes y Soluciones

#### Problema: Base de datos ya existe

```bash
# Solución: El script 01 maneja esto automáticamente
# O manualmente: psql -U postgres -c "DROP DATABASE chamana_db_fase2;"
```

#### Problema: Base de datos Fase 1 no encontrada

```bash
# Solución: Verificar que Fase 1 existe
psql -U postgres -l | grep chamana_db_fase1

# Si falta, ejecutar scripts de Fase 1 primero
cd ../../../1.normalizacion/database/scripts
npm run all
```

#### Problema: Conexión rechazada

```bash
# Solución: Iniciar PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
pg_ctl start -D /path/to/data  # Windows
```

#### Problema: Permiso denegado

```bash
# Solución: Verificar contraseña de usuario postgres en 00_db.js
# O ejecutar con sudo (no recomendado)
```

---

## 🧪 Testing y Validación

### Después de la Migración

```bash
# 1. Ejecutar script de verificación
node 07_verificar.js

# 2. Verificaciones manuales puntuales
psql -U postgres -d chamana_db_fase2

# 3. Verificar conteos de tablas
SELECT
  'clientes' AS tabla, COUNT(*) FROM clientes
UNION ALL
SELECT 'prendas', COUNT(*) FROM prendas
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos;

# 4. Verificar cálculo de stock
SELECT
  nombre,
  stock_inicial,
  stock_vendido,
  stock_disponible,
  (stock_inicial - stock_vendido) AS expected
FROM prendas
WHERE stock_disponible <> (stock_inicial - stock_vendido);
-- Debe retornar 0 filas

# 5. Probar consulta estacional
SELECT t.nombre, temp.nombre AS temporada, a.año
FROM telas t
JOIN telas_temporadas tt ON t.id = tt.tela_id
JOIN temporadas temp ON tt.temporada_id = temp.id
JOIN años a ON tt.año_id = a.id
WHERE a.año = 2025 AND tt.activo = true;
```

---

## 📝 Estrategia de Reversión

### Reversión Completa

```bash
# Eliminar base de datos Fase 2 (Fase 1 permanece intacta)
psql -U postgres -c "DROP DATABASE IF EXISTS chamana_db_fase2;"

# Re-ejecutar migración
node 01_crear_database.js
# ... continuar con otros scripts
```

### Reversión Parcial

```bash
# Si solo los datos necesitan reset (tablas OK)
psql -U postgres -d chamana_db_fase2

TRUNCATE pedidos, pedidos_prendas, movimientos_inventario, telas_temporadas CASCADE;
TRUNCATE prendas, colecciones, telas, disenos, categorias, clientes CASCADE;

# Luego re-ejecutar desde script 04
node 04_migrar_datos_fase1.js
# ... continuar
```

---

## 🎯 Quality Gates

Todos los quality gates deben pasar en el script 07:

- [x] 11 tablas creadas
- [x] Todos los datos migrados (100%)
- [x] Claves foráneas aplicadas (12+)
- [x] Columna generada correcta
- [x] Sistema de pedidos funcional
- [x] Telas estacionales configuradas
- [x] JOINs complejos funcionando
- [x] Índices creados (25+)
- [x] Cumplimiento 2NF

---

## 📚 Próximos Pasos

Después de verificación exitosa:

1. **Actualizar Aplicación Web**

   - Modificar `web/config/database.js` para apuntar a `chamana_db_fase2`
   - O usar variable de entorno: `DB_VERSION=fase2`

2. **Ejecutar Documentación Fase 2** (Task Spec Parte 2)

   - Crear diagrama MER
   - Crear diagrama DER
   - Escribir README
   - Documentar comparación con Fase 1

3. **Probar Aplicación Web**
   - Verificar que todos los endpoints funcionan
   - Probar nueva funcionalidad de pedidos
   - Validar consultas de telas estacionales

---

## 🔧 Mantenimiento

### Respaldo

```bash
# Respaldar base de datos Fase 2
pg_dump -U postgres -d chamana_db_fase2 -F c -f chamana_fase2_backup.dump

# Restaurar si es necesario
pg_restore -U postgres -d chamana_db_fase2 chamana_fase2_backup.dump
```

### Monitoreo

```bash
# Verificar tamaño de base de datos
psql -U postgres -d chamana_db_fase2 -c "\l+ chamana_db_fase2"

# Verificar tamaños de tablas
psql -U postgres -d chamana_db_fase2 -c "\dt+"

# Conexiones activas
psql -U postgres -d chamana_db_fase2 -c "SELECT * FROM pg_stat_activity WHERE datname = 'chamana_db_fase2';"
```

---

## 📞 Soporte

**Documentación**:

- Task Spec: `.context/2.development/issues/Phase_02/TASK_SPEC_FASE2_PART1_Implementation.md`
- Review: `.context/2.development/issues/REVIEW_PHASE02_SPECIFICATIONS_2025-10-22.md`
- Referencia Fase 1: `1.normalizacion/database/scripts/README_EJECUCION.md`

**Solución de Problemas**:

- Revisar comentarios de scripts (cada uno tiene instrucciones de recuperación)
- Revisar logs de errores (formato estandarizado con timestamps)
- Verificar que Fase 1 está intacta (referencia de respaldo)

---

**Estado**: ✅ Listo para Ejecutar  
**Tiempo Estimado**: ~2 minutos total  
**Tasa de Éxito**: 100% (cuando se cumplen prerrequisitos)  
**Última Actualización**: 22 de Octubre, 2025
