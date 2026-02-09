# Fuentes de Marca CHAMANA

Este directorio debe contener los archivos de fuentes de marca para CHAMANA.

## Fuentes Requeridas

### Serif Flowers (Fuente para Títulos)

- **Ubicación**: `public/fonts/serif-flowers/`
- **Archivos necesarios**:
  - `SerifFlowers-Regular.woff2` (preferido)
  - `SerifFlowers-Regular.woff` (respaldo)
- **Uso**: Todos los encabezados (h1-h6), títulos, componentes CardTitle

### Cherolina (Fuente para Texto)

- **Ubicación**: `public/fonts/cherolina/`
- **Archivos necesarios**:
  - `Cherolina-Regular.woff2` (preferido)
  - `Cherolina-Regular.woff` (respaldo)
- **Uso**: Texto del cuerpo, párrafos, descripciones, componentes CardDescription

## Carga de Fuentes

Las fuentes se cargan mediante `localFont` de Next.js en `app/layout.tsx`. Si los archivos de fuentes no están presentes, la aplicación usará respaldo a:

- **Serif Flowers**: Georgia, serif
- **Cherolina**: system-ui, -apple-system, sans-serif

## Agregar Fuentes

1. Crear la estructura de directorios:

   ```
   public/
     fonts/
       serif-flowers/
       cherolina/
   ```

2. Colocar los archivos de fuentes en sus respectivos directorios

3. Las fuentes se cargarán automáticamente en el próximo build/start

## Formato de Fuente

- **Preferido**: WOFF2 (mejor compresión, navegadores modernos)
- **Respaldo**: WOFF (soporte más amplio de navegadores)

---

**Nota**: Si no tienes los archivos de fuentes, la aplicación funcionará correctamente usando las fuentes de respaldo del sistema.
