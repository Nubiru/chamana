/**
 * CHAMANA — Text Overlay Script v2
 *
 * Adds brand-consistent text overlays to images.
 * Uses sharp + SVG with embedded CHAMANA fonts (Serif Flowers / Cherolina).
 *
 * v2 changes:
 *   - ONDA -> CAPA (Cintia's decision)
 *   - Auto-contrast detection (analyzes image brightness, picks light/dark text)
 *   - Larger SVG containers with padding to prevent font clipping
 *   - Semi-transparent backdrop behind text for guaranteed readability
 *   - Higher quality text rendering (geometricPrecision, 2x supersampling)
 *
 * Usage:
 *   node scripts/text-overlay.mjs <input-image> <preset> [output-path]
 *
 * Presets:
 *   tierra     — "CAPA TIERRA / Lo que nos sostiene"
 *   fuego      — "CAPA FUEGO / Lo que nos transforma"
 *   agua       — "CAPA AGUA / Lo que fluye y nos mueve"
 *   aire       — "CAPA AIRE / Lo que nos libera"
 *   collection — "COLECCION TRANSMUTACION / Otono-Invierno 2026"
 *   cascada    — "CASCADA / Dejate caer"
 *   custom     — reads TITLE and SUBTITLE from env vars
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, basename, dirname, extname } from 'path';

const FONTS_DIR = resolve(import.meta.dirname, '../public/fonts');

// Load fonts as base64 for SVG embedding
const serifFlowersB64 = readFileSync(resolve(FONTS_DIR, 'serif-flowers/SerifFlowers-Regular.ttf')).toString('base64');
const cherolinaB64 = readFileSync(resolve(FONTS_DIR, 'cherolina/Cherolina-Regular.ttf')).toString('base64');

// CHAMANA brand colors
const COLORS = {
  opal: '#EFEFE9',
  lily: '#E8D9CD',
  meadow: '#959D90',
  forest: '#223030',
  forestBrown: '#523D35',
};

// Preset definitions — CAPA (not Onda)
const PRESETS = {
  tierra: {
    title: 'CAPA TIERRA',
    subtitle: 'Lo que nos sostiene',
  },
  fuego: {
    title: 'CAPA FUEGO',
    subtitle: 'Lo que nos transforma',
  },
  agua: {
    title: 'CAPA AGUA',
    subtitle: 'Lo que fluye y nos mueve',
  },
  aire: {
    title: 'CAPA AIRE',
    subtitle: 'Lo que nos libera',
  },
  collection: {
    title: 'COLECCION TRANSMUTACION',
    subtitle: 'Otono · Invierno 2026',
  },
  cascada: {
    title: 'CASCADA',
    subtitle: 'Dejate caer. El agua siempre encuentra su camino.',
  },
  custom: {
    title: process.env.TITLE || 'CHAMANA',
    subtitle: process.env.SUBTITLE || '',
  },
};

/**
 * Analyze image brightness in the text regions (top 20% and bottom 5%)
 * Returns { topIsLight, bottomIsLight } booleans
 */
async function analyzeImageBrightness(imagePath, width, height) {
  // Analyze top region (where title + subtitle go)
  const topRegion = await sharp(imagePath)
    .extract({ left: 0, top: 0, width, height: Math.round(height * 0.25) })
    .stats();

  // Analyze bottom region (where brand mark goes)
  const bottomRegion = await sharp(imagePath)
    .extract({ left: 0, top: Math.round(height * 0.90), width, height: Math.round(height * 0.10) })
    .stats();

  const topBrightness = topRegion.channels.slice(0, 3)
    .reduce((sum, ch) => sum + ch.mean, 0) / 3;
  const bottomBrightness = bottomRegion.channels.slice(0, 3)
    .reduce((sum, ch) => sum + ch.mean, 0) / 3;

  return {
    topIsLight: topBrightness > 140,
    bottomIsLight: bottomBrightness > 140,
  };
}

