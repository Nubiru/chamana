# CHAMANA - Coleccion Magia

Catalogo digital de ropa artesanal femenina para la marca **CHAMANA** de Cintia. 14 modelos con variantes de tela y color, sin precios ni stock — las ventas se gestionan por WhatsApp.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind v4** (OKLCH brand colors)
- **Zustand** (carrito con localStorage)
- **Lucide** icons

## Estructura

```
app/(store)/          Paginas: landing, /tienda, /producto/[slug], /carrito
components/store/     Navbar, BottomNav, ProductCard, VariantSelector, etc.
components/ui/        Button, Card, Toast (base UI)
lib/data/             Datos estaticos: products.ts, fabrics.ts, categories.ts
lib/stores/           Cart store (Zustand)
lib/whatsapp.ts       Generador de URLs de WhatsApp
tests/                Unit tests (Jest)
```

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # 37 tests
npm run build     # Build de produccion
npm run lint      # Biome linter
```

## Modelos

Hechizo (Falda), Sagrada (Vestido), Intuicion (Kimono), Sabia (Remeron), Magnetica (Musculosa), Espejo (Top Reversible), Simbolo (Top), Reflejo (Top Reversible), Corazonada (Camisa), Guerrera (Bermuda), Simpleza (Short), Dejavu (Palazzo), Luz y Sombra (Palazzo), Mistica (Palazzo).
