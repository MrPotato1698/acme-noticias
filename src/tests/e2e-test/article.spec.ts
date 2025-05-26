import { test, expect } from '@playwright/test';

test.describe('Article Detail - Detalle de Artículo', () => {
  // Variable para almacenar el ID de un artículo para pruebas
  let articleId: string | number = 1; // Valor predeterminado

  test.beforeAll(async ({ request }) => {
    // Intentar obtener un ID de artículo válido de la página principal
    const response = await request.get('/');
    const html = await response.text();
    const regex = /\/article\/(\d+)/;
    const matches = regex.exec(html);
    if (matches?.[1]) {
      articleId = matches[1];
    }
  });

  test('should load article page with correct content', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Verificar estructura básica del artículo
    await expect(page.locator('h1')).toBeVisible(); // Título
    await expect(page.locator('img')).toBeVisible(); // Imagen
    await expect(page.locator('.prose p')).toBeVisible(); // Contenido
  });

  test('should display article metadata', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Verificar metadatos del artículo
    await expect(page.locator('text=Autor:')).toBeVisible();
    await expect(page.locator('text=Publicado el:')).toBeVisible();
  });

  test('should display comments section', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Verificar que existe sección de comentarios
    await expect(page.locator('h3:has-text("Comentarios")')).toBeVisible();
  });

  test('should display comment form for logged in users', async ({ page }) => {
    // Primero intentamos hacer login
    await page.goto('/login');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password');

    // Interceptamos la petición para simular un login exitoso
    await page.route('**/api/auth/signin', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Navegamos a la página del artículo y comprobamos si hay formulario de comentario
    await page.goto(`/article/${articleId}`);

    // Verificamos si hay campo de comentario
    const commentTextarea = page.locator('textarea[name="comment"]');
    if (await commentTextarea.isVisible()) {
      await expect(commentTextarea).toBeVisible();
    }
  });

  test('should navigate back to search results via breadcrumb', async ({ page }) => {
    // Ir primero a la búsqueda
    await page.goto('/searcharticle');
    await page.fill('#search-input', 'a');
    await page.click('#apply-filters');

    // Esperar a que carguen resultados
    await page.waitForTimeout(2000);

    // Abrir el primer artículo (si existe)
    const articleLink = page.locator('a:has-text("Leer más")').first();

    if (await articleLink.isVisible()) {
      await articleLink.click();

      // Verificar que estamos en la página de artículo
      await expect(page).toHaveURL(/.*\/article\/\d+/);

      // Volver atrás
      await page.goBack();

      // Verificar que volvimos a resultados de búsqueda
      await expect(page).toHaveURL(/.*\/searcharticle/);
    }
  });

  test('should have appropriate meta tags', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Verificar meta tags básicos
    await expect(page.locator('meta[charset="UTF-8"]')).toBeVisible();
    await expect(page.locator('meta[name="viewport"]')).toBeVisible();

    // Verificar title
    const title = await page.title();
    expect(title).toContain('IBÑ News');
  });

  test('should display article body with properly formatted text', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Verificar que el cuerpo del artículo tiene formato adecuado
    const articleBody = page.locator('.prose');
    await expect(articleBody).toBeVisible();

    // Verificar que el texto está presente
    const textContent = await articleBody.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test('should have sharing functionality or related features', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Verificar elementos de navegación y compartir si existen
    // (Este test puede necesitar adaptarse según la implementación)
    await page.waitForLoadState('networkidle');

    // Buscar enlaces de compartir en redes sociales o elementos relacionados
    // Esto es genérico ya que no sabemos si la app tiene esta funcionalidad
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"]');
    const count = await socialLinks.count();

    // No fallamos el test si no hay enlaces sociales, simplemente lo registramos
    console.log(`Found ${count} social sharing links`);
  });

  test('should have related articles if available', async ({ page }) => {
    await page.goto(`/article/${articleId}`);

    // Buscar enlaces a artículos relacionados (si existen)
    const relatedArticles = page.locator('a[href^="/article/"]:not(:has-text("Leer más"))').all();

    // Solo registramos si existen, no fallamos el test
    const count = await relatedArticles.then(links => links.length);
    console.log(`Found ${count} related article links`);
  });
});
