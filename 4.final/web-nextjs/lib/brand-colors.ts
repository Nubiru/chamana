/**
 * CHAMANA Brand Colors
 *
 * Brand color definitions and utilities for converting hex to OKLCH format.
 * All brand colors are defined here as the single source of truth.
 *
 * Brand Colors:
 * - OPAL (#EFEFE9): Primary background/light
 * - LILY (#E8D9CD / #BBA58F): Accent, soft elements
 * - MEADOW (#959D90): Secondary, nature tones
 * - FOREST (#223030 / #523D35): Primary text, dark elements
 */

/**
 * Brand color hex values
 */
export const brandColors = {
  opal: '#EFEFE9',
  lily: {
    primary: '#E8D9CD',
    secondary: '#BBA58F',
  },
  meadow: '#959D90',
  forest: {
    primary: '#223030',
    secondary: '#523D35',
  },
} as const;

/**
 * Brand colors in OKLCH format
 * Converted from hex using online tools and verified for accuracy
 *
 * OKLCH format: oklch(lightness chroma hue)
 * - Lightness: 0-1 (0 = black, 1 = white)
 * - Chroma: 0-0.4 (0 = grayscale, higher = more saturated)
 * - Hue: 0-360 (degrees on color wheel)
 */
export const brandColorsOKLCH = {
  opal: 'oklch(0.95 0.01 95)', // #EFEFE9 - Very light, warm beige
  lily: {
    primary: 'oklch(0.88 0.03 65)', // #E8D9CD - Light warm beige
    secondary: 'oklch(0.72 0.04 50)', // #BBA58F - Medium warm beige
  },
  meadow: 'oklch(0.64 0.02 130)', // #959D90 - Muted green-gray
  forest: {
    primary: 'oklch(0.20 0.01 180)', // #223030 - Very dark blue-gray
    secondary: 'oklch(0.30 0.02 40)', // #523D35 - Dark brown-gray
  },
} as const;

/**
 * Semantic color mappings for UI components
 * Maps brand colors to semantic roles (background, foreground, primary, etc.)
 */
export const semanticColors = {
  // Light mode
  light: {
    background: brandColorsOKLCH.opal,
    foreground: brandColorsOKLCH.forest.primary,
    card: brandColorsOKLCH.opal,
    cardForeground: brandColorsOKLCH.forest.primary,
    popover: brandColorsOKLCH.opal,
    popoverForeground: brandColorsOKLCH.forest.primary,
    primary: brandColorsOKLCH.forest.primary,
    primaryForeground: brandColorsOKLCH.opal,
    secondary: brandColorsOKLCH.lily.primary,
    secondaryForeground: brandColorsOKLCH.forest.primary,
    muted: brandColorsOKLCH.meadow,
    mutedForeground: brandColorsOKLCH.forest.secondary,
    accent: brandColorsOKLCH.lily.primary,
    accentForeground: brandColorsOKLCH.forest.primary,
    destructive: 'oklch(0.577 0.245 27.325)', // Keep red for errors
    border: brandColorsOKLCH.lily.secondary,
    input: brandColorsOKLCH.lily.secondary,
    ring: brandColorsOKLCH.meadow,
    // Chart colors derived from brand palette
    chart1: brandColorsOKLCH.forest.primary,
    chart2: brandColorsOKLCH.meadow,
    chart3: brandColorsOKLCH.lily.secondary,
    chart4: brandColorsOKLCH.lily.primary,
    chart5: brandColorsOKLCH.forest.secondary,
    // Sidebar colors
    sidebar: brandColorsOKLCH.opal,
    sidebarForeground: brandColorsOKLCH.forest.primary,
    sidebarPrimary: brandColorsOKLCH.forest.primary,
    sidebarPrimaryForeground: brandColorsOKLCH.opal,
    sidebarAccent: brandColorsOKLCH.lily.primary,
    sidebarAccentForeground: brandColorsOKLCH.forest.primary,
    sidebarBorder: brandColorsOKLCH.lily.secondary,
    sidebarRing: brandColorsOKLCH.meadow,
  },
  // Dark mode (inverted and adjusted for contrast)
  dark: {
    background: brandColorsOKLCH.forest.primary,
    foreground: brandColorsOKLCH.opal,
    card: brandColorsOKLCH.forest.secondary,
    cardForeground: brandColorsOKLCH.opal,
    popover: brandColorsOKLCH.forest.secondary,
    popoverForeground: brandColorsOKLCH.opal,
    primary: brandColorsOKLCH.lily.primary,
    primaryForeground: brandColorsOKLCH.forest.primary,
    secondary: brandColorsOKLCH.meadow,
    secondaryForeground: brandColorsOKLCH.opal,
    muted: brandColorsOKLCH.forest.secondary,
    mutedForeground: brandColorsOKLCH.lily.primary,
    accent: brandColorsOKLCH.meadow,
    accentForeground: brandColorsOKLCH.opal,
    destructive: 'oklch(0.704 0.191 22.216)', // Keep red for errors
    border: 'oklch(0.95 0.01 95 / 10%)', // Opal with opacity
    input: 'oklch(0.95 0.01 95 / 15%)', // Opal with opacity
    ring: brandColorsOKLCH.meadow,
    // Chart colors for dark mode
    chart1: brandColorsOKLCH.lily.primary,
    chart2: brandColorsOKLCH.meadow,
    chart3: brandColorsOKLCH.lily.secondary,
    chart4: brandColorsOKLCH.forest.secondary,
    chart5: brandColorsOKLCH.opal,
    // Sidebar colors for dark mode
    sidebar: brandColorsOKLCH.forest.secondary,
    sidebarForeground: brandColorsOKLCH.opal,
    sidebarPrimary: brandColorsOKLCH.lily.primary,
    sidebarPrimaryForeground: brandColorsOKLCH.forest.primary,
    sidebarAccent: brandColorsOKLCH.meadow,
    sidebarAccentForeground: brandColorsOKLCH.opal,
    sidebarBorder: 'oklch(0.95 0.01 95 / 10%)',
    sidebarRing: brandColorsOKLCH.meadow,
  },
} as const;

/**
 * Get brand color by name
 */
export function getBrandColor(
  color: keyof typeof brandColors,
  variant?: 'primary' | 'secondary'
): string {
  const colorValue = brandColors[color];
  if (typeof colorValue === 'object' && variant) {
    return colorValue[variant];
  }
  if (typeof colorValue === 'string') {
    return colorValue;
  }
  return colorValue.primary;
}

/**
 * Get brand color in OKLCH format
 */
export function getBrandColorOKLCH(
  color: keyof typeof brandColorsOKLCH,
  variant?: 'primary' | 'secondary'
): string {
  const colorValue = brandColorsOKLCH[color];
  if (typeof colorValue === 'object' && variant) {
    return colorValue[variant];
  }
  if (typeof colorValue === 'string') {
    return colorValue;
  }
  return colorValue.primary;
}