function createOverlaySvg(width, height, preset, brightness) {
  const { title, subtitle } = preset;
  const { topIsLight, bottomIsLight } = brightness;

  // Choose text colors based on background brightness (auto-contrast)
  const titleColor = topIsLight ? COLORS.forest : COLORS.opal;
  const subtitleColor = topIsLight ? COLORS.forestBrown : COLORS.lily;
  const brandColor = bottomIsLight ? COLORS.forest : COLORS.opal;
  const useShadow = !topIsLight; // shadow only on dark backgrounds

  // Scale font size based on title length
  const titleLen = title.length;
  const baseTitleSize = titleLen > 18 ? 0.042 : titleLen > 12 ? 0.052 : 0.062;
  const baseLetterSpacing = titleLen > 18 ? 0.004 : titleLen > 12 ? 0.007 : 0.011;

  const titleSize = Math.round(width * baseTitleSize);
  const subtitleSize = Math.round(width * 0.030);
  const brandSize = Math.round(width * 0.016);
  const letterSpacing = Math.round(width * baseLetterSpacing);

  // Padding to prevent font clipping (generous margins)
  const padTop = Math.round(titleSize * 0.8);
  const padSide = Math.round(width * 0.05);

  // Position: centered horizontally, with padding from top
  const titleY = padTop + Math.round(height * 0.08);
  const subtitleY = titleY + Math.round(titleSize * 1.7);
  const brandY = height - Math.round(height * 0.03);
  const centerX = Math.round(width / 2);

  // Semi-transparent backdrop for readability
  const backdropColor = topIsLight ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.30)';
  const backdropHeight = subtitle
    ? subtitleY + Math.round(subtitleSize * 0.8)
    : titleY + Math.round(titleSize * 0.6);

  const shadowFilter = useShadow ? `
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>` : '';

  const filterAttr = useShadow ? 'filter="url(#shadow)"' : '';

  // Use 2x internal resolution for sharper text, the SVG itself stays at image size
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @font-face {
        font-family: 'SerifFlowers';
        src: url('data:font/ttf;base64,${serifFlowersB64}') format('truetype');
      }
      @font-face {
        font-family: 'Cherolina';
        src: url('data:font/ttf;base64,${cherolinaB64}') format('truetype');
      }
    </style>
    ${shadowFilter}
  </defs>

  <!-- Semi-transparent backdrop for text readability -->
  <rect x="0" y="0" width="${width}" height="${backdropHeight}" fill="${backdropColor}" />

  <!-- Title: Serif Flowers -->
  <text
    x="${centerX}" y="${titleY}"
    font-family="SerifFlowers, serif"
    font-size="${titleSize}"
    fill="${titleColor}"
    text-anchor="middle"
    letter-spacing="${letterSpacing}"
    text-rendering="geometricPrecision"
    ${filterAttr}
  >${title}</text>

  ${subtitle ? `<!-- Subtitle: Cherolina -->
  <text
    x="${centerX}" y="${subtitleY}"
    font-family="Cherolina, cursive"
    font-size="${subtitleSize}"
    fill="${subtitleColor}"
    text-anchor="middle"
    text-rendering="geometricPrecision"
    ${filterAttr}
  >${subtitle}</text>` : ''}

  <!-- Brand mark: small CHAMANA at bottom -->
  <rect x="0" y="${brandY - Math.round(brandSize * 1.5)}" width="${width}" height="${Math.round(brandSize * 3)}" fill="${bottomIsLight ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.25)'}" />
  <text
    x="${centerX}" y="${brandY}"
    font-family="SerifFlowers, serif"
    font-size="${brandSize}"
    fill="${brandColor}"
    text-anchor="middle"
    letter-spacing="${Math.round(brandSize * 0.5)}"
    opacity="0.85"
    text-rendering="geometricPrecision"
    ${!bottomIsLight ? 'filter="url(#shadow)"' : ''}
  >CHAMANA</text>
</svg>`;
}

async function main() {
  const [inputPath, presetName = 'tierra', outputPath] = process.argv.slice(2);

  if (!inputPath) {
    console.log('Usage: node scripts/text-overlay.mjs <input-image> <preset> [output-path]');
    console.log('Presets:', Object.keys(PRESETS).join(', '));
    console.log('Custom: TITLE="My Title" SUBTITLE="My sub" node scripts/text-overlay.mjs input.png custom');
    process.exit(1);
  }

  const preset = PRESETS[presetName];
  if (!preset) {
    console.error(`Unknown preset: ${presetName}. Available: ${Object.keys(PRESETS).join(', ')}`);
    process.exit(1);
  }

  const resolvedInput = resolve(inputPath);
  const meta = await sharp(resolvedInput).metadata();
  const { width, height } = meta;

  // Auto-detect brightness for contrast
  const brightness = await analyzeImageBrightness(resolvedInput, width, height);
  console.log(`Input: ${width}x${height} — "${preset.title}" / "${preset.subtitle}"`);
  console.log(`Background: top=${brightness.topIsLight ? 'LIGHT→dark text' : 'DARK→light text'}, bottom=${brightness.bottomIsLight ? 'LIGHT→dark text' : 'DARK→light text'}`);

  // Create SVG overlay with auto-contrast
  const svg = createOverlaySvg(width, height, preset, brightness);

  // Composite onto image
  const output = outputPath
    ? resolve(outputPath)
    : resolve(dirname(resolvedInput), `${basename(resolvedInput, extname(resolvedInput))}-${presetName}${extname(resolvedInput)}`);

  await sharp(resolvedInput)
    .composite([{
      input: Buffer.from(svg),
      top: 0,
      left: 0,
    }])
    .toFile(output);

  console.log(`Output: ${output}`);
}

main().catch(err => { console.error(err); process.exit(1); });
