# CHAMANA - Aplicación Next.js

Este es un proyecto [Next.js](https://nextjs.org) creado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Inicio Rápido

Primero, ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

Puedes comenzar a editar la página modificando `app/page.tsx`. La página se actualiza automáticamente mientras editas el archivo.

Este proyecto utiliza [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para optimizar y cargar automáticamente las fuentes de marca CHAMANA (Serif Flowers y Cherolina).

## 📚 Aprende Más

Para aprender más sobre Next.js, consulta los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - aprende sobre las características y API de Next.js.
- [Aprende Next.js](https://nextjs.org/learn) - un tutorial interactivo de Next.js.

Puedes revisar [el repositorio de Next.js en GitHub](https://github.com/vercel/next.js) - ¡tus comentarios y contribuciones son bienvenidos!

## 🚀 Desplegar en Vercel

La forma más fácil de desplegar tu aplicación Next.js es usar [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) de los creadores de Next.js.

Consulta nuestra [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

---

## 📋 Estructura del Proyecto

```
web-nextjs/
├── app/                    # Rutas y páginas Next.js
│   ├── (dashboard)/        # Páginas protegidas
│   ├── api/               # API Routes
│   └── page.tsx           # Página principal
├── src/
│   ├── domains/           # Lógica de dominio (DDD)
│   ├── infrastructure/    # Base de datos, Auth, Config
│   └── shared/           # Utilidades compartidas
├── components/            # Componentes UI
└── __tests__/            # Tests completos
```

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Construcción
npm run build            # Construye para producción
npm run start            # Inicia servidor de producción

# Calidad
npm run lint             # Ejecuta linter (Biome)
npm run typecheck        # Verifica tipos TypeScript
npm run test             # Ejecuta tests
npm run test:coverage    # Tests con cobertura

# Validación completa
npm run validate         # lint + typecheck + test + build
```

---

**Última Actualización**: Noviembre 2025
