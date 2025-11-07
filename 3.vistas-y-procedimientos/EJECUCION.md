# Guía de Ejecución - Fase 3

**Estado**: ✅ Listo para ejecutar  
**Fecha**: 6 de Noviembre, 2025  
**Autor**: Gabriel Osemberg

---

## ✅ Checklist de Prerrequisitos

Antes de comenzar, verificar:

- [ ] PostgreSQL 15+ está corriendo
  ```powershell
  pg_isready
  # O verificar en Windows Services
  ```

- [ ] Base de datos Fase 2 existe (`chamana_db_fase2`)
  ```powershell
  psql -U postgres -l | grep chamana_db_fase2
  ```

- [ ] Archivo `.env` configurado (si es necesario)
  ```env
  DB_USER=postgres
  DB_PASSWORD=tu_password
  DB_HOST=localhost
  DB_PORT=5432
  ```

---

## 🚀 Ejecución Paso a Paso

### Paso 1: Instalar Dependencias

```powershell
cd 3.vistas-y-procedimientos\database\scripts
npm install
```

**Esperado**: `pg@8.11.3` instalado exitosamente

**Tiempo**: 1-2 minutos

---

### Paso 2: Ejecutar Migración Completa

**Opción A - Recomendada** (todo de una vez):

```powershell
npm run migrate
```

**Opción B - Paso a Paso** (para debugging):

```powershell
node 01_crear_database.js
node 02_crear_tablas.js
node 03_insertar_datos_iniciales.js
node 04_migrar_datos_fase2.js
node 05_crear_vistas.js
node 06_crear_procedimientos.js
node 07_crear_triggers.js
```

**Qué hace cada script**:

1. **01_crear_database.js**: Crea `chamana_db_fase3`
2. **02_crear_tablas.js**: Crea 19 tablas (12 de Fase 2 + 7 nuevas 3NF)
3. **03_insertar_datos_iniciales.js**: Inserta catálogos base (tipos_prenda, estados_pedido, proveedores, metodos_pago)
4. **04_migrar_datos_fase2.js**: Migra todos los datos desde Fase 2
5. **05_crear_vistas.js**: Crea 5 vistas de Business Intelligence
6. **06_crear_procedimientos.js**: Crea 3 procedimientos almacenados
7. **07_crear_triggers.js**: Crea 3 triggers automáticos

**Output Esperado**:
```
✅ Database chamana_db_fase3 created
✅ 19 tables created successfully
✅ Initial data inserted
✅ Data migrated from Phase 2
✅ 5 views created
✅ 3 procedures created
✅ 3 triggers created
```

**Tiempo**: 5-10 minutos

---

### Paso 3: Poblar con Datos Reales de Chamana

```powershell
npm run seed-real
```

**Qué hace**:
- Inserta **16 diseños de Tierra** (Invierno 2025)
- Inserta **11 diseños de Magia** (Verano 2026)
- Inserta **17 telas de Tierra** con precios reales
- Inserta **21 telas de Magia** con precios reales
- Crea **15+ prendas de muestra** con stock real

**Output Esperado**:
```
🌱 Seeding real CHAMANA data...
✅ 16 diseños de Tierra insertados
✅ 11 diseños de Magia insertados
✅ 17 telas de Tierra insertadas
✅ 21 telas de Magia insertadas
✅ 15 prendas insertadas
```

**Tiempo**: 2-3 minutos

---

### Paso 4: Verificar Implementación

```powershell
npm run verify
```

**Debe mostrar**:
```
🔍 Verificando implementación de Fase 3...

📊 Verificando tablas...
   ✅ 19/19 tablas encontradas

📊 Verificando vistas...
   ✅ 5/5 vistas encontradas

📊 Verificando procedimientos...
   ✅ 3/3 procedimientos encontrados

📊 Verificando triggers...
   ✅ 3/3 triggers encontrados

📊 Verificando datos...
   ✅ 27 diseños encontrados
   ✅ 38 telas encontradas

🎉 Fase 3 implementada correctamente!
```

**Tiempo**: 1 minuto

---

### Paso 5: Iniciar Aplicación Web

