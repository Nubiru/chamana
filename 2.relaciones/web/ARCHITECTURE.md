# Phase 2 Web Architecture

## Overview

Phase 2 web application built on Node.js + Express + PostgreSQL, demonstrating 2NF database normalization with a production-ready service layer architecture.

## Architecture Pattern: Service Layer + MVC

### Layer Separation

1. **Routes** (Controller) - HTTP request handling
2. **Services** (Business Logic) - Transaction management, domain logic
3. **Database** (Data Layer) - PostgreSQL with pg library
4. **Utilities** - Validation, error handling, logging
5. **Middleware** - Request logging, error handling

## Core Components

### 1. Service Layer (`services/`)

- `base.service.js` - Base class with transaction management
- `pedidos.service.js` - Orders domain logic
- `productos.service.js` - Products domain logic
- `telas.service.js` - Seasonal fabrics logic
- `transaction.service.js` - Complex transactions

**Key Pattern**: All services extend BaseService for consistent transaction handling.

### 2. Error Handling Strategy

- Custom error classes: `ValidationError`, `NotFoundError`, `DatabaseError`
- Centralized error middleware: `middleware/errorHandler.js`
- User-friendly messages in production, stack traces in development

### 3. Blue-Green Deployment

- Environment variable: `DB_VERSION=fase1|fase2`
- Switches between chamana_db_fase1 and chamana_db_fase2
- Zero-downtime version switching

### 4. Transaction Management

- All data mutations wrapped in transactions
- Automatic rollback on error
- Pattern: `await executeInTransaction(async (client) => { ... })`

### 5. Validation Framework

- Reusable validators: `utils/validation.js`
- Throws `ValidationError` on failure
- Functions: `required()`, `isPositive()`, `isNonEmptyArray()`, etc.

### 6. Logging

- Structured JSON logging: `config/logger.js`
- Request logging middleware: `middleware/requestLogger.js`
- Logs: info, warn, error with timestamps

## API Endpoints

### Categorias

- GET /api/categorias - List all
- GET /api/categorias/:id - Get by ID
- GET /api/categorias/:id/prendas - Get products in category

### Productos

- GET /api/productos - List (with filters: categoria_id, activa, tela_ids)
- GET /api/productos/:id - Get by ID (with stock breakdown)
- GET /api/productos/:id/historial-stock - Stock history

### Usuarios (Clientes)

- GET /api/usuarios - List all
- GET /api/usuarios/:id - Get by ID
- POST /api/usuarios - Create
- PUT /api/usuarios/:id - Update
- DELETE /api/usuarios/:id - Delete

### Pedidos (Orders)

- GET /api/pedidos - List (filters: cliente_id, estado)
- GET /api/pedidos/:id - Get by ID (with items)
- POST /api/pedidos - Create order
- PUT /api/pedidos/:id/completar - Complete order (updates stock)
- PUT /api/pedidos/:id/cancelar - Cancel order

### Telas (Seasonal Fabrics)

- GET /api/telas/temporadas - Filter by season/year (demonstrates 2NF)

## Database Connection

### Configuration (`config/database.js`)

- Connection pooling with pg.Pool
- Environment-based DB selection (Blue-Green)
- Graceful shutdown on SIGTERM/SIGINT
- Backwards compatibility helper: `query()`

### Schema (chamana_db_fase2)

- 12 tables (2NF compliant)
- Junction tables: telas_temporadas, pedidos_prendas
- Generated columns: stock_disponible
- Audit trail: movimientos_inventario

## Frontend Architecture

### Pattern: Server-Rendered HTML + Vanilla JS

- HTML views in `public/views/`
- Inline JavaScript (400-800 lines per page)
- Fetch API for backend communication
- No framework (educational simplicity)

### Key Pages

- `index.html` - Dashboard
- `productos.html` - Product management (with stock breakdown and seasonal filtering)
- `categorias.html` - Category management
- `usuarios.html` - User/client management
- `pedidos.html` - Order management (Phase 2)

### Phase 2 Frontend Enhancements

**Stock Management Features:**

- Stock breakdown display (inicial, vendido, disponible)
- Color-coded stock badges (green >10, yellow 1-10, red 0)
- Stock history modal with inventory movements
- Last sale date tracking

**Seasonal Filtering:**

- Filter products by temporada (Verano/Invierno)
- Filter products by año (2024/2025/2026)
- Combined filtering (intersection logic)
- API integration with `/api/telas/temporadas`

## Migration Readiness (Production)

### Current Stack → Future Stack

- Express routes → tRPC routers
- pg queries → Prisma ORM
- Vanilla JS → Next.js + React Server Components
- PostgreSQL (local) → Neon PostgreSQL (serverless)

### What Migrates Cleanly

✅ Database schema (export to Prisma)
✅ Business logic (service layer → tRPC procedures)
✅ Transaction patterns (Prisma supports)
✅ Error handling patterns (adapt to tRPC)

### What Gets Rewritten

❌ Frontend (complete rebuild with Next.js)
❌ API routes (convert to tRPC routers)
❌ Direct SQL queries (convert to Prisma)

## Quality Gates

### Before Deployment

- [ ] All routes return 200 OK for valid requests
- [ ] Error handling returns 4xx/5xx with messages
- [ ] Transactions rollback on error
- [ ] Stock updates reflect in movimientos_inventario
- [ ] Blue-Green switching works

### Performance Targets

- API response time: <300ms (p95)
- Database queries: <100ms (p95)
- Page load: <2s (full render)

## Future Enhancements

### Phase 3 (3NF)

- Eliminate transitive dependencies
- Further normalize schema
- Update web application accordingly

### Production Migration

- Add authentication (NextAuth.js)
- Add rate limiting (express-rate-limit)
- Add input sanitization (express-validator)
- Write automated tests (Jest, Playwright)
- Deploy to Vercel + Neon

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-23  
**Status**: Phase 2 Complete (2NF + Stock Management + Seasonal Filtering)
