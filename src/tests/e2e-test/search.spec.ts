import { test, expect } from '@playwright/test';

test.describe('Search Functionality - Funcionalidad de Búsqueda', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/searcharticle');
  });

  test('should load search page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('IBÑ News - Buscar Articulos');
  });

  test('should display search sidebar with all filters', async ({ page }) => {
    // Verificar título del sidebar
    await expect(page.locator('h2:has-text("Filtros de búsqueda")')).toBeVisible();

    // Verificar campo de búsqueda por palabra clave
    await expect(page.locator('#search-input')).toBeVisible();

    // Verificar filtros de ordenamiento
    await expect(page.locator('h3:has-text("Ordenar por")')).toBeVisible();
    await expect(page.locator('#sort-newest')).toBeVisible();
    await expect(page.locator('#sort-oldest')).toBeVisible();

    // Verificar filtro de categorías
    await expect(page.locator('h3:has-text("Categorías")')).toBeVisible();

    // Verificar filtro de redactor
    await expect(page.locator('h3:has-text("Redactor")')).toBeVisible();
    await expect(page.locator('#author-search')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    await expect(page.locator('#apply-filters')).toBeVisible();
    await expect(page.locator('#clear-filters')).toBeVisible();
  });

  test('should perform keyword search', async ({ page }) => {
    // Escribir en el campo de búsqueda
    await page.fill('#search-input', 'noticia');

    // Hacer clic en aplicar filtros
    await page.click('#apply-filters');

    // Verificar que la URL se actualiza con el parámetro de búsqueda
    await expect(page).toHaveURL(/.*q=noticia.*/);

    // Verificar que se muestra el filtro aplicado
    await expect(page.locator('text=Búsqueda: noticia')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    // Seleccionar una categoría (si hay alguna disponible)
    const categoryRadio = page.locator('input[name="category"]').nth(1); // Primera categoría real

    if (await categoryRadio.isVisible()) {
      await categoryRadio.click();
      await page.click('#apply-filters');

      // Verificar que la URL se actualiza
      await expect(page).toHaveURL(/.*category=\d+.*/);
    }
  });

  test('should change sort order', async ({ page }) => {
    // Seleccionar "Más antiguas primero"
    await page.click('#sort-oldest');
    await page.click('#apply-filters');

    // Verificar que la URL se actualiza
    await expect(page).toHaveURL(/.*sort=oldest.*/);

    // Verificar que se muestra el filtro aplicado
    await expect(page.locator('text=Orden: Más antiguas primero')).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    // Aplicar algunos filtros primero
    await page.fill('#search-input', 'test');
    await page.click('#sort-oldest');
    await page.click('#apply-filters');

    // Limpiar filtros
    await page.click('#clear-filters');

    // Verificar que la URL vuelve a la página base
    await expect(page).toHaveURL(/.*\/searcharticle$/);
  });

  test('should display search results', async ({ page }) => {
    // Realizar una búsqueda
    await page.fill('#search-input', 'a'); // Búsqueda amplia
    await page.click('#apply-filters');

    // Verificar que se muestran resultados o mensaje de no resultados
    const resultsOrMessage = page.locator('.space-y-6, text=No se encontraron resultados');
    await expect(resultsOrMessage).toBeVisible();
  });

  test('should show pagination when applicable', async ({ page }) => {
    // Realizar una búsqueda amplia
    await page.fill('#search-input', 'a');
    await page.click('#apply-filters');

    // Esperar a que se carguen los resultados
    await page.waitForTimeout(2000);

    // Verificar si hay paginación
    const pagination = page.locator('nav[aria-label="Paginación"]');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should navigate to article detail from search results', async ({ page }) => {
    // Realizar una búsqueda
    await page.fill('#search-input', 'a');
    await page.click('#apply-filters');

    // Esperar a que se carguen los resultados
    await page.waitForTimeout(2000);

    // Buscar el primer enlace "Leer más"
    const readMoreLink = page.locator('a:has-text("Leer más")').first();

    if (await readMoreLink.isVisible()) {
      await readMoreLink.click();
      await expect(page).toHaveURL(/.*\/article\/\d+/);
    }
  });

  test('should show filter summary when filters are applied', async ({ page }) => {
    // Aplicar múltiples filtros
    await page.fill('#search-input', 'test');
    await page.click('#sort-oldest');
    await page.click('#apply-filters');

    // Verificar que se muestra el resumen de filtros
    await expect(page.locator('h2:has-text("Filtros aplicados:")')).toBeVisible();
    await expect(page.locator('text=Búsqueda: test')).toBeVisible();
  });
});
