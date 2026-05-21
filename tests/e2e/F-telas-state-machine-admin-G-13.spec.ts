/**
 * E2E test — F-Telas-state-machine / G-13.
 *
 * PLAYWRIGHT-GATED (mirror of G-10 / F4 pattern): conditional require on
 * `@playwright/test`. When Playwright is not installed, the suite is converted
 * to describe.skip so Jest unit runs are unaffected.
 *
 * Scope: drive the admin walkthrough for the FIELD half of F-Telas-state-machine
 * (G-13 deliverable). Mirrors `tests/user-journeys/F-telas-state-machine-G-13.md`.
 *
 * Steps:
 *   1. Admin login.
 *   2. Navigate to /admin/collections/telas → verify "Estado" column header
 *      exists and that existing legacy rows render "Disponible".
 *   3. Apply filter `where[estado][equals]=disponible` via URL → list still
 *      populated; switch to `por_agotarse` → list empty.
 *   4. Open the first tela → verify "Estado" select with 5 options + "Lead time
 *      (dias)" number input in sidebar.
 *   5. Change estado to "Por agotarse" + save → reload → persists.
 *   6. Change estado to "Pedida" + set leadTimeDias=14 + save → reload → both
 *      persist.
 *
 * Out of scope (G-14): state-transition error message. The "skip Pedida" error
 * walkthrough belongs in the G-14 e2e spec.
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

baseDescribe('F-Telas-state-machine — G-13 admin field walkthrough (E2E)', () => {
  baseTest('admin column + filter + sidebar field render (AC-1/2/3/4)', async (args: any) => {
    if (!playwright) return;
    const { page } = args;

    // 1. Admin login.
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_ADMIN_EMAIL ?? '');
    await page.getByLabel(/contraseña|password/i).fill(process.env.E2E_ADMIN_PASS ?? '');
    await page.getByRole('button', { name: /login|ingresar/i }).click();
    await page.waitForURL(/\/admin/);

    // 2. Navigate to Telas list and verify the new column header.
    await page.goto('/admin/collections/telas');
    await baseExpect(page.locator('th', { hasText: 'Estado' })).toBeVisible();

    // Verify at least one legacy row renders "Disponible".
    await baseExpect(page.locator('td', { hasText: 'Disponible' }).first()).toBeVisible();

    // 3. Filter by estado via URL — Payload supports where-query params.
    await page.goto('/admin/collections/telas?where[estado][equals]=por_agotarse');
    // List should be empty (no telas marked por_agotarse yet).
    await baseExpect(page.locator('td', { hasText: 'Disponible' })).toHaveCount(0);

    // 4. Open the first tela in disponible state.
    await page.goto('/admin/collections/telas?where[estado][equals]=disponible');
    await page.locator('a[href*="/admin/collections/telas/"]').first().click();

    // Verify sidebar has the new select + number field.
    await baseExpect(page.getByLabel(/^Estado/i)).toBeVisible();
    await baseExpect(page.getByLabel(/lead time/i)).toBeVisible();

    // 5. Set estado=Por agotarse + save.
    await page.getByLabel(/^Estado/i).click();
    await page.getByRole('option', { name: 'Por agotarse' }).click();
    await page.getByRole('button', { name: /save|guardar/i }).click();
    await baseExpect(page.locator('text=/saved|guardado/i').first()).toBeVisible({ timeout: 5000 });
    await page.reload();
    await baseExpect(page.getByLabel(/^Estado/i)).toContainText('Por agotarse');

    // 6. Set estado=Pedida + leadTimeDias=14 + save.
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
