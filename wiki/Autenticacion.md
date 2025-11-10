# Sistema de Autenticación

## Tecnología

- **Framework**: NextAuth.js v5
- **Estrategia**: JWT (JSON Web Tokens)
- **Almacenamiento**: PostgreSQL

## Configuración

### Variables de Entorno

```bash
NEXTAUTH_SECRET=tu_secret_key_aqui
NEXTAUTH_URL=http://localhost:3000
```

## Roles y Permisos

### Roles Disponibles

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso completo al sistema |
| **customer** | Acceso a pedidos propios |
| **artisan** | Gestión de productos y comisiones |
| **guest** | Solo lectura de catálogo |

### Protección de Rutas

```typescript
// Rutas públicas
/api/products (GET)
/api/views/* (GET)

// Rutas autenticadas
/api/orders (POST, GET - requiere auth)
/api/customers (PATCH - requiere auth)

// Rutas admin
/api/admin/* (requiere rol admin)
```

## Middleware de Autenticación

**Ubicación**: `src/infrastructure/auth/middleware.ts`

**Uso**:
```typescript
import { auth } from '@/infrastructure/auth/middleware';

export const POST = auth(async (request, { user }) => {
  // user contiene información del usuario autenticado
  // ...
});
```

## Flujo de Autenticación

1. Usuario inicia sesión → `/api/auth/signin`
2. Sistema valida credenciales contra DB
3. Genera JWT con información de usuario y rol
4. Cliente almacena token
5. Requests subsecuentes incluyen token en header
6. Middleware valida token y extrae usuario
