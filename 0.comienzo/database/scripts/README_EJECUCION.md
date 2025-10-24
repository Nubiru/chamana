# Guía de Ejecución - Scripts de Base de Datos CHAMANA

**Proyecto**: CHAMANA E-commerce - Fase 0  
**Fecha**: Octubre 2025  
**Propósito**: Configurar base de datos PostgreSQL usando JavaScript

---

## 📋 Requisitos Previos

### Software Necesario

1. **Node.js** (v14 o superior)

   - Verificar: `node --version`
   - Descargar: https://nodejs.org/

2. **PostgreSQL** (v12 o superior)

   - Verificar: `psql --version`
   - El servicio debe estar ejecutándose
   - Windows: Verificar en "Servicios" que PostgreSQL esté activo

3. **pgAdmin 4** (opcional pero recomendado)
   - Para visualización gráfica de la base de datos

### Configuración Inicial

1. **Instalar dependencias de Node.js**:

   ```powershell
   cd 0.comienzo/database/scripts
   npm install
   ```

2. **Configurar credenciales de PostgreSQL**:
   - Editar archivo `00_db.js`
   - Cambiar `password: 'password'` por tu contraseña de PostgreSQL
   - Verificar usuario (por defecto: `postgres`)
   - Verificar puerto (por defecto: `5432`)

---

## 🚀 Orden de Ejecución

### **IMPORTANTE**: Ejecutar los scripts en este orden exacto

Los scripts están numerados para facilitar la secuencia correcta:

```
01 → 02 → 03 → 04 → 05 → 06
```

---

## 📝 Paso a Paso

### Script 01: Crear Base de Datos

**Comando**:

```powershell
node 01_crear_database.js
```

**¿Qué hace?**:

- Conecta a PostgreSQL (base de datos por defecto)
- Elimina `chamana_db_fase0` si ya existe (limpieza)
- Crea nueva base de datos `chamana_db_fase0`

**Salida esperada**:

```
=====================================================
🗄️  CHAMANA - Creación de Base de Datos
=====================================================

📌 Creando nueva base de datos "chamana_db_fase0"...
✅ Base de datos "chamana_db_fase0" creada exitosamente!

=====================================================
✨ Siguiente paso: Ejecutar "node 02_crear_tablas.js"
=====================================================
```

**Errores comunes**:

- `connection refused`: PostgreSQL no está ejecutándose
- `authentication failed`: Contraseña incorrecta en `00_db.js`
- `permission denied`: Usuario no tiene permisos para crear bases de datos

---

### Script 02: Crear Tablas

**Comando**:

```powershell
node 02_crear_tablas.js
```

**¿Qué hace?**:

- Crea tabla `clientes` (7 columnas - simplificada)
- Crea tabla `categorias` (4 columnas)
- Crea tabla `prendas` (10 columnas - pre-normalizada)
- Crea índices para mejorar rendimiento

**Estructura de tablas**:

**`clientes`** (información básica de comunicación):

- `id`, `nombre`, `apellido`, `email`, `telefono`, `fecha_registro`, `activo`

**`categorias`** (tipos de prendas):

- `id`, `nombre`, `descripcion`, `activa`

**`prendas`** (catálogo de productos):

- `id`, `nombre_completo`, `tipo`, `tela_nombre`, `precio_chamana`, `precio_arro`, `stock`, `categoria_id`, `activa`, `fecha_creacion`

**Salida esperada**:

```
=====================================================
📋 CHAMANA - Creación de Tablas (Fase 0)
=====================================================

📌 Creando tabla "clientes" (simplificada)...
✅ Tabla "clientes" creada (7 columnas - solo comunicación)

📌 Creando tabla "categorias"...
✅ Tabla "categorias" creada

📌 Creando tabla "prendas" (pre-normalizada)...
✅ Tabla "prendas" creada (estructura pre-normalizada)

📌 Creando índices...
✅ Índices creados

=====================================================
✨ Tablas creadas exitosamente!
   - clientes (7 columnas - simplificada)
   - categorias (4 columnas)
   - prendas (10 columnas - pre-normalizada)
=====================================================
```

---

### Script 03: Insertar Categorías

**Comando**:

```powershell
node 03_insertar_categorias.js
```

**¿Qué hace?**:

- Inserta 5 categorías reales de CHAMANA:
  1. Buzo
  2. Remera
  3. Vestido
  4. Palazzo
  5. Pantalón

**Salida esperada**:

```
=====================================================
📁 CHAMANA - Inserción de Categorías
=====================================================

📌 Insertando 5 categorías reales de CHAMANA...

✅ Categoría insertada: "Buzo" (ID: 1)
✅ Categoría insertada: "Remera" (ID: 2)
✅ Categoría insertada: "Vestido" (ID: 3)
✅ Categoría insertada: "Palazzo" (ID: 4)
✅ Categoría insertada: "Pantalón" (ID: 5)

📊 Resumen de categorías:
   1. Buzo
   2. Remera
   3. Vestido
   4. Palazzo
   5. Pantalón

=====================================================
✨ Categorías insertadas exitosamente!
   Total: 5 categorías
=====================================================
```

