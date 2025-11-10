# 🏺 CHAMANA - Sistema de Gestión para Artesanas

**Plataforma E-commerce B2C/B2B para Moda Artesanal Femenina**

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)]() [![3NF](https://img.shields.io/badge/Normalización-3NF-green)]() [![Next.js](https://img.shields.io/badge/Next.js-14-black)]() [![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue)]()

---

## 📚 Tabla de Contenidos

### 🎯 Información General

- [Visión General del Proyecto](./1.Vision-General-Proyecto)
- [Arquitectura del Sistema](./Arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)

### 📊 Base de Datos - Normalización

- [Fase 0: Pre-Normalizado](./2.1.Fase-0-Pre-Normalizado)
- [Fase 1: Primera Forma Normal (1NF)](./2.2.Fase-1-Primera-Forma-Normal)
- [Fase 2: Segunda Forma Normal (2NF)](./2.3.Fase-2-Segunda-Forma-Normal)
- [**Fase 3: Tercera Forma Normal (3NF)**](./2.4.Fase-3-Tercera-Forma-Normal) ⭐ **Entrega Académica**
- [Fase 4: Optimización](./2.5.Fase-4-Optimizacion)

### 🛠️ Implementación

- [Documentación de Esquemas](./3.1.Documentacion-Esquemas)
- [Guías de Migración](./3.2.Guias-Migracion)
- [Decisiones de Diseño](./3.3.Decisiones-Diseno)
- [Migración de Base de Datos](./Migracion-Base-Datos)

### 🔌 API y Desarrollo

- [Documentación de API](./API-Documentation)
- [Autenticación](./Autenticacion)

---

## 🎯 Descripción del Proyecto

CHAMANA es una plataforma e-commerce diseñada para conectar **artesanas peruanas** con clientes finales (B2C) y mayoristas (B2B), facilitando la comercialización de moda artesanal tradicional.

### ✨ Características Principales

- ✅ **Portal B2C** para venta directa a clientes finales
- ✅ **Portal B2B** para mayoristas y distribuidores
- ✅ **Gestión de Inventario** con alertas automáticas de stock crítico
- ✅ **Procesamiento de Pedidos** completo con workflow automatizado
- ✅ **Sistema de Comisiones** para artesanas
- ✅ **Dashboard con Reportes** y analíticas en tiempo real
- ✅ **API REST** completamente documentada
- ✅ **Base de Datos Normalizada** a 3NF (Tercera Forma Normal)

### 🎓 Contexto Académico

Este proyecto es una **entrega académica para el curso de Bases de Datos** de la universidad, enfocado en demostrar:

- ✅ Normalización completa a **3NF** (Tercera Forma Normal)
- ✅ Eliminación de dependencias transitivas
- ✅ Diseño de esquema relacional optimizado
- ✅ Implementación de vistas, procedimientos almacenados y triggers
- ✅ Optimización de queries mediante índices y vistas materializadas
- ✅ Arquitectura DDD (Domain-Driven Design) con Next.js

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# 1. Clonar repositorio y navegar al proyecto
cd 4.final/web-nextjs

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de PostgreSQL

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Base de Datos

```bash
# 1. Navegar a scripts de migración
cd 3.vistas-y-procedimientos/database/scripts

# 2. Instalar dependencias
npm install

# 3. Ejecutar migración completa (Fase 3)
node 00_db.js

# 4. (Opcional) Ejecutar optimizaciones de Fase 4
node 11_add_indexes.js
node 12_optimize_views.js
node 13_materialized_views.js
```

📖 Ver [Guía de Migración](./Migracion-Base-Datos) para más detalles.

---

## 🛠️ Stack Tecnológico

| Categoría         | Tecnología            | Versión | Propósito                     |
| ----------------- | --------------------- | ------- | ----------------------------- |
| **Frontend**      | Next.js               | 14      | Framework React de producción |
|                   | React                 | 19      | Librería UI                   |
|                   | TypeScript            | 5.x     | Tipado estático               |
|                   | TailwindCSS           | 3.x     | Estilos utilitarios           |
|                   | shadcn/ui             | -       | Componentes UI                |
| **Backend**       | Next.js API Routes    | 14      | API REST serverless           |
|                   | Node.js               | 18+     | Runtime JavaScript            |
| **Base de Datos** | PostgreSQL            | 14+     | RDBMS principal               |
|                   | node-postgres (pg)    | 8.x     | Cliente PostgreSQL            |
| **Autenticación** | NextAuth.js           | v5      | Autenticación JWT             |
| **Testing**       | Jest                  | 29.x    | Framework de testing          |
|                   | React Testing Library | 14.x    | Testing de componentes        |
| **Linting**       | Biome                 | -       | Linter y formatter            |
| **CI/CD**         | GitHub Actions        | -       | Integración continua          |
|                   | Husky                 | -       | Pre-commit hooks              |

---

## 📊 Estado del Proyecto

**Fase Actual**: Fase 3 Completa ✅ (Entrega Académica)

| Componente             | Estado         | Completado      |
| ---------------------- | -------------- | --------------- |
| Base de Datos 3NF      | ✅ Completo    | 100%            |
| 19 Tablas Normalizadas | ✅ Completo    | 100%            |
| 24 Relaciones FK       | ✅ Completo    | 100%            |
| 5 Vistas BI            | ✅ Completo    | 100%            |
| 3 Procedimientos       | ✅ Completo    | 100%            |
| 3 Triggers             | ✅ Completo    | 100%            |
| Infraestructura DDD    | ✅ Completo    | 100%            |
| Dominio de Productos   | ✅ Completo    | 100%            |
| API REST               | ✅ Completo    | 100%            |
| Tests                  | 🟢 En Progreso | 92.5% (197/213) |

### 📈 Próximas Fases

- **Fase 4**: Optimización de Performance (23 índices, 5 vistas optimizadas, 4 vistas materializadas)
- **Fase 5-7**: Portales B2C/B2B, CRM, Features avanzadas

---

## 📖 Documentación Detallada

### Base de Datos - Fase 3 (3NF)

La **Fase 3** es la entrega principal de este proyecto académico:

- **[Fase 3: Base de Datos 3NF](./2.4.Fase-3-Tercera-Forma-Normal)** ⭐
  - 19 tablas completamente normalizadas
  - 24 relaciones de clave foránea
  - 5 vistas de Business Intelligence
  - 3 procedimientos almacenados
  - 3 triggers automáticos
  - Diagrama ERD completo

### Optimización - Fase 4

- **[Fase 4: Optimización](./2.5.Fase-4-Optimizacion)**
  - Mejoras de performance 50-80%
  - 23 nuevos índices estratégicos
  - 5 vistas optimizadas
  - 4 vistas materializadas
  - Sin cambios estructurales (usa diagramas de Fase 3)

### Arquitectura y API

- **[Arquitectura DDD](./Arquitectura)**

  - Estructura de dominios
  - Patrón Repository
  - Casos de uso
  - Tecnologías utilizadas

- **[Documentación de API](./API-Documentation)**
  - Endpoints completos
  - Request/Response examples
  - Autenticación
  - Códigos de error

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

## 📝 Estructura del Proyecto

```
chamana/
├── 3.vistas-y-procedimientos/    # Fase 3 - Base de Datos 3NF
│   └── database/
│       └── scripts/               # Scripts de migración SQL
├── 4.final/                       # Fase 4 - Aplicación completa
│   ├── web-nextjs/                # Aplicación Next.js
│   │   ├── src/
│   │   │   ├── domains/           # Lógica de dominio (DDD)
│   │   │   │   ├── product-catalog/
│   │   │   │   ├── order-management/
│   │   │   │   ├── customer/
│   │   │   │   └── ...
│   │   │   ├── infrastructure/    # DB, Config, Auth
│   │   │   └── shared/            # Utilidades compartidas
│   │   ├── app/                   # Rutas y páginas Next.js
│   │   │   ├── (dashboard)/       # Páginas protegidas
│   │   │   ├── api/               # API Routes
│   │   │   └── page.tsx           # Home page
│   │   └── __tests__/             # Tests completos
│   └── database/                  # Scripts de optimización
├── diagramas/                     # Diagramas de todas las fases
│   ├── fase3/                     # MER, DER, ERD Fase 3
│   ├── fase4/                     # Vistas y Procedimientos
│   └── comparaciones/             # Comparativas entre fases
└── wiki/                          # Esta documentación
```

---

## 🤝 Contribución

Este es un proyecto académico para el curso de Bases de Datos.

### Equipo

- **Desarrollo**: Gabriel Osemberg + Claude
- **Universidad**: [Universidad]
- **Curso**: Bases de Datos
- **Profesor**: [Nombre del Profesor]
- **Año**: 2025

---

## 📄 Licencia

Proyecto académico - Todos los derechos reservados

---

## 📞 Soporte

Para preguntas sobre la implementación o documentación:

1. Revisa la [Wiki completa](https://github.com/tu-usuario/chamana/wiki)
2. Consulta la [Documentación de API](./API-Documentation)
3. Revisa los [Diagramas de Base de Datos](./2.4.Fase-3-Tercera-Forma-Normal) o [Diagramas MER/DER](../diagramas)

---

**Última Actualización**: Noviembre 2025
**Versión**: Fase 3 (3NF) - Entrega Académica
**Autor**: Gabriel Osemberg

---

> 🏺 CHAMANA - Conectando tradición artesanal con el comercio moderno