```powershell
cd ..\..\web
npm install
npm start
```

**Output Esperado**:
```
🚀 Phase 3 Server running on http://localhost:3003
📊 Dashboard: http://localhost:3003
📈 Reports: http://localhost:3003/reportes.html
⚙️  Processes: http://localhost:3003/procesos.html
```

**Tiempo**: 1-2 minutos

---

## 🎯 Validación en Navegador

### Dashboard

- [ ] Abrir: http://localhost:3003
- [ ] Verificar KPI cards muestran datos
- [ ] Verificar Top 10 productos se popula
- [ ] Verificar Inventario crítico se popula

### Reportes

- [ ] Abrir: http://localhost:3003/reportes.html
- [ ] Probar cada pestaña (5 vistas)
- [ ] Verificar exportación CSV funciona

### Procesos

- [ ] Abrir: http://localhost:3003/procesos.html
- [ ] Probar cada procedimiento (3)
- [ ] Verificar historial se actualiza

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

**Solución**: La tabla ya existe, puedes continuar con el siguiente script. Los scripts son idempotentes.

### Error: "ECONNREFUSED ::1:5432"

**Solución**: PostgreSQL no está corriendo.

```powershell
# Windows
net start postgresql-x64-15

# O verificar en Services
services.msc
```

### Error: "password authentication failed"

**Solución**: Verificar archivo `.env` o credenciales en `00_db.js`

### Error: "chamana_db_fase2 does not exist"

**Solución**: Primero ejecutar migración de Fase 2, o modificar script 04 para crear datos de prueba.

### Quiero empezar de cero

```sql
-- Conectar a postgres usando pgAdmin o psql
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
- `procesar_pedido(cliente_id, items_jsonb, descuento)` - Procesar orden completa
- `reabastecer_inventario(prenda_id, cantidad, motivo)` - Reabastecer stock
- `calcular_comision_vendedor(fecha_inicio, fecha_fin, porcentaje)` - Calcular comisiones

### Triggers (3):
- `trigger_track_order_state` - Rastrear cambios de estado
- `trigger_stock_alert` - Alertas de stock bajo
- `trigger_manage_default_address` - Gestionar dirección predeterminada

---

## ✅ Checklist Final

Después de completar todos los pasos:

- [ ] Base de datos `chamana_db_fase3` existe en pgAdmin
- [ ] 19 tablas visibles en `Schemas > public > Tables`
- [ ] 5 vistas visibles en `Views`
- [ ] 3 funciones visibles en `Functions`
- [ ] 3 triggers visibles en tablas relevantes
- [ ] Query `SELECT COUNT(*) FROM disenos` retorna 27
- [ ] Query `SELECT COUNT(*) FROM telas` retorna 38
- [ ] Servidor web corriendo en puerto 3003
- [ ] Dashboard carga correctamente
- [ ] Reportes muestran datos
- [ ] Procesos ejecutan correctamente

---

## 🎓 Para el Profesor

Esta implementación demuestra:

1. ✅ **Normalización 3NF completa** - 7 nuevas tablas eliminan dependencias transitivas
2. ✅ **5 vistas de Business Intelligence** - Análisis de ventas, inventario, clientes
3. ✅ **3 procedimientos almacenados** - Lógica de negocio en base de datos
4. ✅ **3 triggers automáticos** - Automatización y auditoría
5. ✅ **6 tipos de JOIN demostrados** - Ver `08_demo_joins.sql`
6. ✅ **Datos reales de producción** - 27 diseños, 38 telas de Chamana
7. ✅ **Integridad referencial perfecta** - Foreign keys y constraints
8. ✅ **Aplicación web funcional** - Dashboard, reportes, procesos

---

## 📝 Notas

- **Tiempo total estimado**: 10-15 minutos
- **Scripts son idempotentes**: Puedes ejecutarlos múltiples veces sin problemas
- **Base de datos Fase 2**: Se mantiene intacta como backup
- **Puerto web**: 3003 (diferente de Fase 2 que usa 3000)

---

**Última actualización**: 6 de Noviembre, 2025  
**Autor**: Gabriel Osemberg  
**Estado**: Listo para ejecutar