---

### Script 04: Insertar Prendas Reales

**Comando**:

```powershell
node 04_insertar_prendas_real.js
```

**¿Qué hace?**:

- Inserta **31 productos reales** del catálogo CHAMANA
- Datos extraídos de `1.normalizacion/prendas.png` y `telas.png`
- Incluye precios reales, stock, telas y diseños auténticos

**Productos incluidos**:

- **Buzos**: Gaia, Nube, Tormenta (múltiples combinaciones de telas)
- **Remeras**: Nube, Rocio, Brisa
- **Vestidos**: Aire
- **Palazzos**: Corteza (múltiples telas)
- **Pantalones**: Raiz (múltiples telas)

**Salida esperada**:

```
=====================================================
👗 CHAMANA - Inserción de Prendas Reales
=====================================================

📌 Insertando 31 prendas del catálogo real...

✅ 10 prendas insertadas...
✅ 20 prendas insertadas...
✅ 30 prendas insertadas...

✅ Proceso completado: 31 prendas insertadas

📊 Resumen por categoría:
   Buzo: 12 productos, Stock total: 18, Precio promedio: $41666.67
   Remera: 4 productos, Stock total: 7, Precio promedio: $10000.00
   Vestido: 1 productos, Stock total: 1, Precio promedio: $27000.00
   Palazzo: 8 productos, Stock total: 11, Precio promedio: $32500.00
   Pantalón: 4 productos, Stock total: 7, Precio promedio: $40000.00

   TOTAL: 31 prendas en catálogo
=====================================================
```

---

### Script 05: Insertar Clientes Ficticios

**Comando**:

```powershell
node 05_insertar_clientes.js
```

**¿Qué hace?**:

- Inserta 20 clientes ficticios
- Nombres mexicanos realistas
- Emails y teléfonos ficticios
- Datos de prueba para desarrollo

**Salida esperada**:

```
=====================================================
👥 CHAMANA - Inserción de Clientes Ficticios
=====================================================

📌 Insertando 20 clientes ficticios...

✅ Cliente insertado: María García López (ID: 1)
✅ Cliente insertado: Ana Martínez Rodríguez (ID: 2)
...
✅ 20 clientes insertados correctamente

📋 Muestra de clientes registrados:
   1. María García López | maria.garcia@email.com | 555-0101
   2. Ana Martínez Rodríguez | ana.martinez@email.com | 555-0102
   ...

   TOTAL: 20 clientes
=====================================================
```

---

### Script 06: Listar y Verificar Todo

**Comando**:

```powershell
node 06_listar_todo.js
```

**¿Qué hace?**:

- Lista todas las categorías
- Muestra 10 prendas de ejemplo
- Muestra 10 clientes de ejemplo
- Presenta estadísticas generales
- Verifica que todo esté correcto

**Salida esperada**:

```
=====================================================
📊 CHAMANA - Verificación de Datos
=====================================================

📁 CATEGORÍAS:
─────────────────────────────────────────────────────
1. Buzo
   Buzos de algodón y mezclas cómodas...
   Estado: ✅ Activa
...

👗 PRENDAS (Muestra de 10):
─────────────────────────────────────────────────────
1. Gaia - Jersey Bordó
   Tipo: Buzo | Categoría: Buzo
   Tela: Jersey Bordó
   Precio CHAMANA: $40,000
   Precio Arro: $34,000 (15% desc)
   Stock: 1 unidades
...

👥 CLIENTES (Muestra de 10):
─────────────────────────────────────────────────────
1. María García López ✅
   Email: maria.garcia@email.com
   Teléfono: 555-0101
...

📊 ESTADÍSTICAS GENERALES:
─────────────────────────────────────────────────────
📁 Categorías: 5
👗 Prendas: 31
👥 Clientes: 20

📦 Stock total: 44 unidades
💰 Precio promedio: $30,645.16
💵 Precio mínimo: $10,000
💎 Precio máximo: $50,000

📊 Distribución por categoría:
   Buzo: 12 productos (18 unidades)
   Palazzo: 8 productos (11 unidades)
   Remera: 4 productos (7 unidades)
   Pantalón: 4 productos (7 unidades)
   Vestido: 1 productos (1 unidades)

=====================================================
✨ Base de datos CHAMANA configurada exitosamente!
=====================================================
```

---

## 🎯 Ejecución Automática

**Opción rápida** (ejecutar todos los scripts en secuencia):

```powershell
npm run setup
```

Este comando ejecuta todos los scripts en orden automáticamente.

