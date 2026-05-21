/**
 * E2E test — F-Telas-state-machine / G-14.
 *
 * PLAYWRIGHT-GATED (same conditional-require pattern as G-13's e2e file).
 * Drives an admin walkthrough exercising several transitions plus one invalid
 * transition that surfaces the Spanish error from the hook in the admin UI.
 *
 * Steps mirror tests/user-journeys/F-telas-state-machine-G-14.md:
 *   1. Login + open a tela (estado disponible).
 *   2. Transition to por_agotarse (valid) → success message.
 *   3. Transition to agotada (valid) → success.
 *   4. Attempt agotada → disponible (INVALID) → assert Spanish error visible.
 *   5. Transition agotada → pedida (valid) + set leadTimeDias → success.
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

baseDescribe('F-Telas-state-machine — G-14 transition walkthrough (E2E)', () => {
  baseTest('valid + invalid transitions surface Spanish error (AC-5/6)', async (args: any) => {
    if (!playwright) return;
    const { page } = args;

    // 1. Login.
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL ?? '');
    await page.getByLabel(/contraseña|password/i).fill(process.env.E2E_ADMIN_PASS ?? '');
    await page.getByRole('button', { name: /login|ingresar/i }).click();
    await page.waitForURL(/\/admin/);

    // Open the first tela in estado=disponible.
    await page.goto('/admin/collections/telas?where[estado][equals]=disponible');
    await page.locator('a[href*="/admin/collections/telas/"]').first().click();

    // 2. disponible → por_agotarse (valid).
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Por agotarse' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });

    // 3. por_agotarse → agotada (valid).
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Agotada' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });

    // 4. agotada → disponible (INVALID) — assert the verbatim Spanish error
    //    text from the hook is visible in the admin error surface.
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Disponible' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(
      page.locator(
        'text=/No se puede cambiar el estado de "Agotada" a "Disponible". Transiciones permitidas: Pedida, Descontinuada\\./'
      )
    ).toBeVisible({ timeout: 5000 });

    // The estado should NOT have changed despite the failed save.
    await page.reload();
    await baseExpect(page.getByLabel(/^Estado/i)).toContainText('Agotada');

    // 5. agotada → pedida (valid) + set leadTimeDias.
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Pedida' }).click();
    await page.getByLabel(/lead time/i).fill('14');
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });
    await page.reload();
    await baseExpect(page.getByLabel(/^Estado/i)).toContainText('Pedida');
    await baseExpect(page.getByLabel(/lead time/i)).toHaveValue('14');
  });
});
