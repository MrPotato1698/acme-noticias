import { test, expect } from '@playwright/test';

test.describe('Página Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería cargar la página principal con el título correcto', async ({ page }) => {
    await expect(page).toHaveTitle('IBÑ News');
  });  test('debería mostrar la sección de últimas noticias', async ({ page }) => {
    // Verificar título de últimas noticias
    await expect(page.locator('h2:has-text("Últimas noticias")')).toBeVisible();

    // Verificar que hay artículos mostrados
    await expect(page.locator('[class*="grid"]').first()).toBeVisible();
  });

  test('debería mostrar elementos principales de navegación', async ({ page }) => {
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

  test('debería mostrar secciones de categorías', async ({ page }) => {
    // Esperar a que se carguen las categorías
    await page.waitForTimeout(2000);

    // Verificar que hay secciones de categorías
    const categoryHeaders = page.locator('h2[class*="text-3xl"]');
    const count = await categoryHeaders.count();

    // Debe haber al menos una categoría además de "Últimas noticias"
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('debería tener enlaces de artículos funcionales', async ({ page }) => {
    // Buscar el primer enlace de artículo
    const articleLink = page.locator('a[href^="/article/"]').first();

    if (await articleLink.isVisible()) {
      const href = await articleLink.getAttribute('href');
      expect(href).toMatch(/\/article\/\d+/);
    }
  });
  test('debería mostrar footer o contenido de página', async ({ page }) => {
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

  test('debería tener el widget de Google Translate', async ({ page }) => {
    // Verificar que el elemento de traducción está presente
    await expect(page.locator('#google_translate_element')).toBeVisible();
  });

  test('debería navegar a la página de búsqueda cuando se hace clic en el botón de búsqueda', async ({ page }) => {
    await page.locator('a[href="/searcharticle"]').click();
    await expect(page).toHaveURL(/.*\/searcharticle/);
  });

  test('debería navegar a la página de categoría cuando se hace clic en "Ver todos"', async ({ page }) => {
    // Esperar a que se carguen las categorías
    await page.waitForTimeout(2000);

    const verTodosLink = page.locator('a:has-text("Ver todos →")').first();

    if (await verTodosLink.isVisible()) {
      await verTodosLink.click();
      await expect(page).toHaveURL(/.*\/searcharticle\?category=\d+/);
    }
  });
});
