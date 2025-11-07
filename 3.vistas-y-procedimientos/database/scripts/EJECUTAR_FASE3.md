# Guía de Ejecución - Fase 3

## ✅ Estado Actual

**Scripts Creados por Claude**:
- ✅ `09_verificar.js` - Verificación completa de Fase 3
- ✅ `10_seed_chamana_real_data.js` - Datos reales de Tierra y Magia
- ✅ `package.json` actualizado con script `seed-real`

**Archivos Existentes** (creados por Cursor):
- `01_crear_database.js` - Crear base de datos
- `02_crear_tablas.js` - Crear tablas 3NF
- `03_insertar_datos_iniciales.js` - Datos iniciales
- `04_migrar_datos_fase2.js` - Migrar de Fase 2
- `05_crear_vistas.js` - 5 vistas de BI
- `06_crear_procedimientos.js` - 3 procedimientos
- `07_crear_triggers.js` - 3 triggers
- `08_demo_joins.sql` - Demostración de JOINs

---

## 🚀 PASO A PASO PARA EJECUTAR

### **Paso 1: Instalar Dependencias** ⚡

```powershell
cd 3.vistas-y-procedimientos\database\scripts
npm install --omit=dev
```

Esto instalará **solo `pg`** sin las dependencias problemáticas.

Si hay errores de vulnerabilidades, **IGNORARLOS** (son de paquetes que no usamos).

---

### **Paso 2: Ejecutar Migración Completa** 🗄️

```powershell
# Opción A: Ejecutar todo de una vez
npm run migrate

# Opción B: Ejecutar paso a paso (recomendado para debugging)
node 01_crear_database.js
node 02_crear_tablas.js
node 03_insertar_datos_iniciales.js
node 04_migrar_datos_fase2.js
node 05_crear_vistas.js
node 06_crear_procedimientos.js
node 07_crear_triggers.js
```

**Qué hace cada script**:
1. **01**: Crea `chamana_db_fase3`
2. **02**: Crea 19 tablas (12 de Fase 2 + 7 nuevas de 3NF)
3. **03**: Inserta datos iniciales (catálogos base)
4. **04**: Migra datos de Fase 2
5. **05**: Crea 5 vistas de Business Intelligence
6. **06**: Crea 3 procedimientos almacenados
7. **07**: Crea 3 triggers automáticos

---

### **Paso 3: Poblar con Datos Reales de Chamana** 🌱

```powershell
npm run seed-real
# O directamente:
node 10_seed_chamana_real_data.js
```

**Qué hace**:
- Inserta **16 diseños de Tierra** (Invierno 2025)
- Inserta **11 diseños de Magia** (Verano 2026)
- Inserta **17 telas de Tierra** con precios reales
- Inserta **21 telas de Magia** con precios reales
- Crea **15+ prendas de muestra** con stock real
- Inserta proveedores, métodos de pago, estados de pedido

---

### **Paso 4: Verificar Implementación** ✅

```powershell
npm run verify
# O directamente:
node 09_verificar.js
```

**Debe mostrar**:
- ✅ 19 tablas creadas
- ✅ 5 vistas funcionando
- ✅ 3 procedimientos creados
- ✅ 3 triggers activos
- ✅ Datos reales insertados

---

## 🎯 Resultado Esperado

Al final deberías ver:

```
🎉 ¡TODAS LAS VERIFICACIONES PASARON! 🎉

✓ Base de datos en 3NF
✓ 5 Vistas funcionando
✓ 3 Procedimientos almacenados
✓ 3 Triggers activos
✓ 6 Tipos de JOIN demostrados
✓ Integridad de datos verificada

📈 FASE 3 COMPLETADA AL 100%
```

**Catálogo Chamana**:
- 27 diseños reales (Tierra + Magia)
- 38 telas con precios reales
- 15+ prendas con stock real
- 2 colecciones completas

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'pg'"
```powershell
npm install pg@8.11.3
```

### Error: "Database does not exist"
```powershell
# Ejecutar solo el script 01
node 01_crear_database.js
```

### Error: "relation already exists"
**Solución**: La tabla ya existe, puedes continuar con el siguiente script.

### Error: "ECONNREFUSED"
**Solución**: PostgreSQL no está corriendo. Iniciar el servicio:
```powershell
# En Windows
net start postgresql-x64-15
```

### Quiero empezar de cero
```sql
-- Conectar a postgres y ejecutar:
DROP DATABASE IF EXISTS chamana_db_fase3;
-- Luego ejecutar desde script 01
```

---

## 📊 Estructura de Datos Creada

### Tablas de Fase 2 (12):
- clientes, categorias, disenos, telas
- años, temporadas, colecciones, prendas
- pedidos, pedidos_prendas
- telas_temporadas, movimientos_inventario

### Tablas Nuevas 3NF (7):
- **direcciones** - Direcciones normalizadas de clientes
- **tipos_prenda** - Catálogo de tipos de prenda
- **estados_pedido** - Estados del workflow
- **historial_estados_pedido** - Auditoría de cambios
- **proveedores** - Proveedores de telas
- **telas_proveedores** - Relación M:M con precios
- **metodos_pago** - Métodos de pago disponibles

### Vistas (5):
- `vista_ventas_mensuales` - Análisis de ventas
- `vista_inventario_critico` - Alertas de stock
- `vista_top_productos` - Más vendidos
- `vista_analisis_clientes` - Segmentación
- `vista_rotacion_inventario` - Rotación de stock

### Procedimientos (3):
- `procesar_pedido()` - Procesar orden completa
- `reabastecer_inventario()` - Reabastecer stock
- `calcular_comision_vendedor()` - Calcular comisiones

### Triggers (3):
- `trigger_track_order_state` - Rastrear cambios de estado
- `trigger_stock_alert` - Alertas de stock bajo
- `trigger_manage_default_address` - Gestionar dirección predeterminada

---

## 🎓 Para el Profesor

Esta implementación demuestra:
1. ✅ **Normalización 3NF completa**
2. ✅ **5 vistas de Business Intelligence**
3. ✅ **3 procedimientos almacenados con lógica de negocio**
4. ✅ **3 triggers para automatización**
5. ✅ **6 tipos de JOIN demostrados**
6. ✅ **Datos reales de producción** (Chamana)
7. ✅ **Integridad referencial perfecta**

---

**Última actualización**: 6 de Noviembre, 2025
**Autor**: Claude + Gabriel
**Estado**: Listo para ejecutar