**Nota**: Solo usar después de haber probado cada script individualmente al menos una vez.

---

## 🔄 Reiniciar desde Cero

Si necesitas empezar de nuevo:

1. Ejecutar solo el script 01:

   ```powershell
   node 01_crear_database.js
   ```

   (Esto elimina y recrea la base de datos)

2. Luego ejecutar los demás scripts en orden (02 → 06)

---

## 🔍 Verificación con pgAdmin

Después de ejecutar todos los scripts:

1. Abrir pgAdmin 4
2. Conectar a servidor PostgreSQL local
3. Expandir: Servers → PostgreSQL 17 → Databases
4. Buscar: `chamana_db_fase0`
5. Expandir: Schemas → public → Tables

Deberías ver:

- ✅ `clientes` (20 registros)
- ✅ `categorias` (5 registros)
- ✅ `prendas` (31 registros)

**Consultas de verificación**:

```sql
-- Ver todas las categorías
SELECT * FROM categorias;

-- Ver prendas con precios
SELECT nombre_completo, tipo, precio_chamana, stock
FROM prendas
ORDER BY precio_chamana DESC;

-- Ver clientes
SELECT nombre, apellido, email FROM clientes;

-- Estadísticas
SELECT
  c.nombre,
  COUNT(p.id) as total_productos
FROM categorias c
LEFT JOIN prendas p ON c.id = p.categoria_id
GROUP BY c.nombre;
```

---

## ⚠️ Solución de Problemas

### Error: "Cannot find module 'pg'"

**Solución**:

```powershell
npm install
```

### Error: "connection refused"

**Causa**: PostgreSQL no está ejecutándose  
**Solución**:

- Windows: Servicios → Iniciar "postgresql-x64-17"
- Verificar: `psql --version`

### Error: "password authentication failed"

**Causa**: Contraseña incorrecta  
**Solución**:

- Editar `00_db.js`
- Cambiar `password: 'password'` por tu contraseña real

### Error: "database already exists"

**Causa**: Normal si ya ejecutaste el script antes  
**Solución**: El script automáticamente elimina y recrea la base de datos

### Error: "relation already exists"

**Causa**: Las tablas ya existen  
**Solución**: Ejecutar `node 01_crear_database.js` para limpiar y empezar de nuevo

---

## 📚 Archivos del Proyecto

```
0.comienzo/database/scripts/
├── 00_db.js                    # Configuración de conexión
├── 01_crear_database.js        # Crea base de datos
├── 02_crear_tablas.js          # Crea tablas
├── 03_insertar_categorias.js   # Inserta categorías
├── 04_insertar_prendas_real.js # Inserta productos reales
├── 05_insertar_clientes.js     # Inserta clientes ficticios
├── 06_listar_todo.js           # Verifica todo
├── package.json                # Dependencias Node.js
└── README_EJECUCION.md         # Esta guía
```

---

## 🎓 Notas Educativas

### ¿Por qué usar JavaScript en lugar de solo SQL?

1. **Programático**: Permite lógica, loops, validaciones
2. **Reproducible**: Fácil de ejecutar en cualquier máquina
3. **Educativo**: Aprende Node.js + PostgreSQL juntos
4. **Profesional**: Metodología usada en proyectos reales
5. **Reutilizable**: Misma estructura para todas las fases

### Fase 0 vs Fase 1

**Fase 0 (Actual)** - Pre-normalización:

- Tabla `clientes` simplificada (solo comunicación)
- Tabla `prendas` con datos combinados (nombre_completo incluye diseño + tela)
- Estructura simple, fácil de entender

**Fase 1 (Próxima)** - Normalización:

- Separaremos diseños y telas en tablas distintas
- Normalizaremos a 1NF, 2NF, 3NF
- Crearemos tablas de relación (junction tables)
- Agregaremos más entidades (pedidos, carrito, etc.)

---

## ✅ Checklist de Completitud

Después de ejecutar todos los scripts, verifica:

- [ ] Base de datos `chamana_db_fase0` existe
- [ ] 3 tablas creadas (clientes, categorias, prendas)
- [ ] 5 categorías insertadas
- [ ] 31 prendas reales insertadas
- [ ] 20 clientes ficticios insertados
- [ ] Script 06 muestra estadísticas correctas
- [ ] pgAdmin muestra las tablas y datos
- [ ] Puedes hacer consultas SQL

---

## 🚀 Próximos Pasos

1. **Crear diagramas MER/DER** (Mermaid)
2. **Conectar servidor web**: `cd ../../web && npm install && npm run dev`
3. **Probar API**: http://localhost:3000/api/prendas
4. **Preparar Fase 1**: Normalización

---

**Elaborado por**: Equipo CHAMANA  
**Fase**: 0.comienzo (Pre-normalización)  
**Fecha**: Octubre 2025  
**Versión**: 0.1.0
