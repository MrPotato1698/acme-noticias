import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { loginAsAdmin } from '../helpers/test-utils';

test.describe('Admin Article Management - Administración de Artículos', () => {
  test.beforeEach(async ({ page }) => {
    // Login como administrador antes de cada test
    await loginAsAdmin(page);
    await page.goto('/admin/admin-article');
  });

  test('should load admin article page', async ({ page }) => {
    // Verificar título y estructura básica
    await expect(page).toHaveTitle(/IBÑ News - Administrar Articulos/);
    await expect(page.locator('h1:has-text("Administar Articulos")')).toBeVisible();
  });

  test('should display article table with headers', async ({ page }) => {
    // Verificar que la tabla de artículos está presente
    const tableHeaders = page.locator('th');

    // Verificar que hay encabezados para título, cuerpo, categorías, etc.
    await expect(tableHeaders.filter({ hasText: 'Titulo' })).toBeVisible();
    await expect(tableHeaders.filter({ hasText: 'Cuerpo' })).toBeVisible();
    await expect(tableHeaders.filter({ hasText: 'Categorias' })).toBeVisible();
    await expect(tableHeaders.filter({ hasText: 'Publicado' })).toBeVisible();
    await expect(tableHeaders.filter({ hasText: 'Autor' })).toBeVisible();
    await expect(tableHeaders.filter({ hasText: 'Acciones' })).toBeVisible();
  });

  test('should have button to add new articles', async ({ page }) => {
    // Verificar que existe botón para añadir artículos
    const addButton = page.locator('a:has-text("Añadir nuevos articulos")');
    await expect(addButton).toBeVisible();

    // Verificar que el botón lleva a la página correcta
    expect(await addButton.getAttribute('href')).toBe('/newarticle');
  });

  test('should display article entries and edit actions', async ({ page }) => {
    // Esperar a que carguen los artículos
    await page.waitForTimeout(2000);

    // Verificar si hay artículos en la tabla
    const articleRows = page.locator('tbody tr');
    const count = await articleRows.count();

    if (count > 0) {
      // Verificar que el primer artículo tiene botones de acción
      await expect(page.locator('a:has-text("Modificar")').first()).toBeVisible();
      await expect(page.locator('a:has-text("Comentarios")').first()).toBeVisible();
      await expect(page.locator('button:has-text("Borrar")').first()).toBeVisible();
    } else {
      console.log('No article entries found for testing');
    }
  });

  test('should navigate to edit article page when "Modificar" is clicked', async ({ page }) => {
    // Esperar a que carguen los artículos
    await page.waitForTimeout(2000);

    // Buscar el primer botón de modificar
    const editButton = page.locator('a:has-text("Modificar")').first();

    if (await editButton.isVisible()) {
      // Hacer clic en el botón y esperar la navegación simultáneamente
      await Promise.all([editButton.click(), page.waitForURL(/.*\/admin\/article\/\d+$/)]);

      // Verificar que estamos en la página de edición
      await expect(page).toHaveURL(/.*\/admin\/article\/\d+$/);

      // Verificar elementos básicos del formulario de edición
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    } else {
      console.log('No edit button found for testing');
    }
  });

  test('should navigate to comments page when "Comentarios" is clicked', async ({ page }) => {
    // Esperar a que carguen los artículos
    await page.waitForTimeout(2000);

    // Buscar el primer botón de comentarios
    const commentsButton = page.locator('a:has-text("Comentarios")').first();

    if (await commentsButton.isVisible()) {
      // Hacer clic en el botón y esperar la navegación simultáneamente
      await Promise.all([
        commentsButton.click(),
        page.waitForURL(/.*\/admin\/article\/\d+\/commentaries$/)
      ]);

      // Verificar que estamos en la página de comentarios
      await expect(page).toHaveURL(/.*\/admin\/article\/\d+\/commentaries$/);
    } else {
      console.log('No comments button found for testing');
    }
  });

  test('should show confirmation dialog when delete button is clicked', async ({ page }) => {
    // Esperar a que carguen los artículos
    await page.waitForTimeout(2000);

    // Buscar el primer botón de borrar
    const deleteButton = page.locator('button:has-text("Borrar")').first();

    if (await deleteButton.isVisible()) {
      // Esperar el diálogo de confirmación
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('seguro');
        await dialog.dismiss(); // Cancelar para no borrar realmente
      });

      // Hacer clic en el botón de borrar
      await deleteButton.click();
    } else {
      console.log('No delete button found for testing');
    }
  });

  test('should have working pagination if multiple articles exist', async ({ page }) => {
    // Esperar a que carguen los artículos
    await page.waitForTimeout(2000);

    // Buscar paginación
    const pagination = page.locator('nav[aria-label="Paginación"]');

    if (await pagination.isVisible()) {
      // Verificar que hay elementos básicos de paginación
      await expect(pagination.locator('li a')).toBeVisible();
    } else {
      console.log('Pagination not visible or not available');
    }
  });
});

