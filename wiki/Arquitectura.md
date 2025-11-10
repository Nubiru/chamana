# Arquitectura del Sistema CHAMANA

## Principios de Diseño

CHAMANA utiliza **Domain-Driven Design (DDD)** con Next.js 14 y PostgreSQL.

### Estructura de Dominios

```
src/domains/
├── product-catalog/      # Catálogo de productos
├── order-management/     # Gestión de pedidos
├── customer/             # Clientes
├── shipping/             # Envíos
├── analytics/            # Analíticas
├── marketing/            # Marketing
├── b2b-wholesale/        # Portal mayorista
└── admin/                # Administración
```

### Arquitectura en Capas

**Entidad (Entity)** → **Repositorio (Repository)** → **Caso de Uso (Use Case)** → **API Route**

Ejemplo: Product Domain
- `Product.ts` - Lógica de negocio
- `ProductRepository.ts` - Interfaz de datos
- `PostgresProductRepository.ts` - Implementación
- `SearchProducts.ts` - Caso de uso
- `/api/products` - Endpoint REST

## Stack Tecnológico

- **Frontend**: Next.js 14, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Base de Datos**: PostgreSQL 14 (3NF)
- **Testing**: Jest, React Testing Library
- **Linting**: Biome
- **CI/CD**: GitHub Actions + Husky
