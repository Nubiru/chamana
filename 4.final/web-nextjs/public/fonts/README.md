# CHAMANA Brand Fonts

This directory should contain the brand font files for CHAMANA.

## Required Fonts

### Serif Flowers (Titles Font)
- **Location**: `public/fonts/serif-flowers/`
- **Files needed**:
  - `SerifFlowers-Regular.woff2` (preferred)
  - `SerifFlowers-Regular.woff` (fallback)
- **Usage**: All headings (h1-h6), titles, CardTitle components

### Cherolina (Text Font)
- **Location**: `public/fonts/cherolina/`
- **Files needed**:
  - `Cherolina-Regular.woff2` (preferred)
  - `Cherolina-Regular.woff` (fallback)
- **Usage**: Body text, paragraphs, descriptions, CardDescription components

## Font Loading

Fonts are loaded via Next.js `localFont` in `app/layout.tsx`. If font files are not present, the application will fallback to:
- **Serif Flowers**: Georgia, serif
- **Cherolina**: system-ui, -apple-system, sans-serif

## Adding Fonts

1. Create the directory structure:
   ```
   public/
     fonts/
       serif-flowers/
       cherolina/
   ```

2. Place font files in their respective directories

3. The fonts will be automatically loaded on next build/start

## Font Format

- **Preferred**: WOFF2 (better compression, modern browsers)
- **Fallback**: WOFF (broader browser support)

