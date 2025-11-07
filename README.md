# CHAMANA Database - Proyecto de Normalización

## Gabriel Osemberg

### 🎯 Inicio Rápido para Evaluadores

Este proyecto demuestra la normalización progresiva de bases de datos desde una línea base pre-normalizada hasta la Segunda Forma Normal (2NF), aplicada a un negocio real de comercio electrónico de ropa femenina (CHAMANA). El proyecto incluye documentación completa de esquemas, diagramas MER/DER, y una aplicación web funcional que muestra cada fase de normalización.

### 📂 Ruta de Exploración Recomendada

1. **COMIENZA AQUÍ**: [`/diagramas`](./diagramas) - Progresión visual de normalización con diagramas MER/DER (5 min)
2. **Fase 0**: [`/0.comienzo`](./0.comienzo) - Línea base pre-normalizada con redundancia intencional (3 min)
3. **Fase 1**: [`/1.normalizacion`](./1.normalizacion) - Primera Forma Normal (1NF): Valores atómicos, sin grupos repetitivos (3 min)
4. **Fase 2**: [`/2.relaciones`](./2.relaciones) - Segunda Forma Normal (2NF): Eliminación de dependencias parciales (3 min)
5. **Fase 3**: [`/3.vistas-y-procedimientos`](./3.vistas-y-procedimientos) - Tercera Forma Normal (3NF): Vistas, procedimientos y triggers (5 min)
6. **OPCIONAL**: GitHub Wiki - Documentación técnica completa, logs de ejecución, decisiones de diseño (10+ min)
7. **OPCIONAL**: Ejecutar la Aplicación - Demostración en vivo de la base de datos e interfaz web (5 min)

**Tiempo total de evaluación**: ~15 minutos para revisión básica, 30+ minutos para análisis completo

### 📊 Logros Clave

- ✅ **Progresión completa de normalización**: Pre-normalizado → 1NF → 2NF → 3NF con documentación clara de cada transformación
- ✅ **Datos reales del negocio**: 31 productos auténticos de CHAMANA, 20 clientes, 5 categorías de ropa (Buzo, Remera, Vestido, Palazzo, Pantalón)
- ✅ **Implementación full-stack**: Base de datos PostgreSQL 15+ con backend Node.js/Express y frontend JavaScript vanilla
- ✅ **Documentación exhaustiva**: Diagramas MER/DER para cada fase, informes técnicos, guías de migración, y logs de ejecución
- ✅ **Estructura profesional**: Organización limpia del código, historial Git rastreando la progresión, implementaciones aisladas por fase

### 🔗 Análisis Profundo (Opcional)

Para documentación técnica completa más allá del alcance de la evaluación rápida:

- **📖 GitHub Wiki**: [Documentación Técnica Completa](../../wiki)
  - Visión general del proyecto y objetivos
  - Documentación detallada de cada fase (0, 1, 2)
  - Referencia completa de esquemas por fase
  - Guías paso a paso de migración entre fases
  - Decisiones de diseño con justificaciones técnicas
  - Ejemplos de código SQL y queries complejos
- **📊 Diagramas Visuales**: Ver carpeta [`/diagramas`](./diagramas) para todos los diagramas MER/DER con vistas de comparación
- **📁 Documentación Archivada**: Logs de ejecución y metadata disponibles en carpeta `.archive/` (preservados como referencia)

### 🚀 Ejecutar la Aplicación

**Requisitos Previos**: PostgreSQL 15+, Node.js 18+

**Inicio Rápido** (cada fase es independiente):

```bash
# Fase 0: Línea base pre-normalizada
cd 0.comienzo/database/scripts
npm install && node 00_db.js

# Fase 1: Primera Forma Normal (1NF)
cd ../../../1.normalizacion/database/scripts
npm install && node 00_db.js

# Fase 2: Segunda Forma Normal (2NF)
cd ../../../2.relaciones/database/scripts
npm install && node 00_db.js

# Fase 3: Tercera Forma Normal (3NF) + Vistas y Procedimientos
cd ../../../3.vistas-y-procedimientos/database/scripts
npm install && npm run migrate && npm run seed-real

# Ejecutar aplicación web Fase 3
cd ../../web
npm install && npm start
# Acceder: http://localhost:3003
```

