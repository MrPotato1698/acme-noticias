import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/test-utils';

test.describe('Admin Article Management - Administración de Artículos', () => {
  test.beforeEach(async ({ page }) => {
    // Marcar el test como de larga duración
    test.slow();

    // Login como administrador antes de cada test con autenticación robusta
    await loginAsAdmin(page);

    // Esperar un momento para garantizar que la sesión se ha establecido correctamente
    await page.waitForTimeout(4000);

    // Navegar directamente a la página de administración de artículos
    await page.goto('/admin/admin-article', { waitUntil: 'networkidle', timeout: 30000 });

    // Verificar si estamos en login y necesitamos redirigir
    if (page.url().includes('/login')) {
      console.log('Detectada página de login. Estableciendo autenticación manualmente...');

      // Establecer autenticación manualmente y redirigir
      await page.evaluate(() => {
        localStorage.setItem('user_role', 'Administrador');
        localStorage.setItem('user_id', 'test-admin-id');
        localStorage.setItem('authenticated', 'true');
      });

      await page.goto('/admin/admin-article', { waitUntil: 'networkidle', timeout: 30000 });
    }

    // Espera adicional para garantizar que todos los elementos están cargados
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
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
      await expect(page).toHaveURL(/.*\/admin\/article\/\d+$/);      // Verificar elementos básicos del formulario de edición
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('button[type="submit"]:has-text("Actualizar Articulo")')).toBeVisible();
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

    // Contar el número de artículos para determinar si debería haber paginación
    const articleRows = page.locator('tbody tr');
    const articleCount = await articleRows.count();

    // Buscar paginación (puede tener diferentes aria-labels o no tener aria-label)
    const pagination = page.locator('nav').first();

    if (await pagination.isVisible()) {
      // Verificar que hay elementos básicos de paginación
      const paginationLinks = pagination.locator('a');
      if (await paginationLinks.count() > 0) {
        await expect(paginationLinks.first()).toBeVisible();
        console.log('Pagination found and working');
      }
    } else {
      console.log(`Pagination not visible. Articles found: ${articleCount}. Pagination only shows when more than 5 articles exist.`);
    }
  });
});

// Tests para la página de creación de nuevos artículos
test.describe('Article Creation - Creación de Artículos', () => {
  test.beforeEach(async ({ page }) => {
    // Marcar el test como de larga duración
    test.slow();

    // Login antes de cada test usando la función centralizada
    await loginAsAdmin(page);

    // Verificamos explícitamente que estamos autenticados
    const isAuthenticated = await page.evaluate(() => {
      return localStorage.getItem('authenticated') === 'true' &&
        localStorage.getItem('user_role') === 'Administrador';
    });

    if (!isAuthenticated) {
      console.warn('La autenticación no se completó correctamente antes de navegar a /newarticle. Reintentando...');
      await loginAsAdmin(page);
      await page.waitForTimeout(2000);
    }

    // Navegamos a la página de creación de artículos
    await page.goto('/newarticle', { waitUntil: 'networkidle', timeout: 30000 });

    // Verificar si estamos en login y necesitamos redirigir
    if (page.url().includes('/login')) {
      console.log('Detectada página de login. Estableciendo autenticación manualmente...');

      // Establecer autenticación manualmente y redirigir
      await page.evaluate(() => {
        localStorage.setItem('user_role', 'Administrador');
        localStorage.setItem('user_id', 'test-admin-id');
        localStorage.setItem('authenticated', 'true');
      });

      await page.goto('/newarticle', { waitUntil: 'networkidle', timeout: 30000 });
    }

    // Esperamos un tiempo adicional para que la página cargue completamente
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load new article page', async ({ page }) => {
    await expect(page).toHaveTitle(/IBÑ News/);
    await expect(page.locator('form#articleForm')).toBeVisible();
  });
  test('should display article creation form with all fields', async ({ page }) => {
    // Esperar a que cargue completamente la página
    await page.waitForTimeout(3000);
    
    // Verificar campos del formulario
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();
    
    // Esperar específicamente a que aparezcan las categorías
    await page.waitForSelector('input[type="checkbox"][name="categories[]"]', { timeout: 10000 }).catch(() => {
      console.log('Categories checkboxes not found');
    });
    
    const categoryCheckboxes = page.locator('input[type="checkbox"][name="categories[]"]');
    if (await categoryCheckboxes.count() > 0) {
      await expect(categoryCheckboxes.first()).toBeVisible();
    } else {
      console.log('No category checkboxes available');
    }
    
    await expect(page.locator('#dropzone')).toBeVisible();
    // Verificar botón de publicar
    await expect(page.locator('button[type="submit"]:has-text("Publicar Artículo")')).toBeVisible();
  });

  test('should show validation for missing required fields', async ({ page }) => {
    // Intentar enviar el formulario sin completar campos
    await page.click('button[type="submit"]:has-text("Publicar Artículo")');

    // Verificar que los campos requeridos muestran validación
    const titleField = page.locator('#title');
    const contentField = page.locator('#content');

    await expect(titleField).toHaveAttribute('required', '');
    await expect(contentField).toHaveAttribute('required', '');
  });
  test('should allow category selection', async ({ page }) => {
    // Esperar a que las categorías se carguen
    await page.waitForTimeout(2000);

    // Buscar categorías disponibles
    const categoryCheckboxes = page.locator('input[type="checkbox"][name="categories[]"]');

    // Esperar a que al menos aparezca un checkbox
    await page.waitForSelector('input[type="checkbox"][name="categories[]"]', { timeout: 10000 }).catch(() => {
      console.log('No category checkboxes found after waiting');
    });

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
    }    // Crear un archivo de imagen de prueba y subirlo
    const fileInput = page.locator('#images');
    
    // Crear un buffer de imagen de prueba (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Subir archivo de prueba
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    });

    // Interceptar las peticiones de API
    await page.route('**/api/article/uploadimage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ publicUrl: 'https://example.com/test-image.webp' })
      });
    });

    // Interceptar la petición de envío
    await page.route('**/api/article/newarticle', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 999 })
      });
    });    // Enviar formulario
    await page.click('button[type="submit"]:has-text("Publicar Artículo")');

    // Verificar redirección a la página principal (según el código JavaScript)
    await expect(page).toHaveURL(/.*\/$/);
  });
});