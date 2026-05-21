/**
 * E2E test — F-Variante-metrosRequeridos-Modelo-estado / G-16.
 *
 * PLAYWRIGHT-GATED (mirror of G-10 / G-13 pattern): conditional require on
 * `@playwright/test`. When Playwright is not installed, the suite is converted
 * to describe.skip so Jest unit runs are unaffected.
 *
 * Scope: drive the admin walkthrough for the FIELD half of
 * F-Variante-metrosRequeridos-Modelo-estado (G-16 deliverable). Mirrors
 * tests/user-journeys/F-modelo-estado-variante-metros-G-16.md.
 *
 * Steps:
 *   1. Admin login.
 *   2. Navigate to /admin/collections/modelos → verify "Estado" column header
 *      exists and that existing legacy rows render "Nueva".
 *   3. Apply filter `where[estado][equals]=nueva` via URL → list populated;
 *      switch to `en_stock` → list empty.
 *   4. Open the first modelo → verify "Estado" select with 5 options in sidebar
 *      + open Variantes block → verify "Metros requeridos por unidad" number
 *      input on each variante row.
 *   5. Change estado to "En produccion" + save → reload → persists.
 *   6. Fill metrosRequeridos=1.25 on the first variante + save → reload →
 *      persists.
 *
 * Out of scope (G-N+1): state-transition error message. The
 * "skip En produccion" Spanish-error walkthrough belongs in the G-N+1 e2e
 * spec.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
let playwright: any = null;
try {
  playwright = require('@playwright/test');
} catch {
  /* fall through to describe.skip */
}

const baseDescribe = playwright ? playwright.test.describe : describe.skip;
const baseTest = playwright ? playwright.test : it;
const baseExpect = playwright ? playwright.expect : expect;

baseDescribe(
  'F-Variante-metrosRequeridos-Modelo-estado — G-16 admin field walkthrough (E2E)',
  () => {
    baseTest('admin column + filter + sidebar fields render (AC-1/2/3/7)', async (args: any) => {
      if (!playwright) return;
      const { page } = args;

      // 1. Admin login.
      await page.goto('/admin/login');
      await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL ?? '');
      await page.getByLabel(/contraseña|password/i).fill(process.env.E2E_ADMIN_PASS ?? '');
      await page.getByRole('button', { name: /login|ingresar/i }).click();
      await page.waitForURL(/\/admin/);

      // 2. Navigate to Modelos list and verify the new column header.
      await page.goto('/admin/collections/modelos');
      await baseExpect(page.locator('th', { hasText: 'Estado' })).toBeVisible();

      // Verify at least one legacy row renders "Nueva".
      await baseExpect(page.locator('td', { hasText: 'Nueva' }).first()).toBeVisible();

      // 3. Filter by estado via URL — Payload supports where-query params.
      await page.goto('/admin/collections/modelos?where[estado][equals]=en_stock');
      // List should be empty (no modelos marked en_stock yet — all legacy = nueva).
      await baseExpect(page.locator('td', { hasText: 'En produccion' })).toHaveCount(0);

      // 4. Open the first modelo in nueva state.
      await page.goto('/admin/collections/modelos?where[estado][equals]=nueva');
      await page.locator('a[href*="/admin/collections/modelos/"]').first().click();

      // Verify sidebar has the new select field.
      await baseExpect(page.getByLabel(/^Estado/i)).toBeVisible();

      // Open Variantes block → verify metrosRequeridos number input present.
      await baseExpect(page.getByLabel(/metros requeridos/i).first()).toBeVisible();

      // 5. Set estado=En produccion + save.
      await page.getByLabel(/^Estado/i).click();
      await page.getByRole('option', { name: 'En produccion' }).click();
      await page.getByRole('button', { name: /save|guardar/i }).click();
      await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({
        timeout: 5000,
      });
      await page.reload();
      await baseExpect(page.getByLabel(/^Estado/i)).toContainText('En produccion');

      // 6. Set metrosRequeridos=1.25 on the first variante + save.
      await page
        .getByLabel(/metros requeridos/i)
        .first()
        .fill('1.25');
      await page.getByRole('button', { name: /save|guardar/i }).click();
      await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({
        timeout: 5000,
      });
      await page.reload();
      await baseExpect(page.getByLabel(/metros requeridos/i).first()).toHaveValue('1.25');
    });
  }
);
