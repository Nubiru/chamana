/**
 * E2E test — F-Variante-metrosRequeridos-Modelo-estado / G-17.
 *
 * PLAYWRIGHT-GATED (same conditional-require pattern as G-13/G-14 e2e files).
 * Drives an admin walkthrough exercising several Modelo lifecycle transitions
 * plus one invalid transition that surfaces the Spanish error from the hook
 * in the admin UI.
 *
 * Steps mirror tests/user-journeys/F-modelos-state-machine-G-17.md:
 *   1. Login + open a Modelo (estado nueva by default post-G-16 migration).
 *   2. Transition to en_produccion (valid) → success message.
 *   3. Attempt nueva → en_stock on another Modelo (INVALID) → assert
 *      Spanish error visible in admin.
 *   4. Transition en_produccion → en_stock (valid) → success.
 *   5. Mark descontinuada → attempt to revert → assert "ninguna (estado
 *      final)" Spanish error.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
let playwright: any = null;
try {
  playwright = require('@playwright/test');
} catch {
  /* fall through to describe.skip when Playwright is not installed */
}

const baseDescribe = playwright ? playwright.test.describe : describe.skip;
const baseTest = playwright ? playwright.test : it;
const baseExpect = playwright ? playwright.expect : expect;

baseDescribe('F-Modelos-state-machine — G-17 transition walkthrough (E2E)', () => {
  baseTest('valid + invalid transitions surface Spanish error (AC-5/6)', async (args: any) => {
    if (!playwright) return;
    const { page } = args;

    // 1. Login.
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL ?? '');
    await page.getByLabel(/contraseña|password/i).fill(process.env.E2E_ADMIN_PASS ?? '');
    await page.getByRole('button', { name: /login|ingresar/i }).click();
    await page.waitForURL(/\/admin/);

    // Open the first Modelo in estado=nueva (defaultValue post-G-16 migration).
    await page.goto('/admin/collections/modelos?where[estado][equals]=nueva');
    await page.locator('a[href*="/admin/collections/modelos/"]').first().click();

    // 2. nueva → en_produccion (valid).
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'En produccion' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });

    // 3. Try to skip production by going en_produccion → sin_stock (INVALID).
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Sin stock' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(
      page.locator(
        'text=/No se puede cambiar el estado de "En produccion" a "Sin stock"\\. Transiciones permitidas: Nueva, En stock, Descontinuada\\./'
      )
    ).toBeVisible({ timeout: 5000 });

    // The estado should NOT have changed despite the failed save.
    await page.reload();
    await baseExpect(page.getByLabel(/^Estado/i)).toContainText('En produccion');

    // 4. en_produccion → en_stock (valid).
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'En stock' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });

    // 5. en_stock → descontinuada → attempt revert → terminal error.
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Descontinuada' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });

    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'En stock' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(
      page.locator(
        'text=/No se puede cambiar el estado de "Descontinuada" a "En stock"\\. Transiciones permitidas: ninguna \\(estado final\\)\\./'
      )
    ).toBeVisible({ timeout: 5000 });

    await page.reload();
    await baseExpect(page.getByLabel(/^Estado/i)).toContainText('Descontinuada');
  });
});