// Tests para la página de creación de nuevos artículos
test.describe('Article Creation - Creación de Artículos', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test usando la función centralizada
    await loginAsAdmin(page);
    await page.goto('/newarticle');
  });

  test('should load new article page', async ({ page }) => {
    await expect(page).toHaveTitle(/IBÑ News/);
    await expect(page.locator('form#articleForm')).toBeVisible();
  });

  test('should display article creation form with all fields', async ({ page }) => {
    // Verificar campos del formulario
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();
    await expect(page.locator('input[type="checkbox"][name="categories[]"]')).toBeVisible();
    await expect(page.locator('#dropzone')).toBeVisible();

    // Verificar botón de publicar
    await expect(page.locator('button[type="submit"]:has-text("Publicar")')).toBeVisible();
  });

  test('should show validation for missing required fields', async ({ page }) => {
    // Intentar enviar el formulario sin completar campos
    await page.click('button[type="submit"]:has-text("Publicar")');

    // Verificar que los campos requeridos muestran validación
    const titleField = page.locator('#title');
    const contentField = page.locator('#content');

    await expect(titleField).toHaveAttribute('required', '');
    await expect(contentField).toHaveAttribute('required', '');
  });

  test('should allow category selection', async ({ page }) => {
    // Buscar categorías disponibles
    const categoryCheckboxes = page.locator('input[type="checkbox"][name="categories[]"]');
    const count = await categoryCheckboxes.count();

    if (count > 0) {
      // Seleccionar primera categoría
      await categoryCheckboxes.first().click();
      await expect(categoryCheckboxes.first()).toBeChecked();
    } else {
      console.log('No categories available for selection');
    }
  });

  test('should have working dropzone for images', async ({ page }) => {
    // Verificar que el dropzone está presente
    const dropzone = page.locator('#dropzone');
    await expect(dropzone).toBeVisible();

    // Verificar que el input de archivo está oculto
    const fileInput = page.locator('#images');
    await expect(fileInput).toBeHidden();

    // Verificar que hay instrucciones visibles
    await expect(page.locator('text=Arrastra y suelta imágenes')).toBeVisible();
  });

  test('should submit form with minimal valid data', async ({ page }) => {
    // Rellenar formulario con datos mínimos
    await page.fill('#title', 'Test Article Title');
    await page.fill('#content', 'This is test article content for automated testing.');

    // Seleccionar una categoría si hay disponibles
    const categoryCheckboxes = page.locator('input[type="checkbox"][name="categories[]"]');
    if (await categoryCheckboxes.count() > 0) {
      await categoryCheckboxes.first().click();
    }

    // Simular subida de archivo
    // Nota: Este es un mock simplificado, en tests reales se necesitaría más configuración
    await page.evaluate(() => {
      const imgInput = document.getElementById('imgurl');
      if (imgInput) {
        (imgInput as HTMLInputElement).value = 'mock-image-url.jpg';
      }
    });

    // Interceptar la petición de envío
    await page.route('**/api/article/newarticle', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 999 })
      });
    });

    // Enviar formulario
    await page.click('button[type="submit"]:has-text("Publicar")');

    // Verificar redirección (esto depende de cómo esté implementada la app)
    await expect(page).toHaveURL(/.*\/article\/999/);
  });
});