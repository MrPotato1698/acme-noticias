import { test, expect } from '@playwright/test';

test.describe('Funcionalidad de Búsqueda', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/searcharticle');
  });

  test('debería cargar la página de búsqueda con el título correcto', async ({ page }) => {
    await expect(page).toHaveTitle('IBÑ News - Buscar Articulos');
  });

  test('debería mostrar la barra lateral de búsqueda con todos los filtros', async ({ page }) => {
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
  test('debería mostrar los botones de acción', async ({ page }) => {
    await expect(page.locator('#apply-filters')).toBeVisible();
    await expect(page.locator('#clear-filters')).toBeVisible();
  });

  test('debería filtrar por categoría', async ({ page }) => {
    // Seleccionar una categoría (si hay alguna disponible)
    const categoryRadio = page.locator('input[name="category"]').nth(1); // Primera categoría real

    if (await categoryRadio.isVisible()) {
      await categoryRadio.click();
      await page.click('#apply-filters');

      // Verificar que la URL se actualiza
      await expect(page).toHaveURL(/.*category=\d+.*/);
    }
  });
  test('debería cambiar el orden de clasificación', async ({ page }) => {
    // Seleccionar "Más antiguas primero"
    await page.click('#sort-oldest');
    await page.click('#apply-filters');

    // Esperar a que la URL se actualice
    await page.waitForURL(/.*sort=oldest.*/, { timeout: 10000 });

    // Verificar que la URL se actualiza
    await expect(page).toHaveURL(/.*sort=oldest.*/);

    // Verificar que se muestra el filtro aplicado
    await expect(page.locator('span:has-text("Orden: Más antiguas primero")')).toBeVisible();
  });

  test('debería limpiar todos los filtros', async ({ page }) => {
    // Aplicar algunos filtros primero
    await page.fill('#search-input', 'test');
    await page.click('#sort-oldest');
    await page.click('#apply-filters');

    // Limpiar filtros
    await page.click('#clear-filters');

    // Verificar que la URL vuelve a la página base
    await expect(page).toHaveURL(/.*\/searcharticle$/);
  });
  test('debería mostrar resultados de búsqueda', async ({ page }) => {
    // Realizar una búsqueda
    await page.fill('#search-input', 'a'); // Búsqueda amplia
    await page.click('#apply-filters');

    // Esperar a que se carguen los resultados
    await page.waitForTimeout(2000);

    // Verificar que se muestran resultados o mensaje de no resultados
    const resultsSection = page.locator('.space-y-6');
    const noResultsMessage = page.locator('text=No se encontraron resultados para tu búsqueda');
    
    // Debe aparecer al menos uno de los dos
    await expect(resultsSection.or(noResultsMessage)).toBeVisible();
  });

  test('debería mostrar paginación cuando sea aplicable', async ({ page }) => {
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

  test('debería navegar al detalle del artículo desde los resultados de búsqueda', async ({ page }) => {
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
    }  });
});
