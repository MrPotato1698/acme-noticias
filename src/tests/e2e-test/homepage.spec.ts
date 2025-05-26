import { test, expect } from '@playwright/test';

test.describe('Homepage - Página Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('IBÑ News');
  });

  test('should display header with logo and navigation', async ({ page }) => {
    // Verificar que el logo está presente
    await expect(page.locator('img[alt="IBÑ News Logo"]')).toBeVisible();

    // Verificar texto del título
    await expect(page.locator('span:has-text("IBÑ News: Acme Noticias")')).toBeVisible();

    // Verificar botón de búsqueda
    await expect(page.locator('a[href="/searcharticle"]')).toBeVisible();
  });

  test('should display latest news section', async ({ page }) => {
    // Verificar título de últimas noticias
    await expect(page.locator('h2:has-text("Últimas noticias")')).toBeVisible();

    // Verificar que hay artículos mostrados
    await expect(page.locator('[class*="grid"]').first()).toBeVisible();
  });

  test('should display category sections', async ({ page }) => {
    // Esperar a que se carguen las categorías
    await page.waitForTimeout(2000);

    // Verificar que hay secciones de categorías
    const categoryHeaders = page.locator('h2[class*="text-3xl"]');
    const count = await categoryHeaders.count();

    // Debe haber al menos una categoría además de "Últimas noticias"
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should have working article links', async ({ page }) => {
    // Buscar el primer enlace de artículo
    const articleLink = page.locator('a[href^="/article/"]').first();

    if (await articleLink.isVisible()) {
      const href = await articleLink.getAttribute('href');
      expect(href).toMatch(/\/article\/\d+/);
    }
  });

  test('should display footer with legal notice link', async ({ page }) => {
    // Scroll hacia abajo para ver el footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verificar enlace de aviso legal
    await expect(page.locator('a[href="/legal-notice"]')).toBeVisible();

    // Verificar enlace de GitHub
    await expect(page.locator('a[href*="github.com"]')).toBeVisible();
  });

  test('should have Google Translate widget', async ({ page }) => {
    // Verificar que el elemento de traducción está presente
    await expect(page.locator('#google_translate_element')).toBeVisible();
  });

  test('should navigate to search page when clicking search button', async ({ page }) => {
    await page.locator('a[href="/searcharticle"]').click();
    await expect(page).toHaveURL(/.*\/searcharticle/);
  });

  test('should navigate to category page when clicking "Ver todos"', async ({ page }) => {
    // Esperar a que se carguen las categorías
    await page.waitForTimeout(2000);

    const verTodosLink = page.locator('a:has-text("Ver todos →")').first();

    if (await verTodosLink.isVisible()) {
      await verTodosLink.click();
      await expect(page).toHaveURL(/.*\/searcharticle\?category=\d+/);
    }
  });
});
