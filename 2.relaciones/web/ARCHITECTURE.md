# Arquitectura Web Fase 2

## Resumen

Aplicación web de Fase 2 construida sobre Node.js + Express + PostgreSQL, demostrando normalización de base de datos 2NF con una arquitectura de capa de servicios lista para producción.

## Patrón de Arquitectura: Service Layer + MVC

### Separación de Capas

1. **Routes** (Controlador) - Manejo de peticiones HTTP
2. **Services** (Lógica de Negocio) - Gestión de transacciones, lógica de dominio
3. **Database** (Capa de Datos) - PostgreSQL con librería pg
4. **Utilities** - Validación, manejo de errores, logging
5. **Middleware** - Logging de peticiones, manejo de errores

## Componentes Principales

### 1. Capa de Servicios (`services/`)

- `base.service.js` - Clase base con gestión de transacciones
- `pedidos.service.js` - Lógica de dominio de pedidos
- `productos.service.js` - Lógica de dominio de productos
- `telas.service.js` - Lógica de telas estacionales
- `transaction.service.js` - Transacciones complejas

**Patrón Clave**: Todos los servicios extienden BaseService para manejo consistente de transacciones.

### 2. Estrategia de Manejo de Errores

- Clases de error personalizadas: `ValidationError`, `NotFoundError`, `DatabaseError`
- Middleware centralizado de errores: `middleware/errorHandler.js`
- Mensajes amigables al usuario en producción, stack traces en desarrollo

### 3. Blue-Green Deployment

- Variable de entorno: `DB_VERSION=fase1|fase2`
- Cambia entre chamana_db_fase1 y chamana_db_fase2
- Cambio de versión sin tiempo de inactividad

### 4. Gestión de Transacciones

- Todas las mutaciones de datos envueltas en transacciones
- Rollback automático en error
- Patrón: `await executeInTransaction(async (client) => { ... })`

### 5. Framework de Validación

- Validadores reutilizables: `utils/validation.js`
- Lanza `ValidationError` en fallo
- Funciones: `required()`, `isPositive()`, `isNonEmptyArray()`, etc.

### 6. Logging

- Logging estructurado JSON: `config/logger.js`
- Middleware de logging de peticiones: `middleware/requestLogger.js`
- Logs: info, warn, error con timestamps

## Endpoints de API

### Categorias

- GET /api/categorias - Listar todas
- GET /api/categorias/:id - Obtener por ID
- GET /api/categorias/:id/prendas - Obtener productos en categoría

### Productos

- GET /api/productos - Listar (con filtros: categoria_id, activa, tela_ids)
- GET /api/productos/:id - Obtener por ID (con desglose de stock)
- GET /api/productos/:id/historial-stock - Historial de stock

### Usuarios (Clientes)

- GET /api/usuarios - Listar todos
- GET /api/usuarios/:id - Obtener por ID
- POST /api/usuarios - Crear
- PUT /api/usuarios/:id - Actualizar
- DELETE /api/usuarios/:id - Eliminar

### Pedidos (Orders)

- GET /api/pedidos - Listar (filtros: cliente_id, estado)
- GET /api/pedidos/:id - Obtener por ID (con items)
- POST /api/pedidos - Crear pedido
- PUT /api/pedidos/:id/completar - Completar pedido (actualiza stock)
- PUT /api/pedidos/:id/cancelar - Cancelar pedido

### Telas (Seasonal Fabrics)

- GET /api/telas/temporadas - Filtrar por temporada/año (demuestra 2NF)

## Conexión a Base de Datos

### Configuración (`config/database.js`)

- Connection pooling con pg.Pool
- Selección de BD basada en entorno (Blue-Green)
- Cierre elegante en SIGTERM/SIGINT
- Helper de compatibilidad hacia atrás: `query()`

### Esquema (chamana_db_fase2)

- 12 tablas (cumpliendo 2NF)
- Tablas de unión: telas_temporadas, pedidos_prendas
- Columnas generadas: stock_disponible
- Auditoría: movimientos_inventario

## Arquitectura Frontend

### Patrón: HTML Renderizado en Servidor + Vanilla JS

- Vistas HTML en `public/views/`
- JavaScript inline (400-800 líneas por página)
- Fetch API para comunicación con backend
- Sin framework (simplicidad educativa)

### Páginas Clave

- `index.html` - Dashboard
- `productos.html` - Gestión de productos (con desglose de stock y filtrado estacional)
- `categorias.html` - Gestión de categorías
- `usuarios.html` - Gestión de usuarios/clientes
- `pedidos.html` - Gestión de pedidos (Fase 2)

### Mejoras Frontend Fase 2

**Características de Gestión de Stock:**

- Visualización de desglose de stock (inicial, vendido, disponible)
- Badges de stock con código de colores (verde >10, amarillo 1-10, rojo 0)
- Modal de historial de stock con movimientos de inventario
- Seguimiento de fecha de última venta

**Filtrado Estacional:**

- Filtrar productos por temporada (Verano/Invierno)
- Filtrar productos por año (2024/2025/2026)
- Filtrado combinado (lógica de intersección)
- Integración con API `/api/telas/temporadas`

## Preparación para Migración (Producción)

### Stack Actual → Stack Futuro

- Express routes → tRPC routers
- pg queries → Prisma ORM
- Vanilla JS → Next.js + React Server Components
- PostgreSQL (local) → Neon PostgreSQL (serverless)

### Lo que Migra Limpiamente

✅ Esquema de base de datos (exportar a Prisma)
✅ Lógica de negocio (capa de servicios → procedimientos tRPC)
✅ Patrones de transacción (Prisma soporta)
✅ Patrones de manejo de errores (adaptar a tRPC)

### Lo que se Reescribe

❌ Frontend (reconstrucción completa con Next.js)
❌ Rutas de API (convertir a routers tRPC)
❌ Consultas SQL directas (convertir a Prisma)

## Quality Gates

### Antes del Deployment

- [ ] Todas las rutas retornan 200 OK para peticiones válidas
- [ ] El manejo de errores retorna 4xx/5xx con mensajes
- [ ] Las transacciones hacen rollback en error
- [ ] Las actualizaciones de stock se reflejan en movimientos_inventario
- [ ] El cambio Blue-Green funciona

### Objetivos de Rendimiento

- Tiempo de respuesta API: <300ms (p95)
- Consultas de base de datos: <100ms (p95)
- Carga de página: <2s (render completo)

## Mejoras Futuras

### Fase 3 (3NF)

- Eliminar dependencias transitivas
- Normalizar esquema aún más
- Actualizar aplicación web en consecuencia

### Migración a Producción

- Agregar autenticación (NextAuth.js)
- Agregar rate limiting (express-rate-limit)
- Agregar sanitización de entrada (express-validator)
- Escribir tests automatizados (Jest, Playwright)
- Desplegar a Vercel + Neon

---

**Versión**: 2.0.0  
**Última Actualización**: 2025-10-23  
**Estado**: Fase 2 Completa (2NF + Gestión de Stock + Filtrado Estacional)