**Nota**: Cada fase crea una base de datos independiente (`chamana_db_fase0`, `chamana_db_fase1`, `chamana_db_fase2`, `chamana_db_fase3`) para comparación.

Ver los READMEs específicos de cada fase para instrucciones detalladas de configuración y resolución de problemas.

### 📞 Contacto e Información

**Estudiante**: Gabriel Osemberg  
**Curso**: Diseño de Bases de Datos y Normalización  
**Institución**: Universidad  
**Fecha**: Octubre 2025  
**Tecnologías**: PostgreSQL 15+, Node.js 18+, Express.js, JavaScript Vanilla

**Repositorio**: [GitHub](https://github.com/USER/gabriel-db-final) _(actualizar con URL real)_

---

**Tipo de Proyecto**: Académico (doble propósito: proyecto universitario + fundación de CRM lista para producción)  
**Licencia**: Uso Educativo  
**Estado**: Fases 0-3 Completas ✅

**Última Actualización**: 6 de Noviembre, 2025

---

## Fase 3: Tercera Forma Normal (3NF) + Vistas y Procedimientos

**Estado**: ✅ Completado  
**Fecha**: Noviembre 2025  
**Ubicación**: `3.vistas-y-procedimientos/`

### Objetivos Cumplidos

- ✅ Normalización a Tercera Forma Normal (3NF)
- ✅ 7 tablas nuevas para eliminar dependencias transitivas
- ✅ 5 vistas de Business Intelligence
- ✅ 3 procedimientos almacenados
- ✅ 3 triggers automáticos
- ✅ Demostración de 6 tipos de JOIN
- ✅ Datos reales de Chamana (27 diseños, 38 telas)

### Nuevas Tablas 3NF

1. **direcciones** - Direcciones normalizadas de clientes
2. **tipos_prenda** - Catálogo de tipos de prenda
3. **estados_pedido** - Estados del workflow de pedidos
4. **historial_estados_pedido** - Auditoría de cambios de estado
5. **proveedores** - Proveedores de telas
6. **telas_proveedores** - Relación M:M con precios por proveedor
7. **metodos_pago** - Métodos de pago disponibles

### Vistas de Business Intelligence

1. **vista_ventas_mensuales** - Análisis de ventas por mes
2. **vista_inventario_critico** - Alertas de stock bajo
3. **vista_top_productos** - Productos más vendidos
4. **vista_analisis_clientes** - Segmentación y CRM insights
5. **vista_rotacion_inventario** - Métricas de rotación de stock

### Procedimientos Almacenados

1. **procesar_pedido(cliente_id, items_jsonb, descuento)** - Procesa orden completa y actualiza inventario
2. **reabastecer_inventario(prenda_id, cantidad, motivo)** - Gestiona reabastecimiento
3. **calcular_comision_vendedor(fecha_inicio, fecha_fin, porcentaje)** - Calcula comisiones

### Triggers

1. **trigger_track_order_state** - Rastrea cambios de estado en pedidos
2. **trigger_stock_alert** - Genera alertas de stock crítico
3. **trigger_manage_default_address** - Gestiona dirección predeterminada

### Aplicación Web

**Tecnología**: Express.js + Bootstrap 5.3.2  
**Puerto**: 3003  
**Características**:

- Dashboard con KPIs en tiempo real
- Reportes interactivos (5 vistas)
- Ejecución de procesos almacenados
- Exportación a CSV

### Cómo Ejecutar

```bash
# Crear base de datos y migrar
cd 3.vistas-y-procedimientos/database/scripts
npm install
npm run migrate

# Poblar con datos reales de Chamana
npm run seed-real

# Verificar implementación
npm run verify

# Iniciar servidor web
cd ../../web
npm install
npm start
# Abrir http://localhost:3003
```

### Diagrama de Evolución

Ver: `docs/diagramas/fase3/comparativa-fase2-vs-fase3.md`

### Demostración de JOINs

Ver: `3.vistas-y-procedimientos/database/scripts/08_demo_joins.sql`
