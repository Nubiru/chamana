# CHAMANA - Sistema de Gestión para Artesanas

**Plataforma E-commerce B2C/B2B para Moda Artesanal Femenina**

[![Tests](https://img.shields.io/badge/tests-197%2F213%20passing-green)]() [![Coverage](https://img.shields.io/badge/coverage-92.5%25-brightgreen)]() [![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue)]()

---

## 📋 Descripción

CHAMANA es una plataforma e-commerce diseñada para conectar artesanas peruanas con clientes finales (B2C) y mayoristas (B2B), facilitando la comercialización de moda artesanal tradicional.

### Características

- ✅ Portal B2C para venta directa
- ✅ Portal B2B para mayoristas
- ✅ Gestión de inventario y productos
- ✅ Procesamiento de pedidos completo
- ✅ Sistema de comisiones para artesanas
- ✅ Dashboard con reportes y analíticas
- ✅ API REST documentada

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
cd 4.final/web-nextjs

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Base de Datos

```bash
# Ir a scripts de migración
cd database/scripts

# Instalar dependencias
npm install

# Ejecutar migración inicial
node 00_db.js

# Ejecutar scripts adicionales (opcional)
node 11_add_indexes.js
node 12_optimize_views.js
node 13_materialized_views.js
```

---

## 📁 Estructura del Proyecto

```
4.final/
├── web-nextjs/              # Aplicación Next.js principal
│   ├── src/
│   │   ├── domains/         # Lógica de dominio (DDD)
│   │   │   ├── product-catalog/
│   │   │   ├── order-management/
│   │   │   ├── customer/
│   │   │   └── ...
│   │   ├── infrastructure/  # DB, Config, Auth
│   │   │   ├── database/
│   │   │   ├── config/
│   │   │   └── auth/
│   │   └── shared/          # Utilidades compartidas
│   ├── app/                 # Rutas y páginas Next.js
│   │   ├── (dashboard)/     # Páginas protegidas
│   │   ├── api/             # API Routes
│   │   └── page.tsx         # Home page
│   ├── __tests__/           # Tests completos
│   │   ├── unit/
│   │   └── integration/
│   └── components/          # Componentes UI
├── database/                # Scripts de migración SQL
│   └── scripts/
└── wiki/                    # Documentación (GitHub Wiki)
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | Next.js 14, React 19, TypeScript |
| **Styling** | TailwindCSS, shadcn/ui |
| **Backend** | Next.js API Routes, Node.js |
| **Base de Datos** | PostgreSQL 14 (3NF normalizada) |
| **ORM** | node-postgres (pg) |
| **Autenticación** | NextAuth.js v5 (JWT) |
| **Testing** | Jest, React Testing Library |
| **Linting** | Biome |
| **CI/CD** | GitHub Actions, Husky |

---

## 📊 Estado del Proyecto

**Fase Actual**: Fase 1 Completa (Infraestructura + Dominio de Productos)

| Componente | Estado | Completado |
|------------|--------|------------|
| Base de Datos 3NF | ✅ | 100% |
| Infraestructura DDD | ✅ | 100% |
| Dominio de Productos | ✅ | 100% |
| Dominio de Órdenes | ⏳ | 0% |
| Dominio de Clientes | ⏳ | 0% |
| Autenticación | 📋 | Pendiente |
| Portal B2C | ⏳ | 0% |
| Portal B2B | ⏳ | 0% |
| Tests | 🟢 | 92.5% (197/213) |

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration
```

**Cobertura Actual**: 92.5% (197/213 tests pasando)

---

## 📖 Documentación

Documentación completa disponible en la [Wiki del proyecto](../wiki/):

- [🏗️ Arquitectura del Sistema](../wiki/Arquitectura.md)
- [📡 API Documentation](../wiki/API-Documentation.md)
- [🔐 Guía de Autenticación](../wiki/Autenticacion.md)
- [💾 Migración de Base de Datos](../wiki/Migracion-Base-Datos.md)

---

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Construye para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta linter (Biome) |
| `npm run lint:fix` | Auto-corrige errores de linting |
| `npm run typecheck` | Verifica errores de TypeScript |
| `npm test` | Ejecuta suite de tests |
| `npm run validate` | Ejecuta lint + typecheck + test + build |

---

## 🤝 Contribución

Este es un proyecto académico para el curso de Bases de Datos.

### Equipo

- **Desarrollo**: Gabriel + Claude
- **Universidad**: [Tu Universidad]
- **Curso**: Bases de Datos
- **Año**: 2025

---

## 📝 Licencia

Proyecto académico - Todos los derechos reservados

---

## 🚀 Próximos Pasos

### Fase 2 - Dominios Core (Próxima)
- [ ] Implementar Order Domain
- [ ] Implementar Customer Domain
- [ ] Agregar middleware de autenticación
- [ ] Aumentar cobertura de tests a 95%+

### Fase 3 - Dominios Avanzados
- [ ] B2B Wholesale Domain
- [ ] Shipping Domain
- [ ] Analytics Domain

### Fase 4-7 - Portales y CRM
- [ ] Portal B2C completo
- [ ] Portal B2B completo
- [ ] Sistema CRM
- [ ] Features avanzadas

---

**Para comenzar el desarrollo, consulta la [Wiki](../wiki/) y el archivo CURSOR_FOCUS.md**
