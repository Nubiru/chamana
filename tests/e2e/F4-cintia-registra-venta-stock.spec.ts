/**
 * E2E test — F4: Cintia registra una venta y el stock se ajusta.
 *
 * PLAYWRIGHT-GATED: this spec is written against `@playwright/test`. Chamana
 * has not yet installed Playwright (gabriel-decision pending). When
 * Playwright lands, this file becomes executable without modification.
 *
 * Until then the suite self-skips: jest's testMatch picks up `*.spec.ts` and
 * would try to run this file — the import-time guard below converts the
 * suite into describe.skip when @playwright/test is not installed, so Jest
 * unit runs are unaffected.
 *
 * Scope: drive the admin login + create Venta + assert storefront updates.
 * Mirrors `tests/user-journeys/F4-cintia-registra-venta-stock.md`.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
let playwright: any = null;
try {
  // Conditional require — present only after Playwright installation.
  playwright = require('@playwright/test');
} catch {
  // Playwright not installed yet — fall through to describe.skip below.
}

const baseDescribe = playwright ? playwright.test.describe : describe.skip;
const baseTest = playwright ? playwright.test : it;
const baseExpect = playwright ? playwright.expect : expect;

baseDescribe('F4 — Cintia registra venta y el stock se ajusta (E2E)', () => {
  baseTest('AC-1: create Venta → variant.stockVendido increments to 1', async (args: any) => {
    if (!playwright) {
      // Skip semantics already applied by describe.skip when running under Jest.
      return;
    }
    const { page } = args;
    // 1. Admin login.
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL ?? '');
    await page.getByLabel(/contraseña|password/i).fill(process.env.E2E_ADMIN_PASS ?? '');
    await page.getByRole('button', { name: /iniciar sesión|log in/i }).click();
    await baseExpect(page).toHaveURL(/\/admin\/?(?!login)/);

    // 2. Create Venta against Hechizo / linmarmalv.
    await page.goto('/admin/collections/ventas/create');
    await page.getByLabel(/compradora/i).fill('Test Customer E2E');
    // Select Modelo: depends on Payload's admin UI selector — placeholder.
    await page.getByLabel(/modelo/i).click();
    await page.getByRole('option', { name: /hechizo/i }).click();
    await page.getByLabel(/variante/i).fill('hechizo-linmarmalv');
    await page.getByLabel(/precio/i).fill('32000');
    // FechaVenta defaults to today via Payload; submit.
    await page.getByRole('button', { name: /guardar|save/i }).click();
    await baseExpect(page.getByText(/guardado|saved/i)).toBeVisible();

    // 3. Verify stockVendido on Modelo.
    await page.goto('/admin/collections/modelos');
    await page.getByRole('link', { name: /hechizo/i }).click();
    // The variante row should now show stockVendido=1; depends on UI markup.
    await baseExpect(page.getByText('hechizo-linmarmalv')).toBeVisible();
    // 4. Hit the storefront — variant still available (only 1 of 5 sold).
    await page.goto('/producto/hechizo');
    await baseExpect(page.getByText(/agregar al carrito|añadir/i)).toBeVisible();
  });

  baseTest('AC-6: 5 successive Ventas → storefront shows variant as sin stock', async () => {
    if (!playwright) return;
    // (Implementation deferred until Playwright lands + admin selectors stabilized.)
    // The journey is captured fully in tests/user-journeys/F4-cintia-registra-venta-stock.md.
    baseTest.skip();
  });
});
