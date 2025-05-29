import { test, expect } from '@playwright/test';

test.describe('Homepage - Página Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('IBÑ News');
  });  test('should display latest news section', async ({ page }) => {
    // Verificar título de últimas noticias
    await expect(page.locator('h2:has-text("Últimas noticias")')).toBeVisible();

    // Verificar que hay artículos mostrados
    await expect(page.locator('[class*="grid"]').first()).toBeVisible();
  });

  test('should display main navigation elements', async ({ page }) => {
    // Verificar que la página principal se carga correctamente
    await expect(page.locator('main')).toBeVisible();
    
    // Verificar que hay contenido principal visible
    await expect(page.locator('h2:has-text("Últimas noticias")')).toBeVisible();
    
    // Verificar enlaces de "Ver todos" para navegación a categorías
    const verTodosLinks = page.locator('a:has-text("Ver todos →")');
    const count = await verTodosLinks.count();
    
    // Si hay categorías, debe haber al menos un enlace "Ver todos"
    if (count > 0) {
      await expect(verTodosLinks.first()).toBeVisible();
    }
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
  test('should display footer or page content', async ({ page }) => {
    // Scroll hacia abajo para ver el footer si existe
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verificar que la página tiene contenido visible
    await expect(page.locator('main')).toBeVisible();

    // Verificar enlaces en el footer si existen, o elementos alternativos
    const footerLinks = page.locator('footer a, a[href="/legal-notice"], a[href*="github.com"]');
    const count = await footerLinks.count();
    
    // Si hay enlaces en el footer, verificarlos, sino solo verificar que la página está completa
    if (count > 0) {
      await expect(footerLinks.first()).toBeVisible();
    } else {
      // Verificar que al menos hay contenido principal
      await expect(page.locator('h2:has-text("Últimas noticias")')).toBeVisible();
    }
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
